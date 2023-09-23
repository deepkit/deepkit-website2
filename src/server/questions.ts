import { OpenAI } from "openai";
import { PageProcessor } from "@app/server/page-processor";
import { Database } from "@deepkit/orm";
import { CommunityMessage, CommunityThread } from "@app/common/models";
import { AnyThreadChannel, ButtonStyle, ChannelType, Client, ComponentType, Message } from "discord.js";
import { Logger } from "@deepkit/logger";
import { asyncOperation } from "@deepkit/core";
import { Subject } from "rxjs";
import { eachValueFrom } from "rxjs-for-await";

export async function testQuestions(question: string, ml: Questions) {
    const response = await ml.askDoc(question);

    let first = true;
    for await (const m of eachValueFrom(response)) {
        if (first) {
            console.log('Title:', m.title);
            first = false;
            process.stdout.write(m.text);
        } else {
            process.stdout.write(m.text);
        }
    }
}

const system = `
You are a documentation chat bot that helps the user to understand a TypeScript framework called Deepkit.

Deepkit is a very modular TypeScript framework that offers a rich set of integrated libraries, such as a dependency injection container,
 ORM, CLI framework, HTTP router, RPC framework, and an event system, all built upon the concept of retaining runtime types.
 This holistic framework is crafted to simplify the development of intricate software, positioning it at the forefront of solutions for the TypeScript ecosystem's contemporary challenges.

Deepkit is a robust TypeScript framework that offers a complete set of libraries such as a dependency injection container, an Object-Relational Mapping (ORM) system,
 a Command-Line Interface (CLI) framework, an HTTP router, a Remote Procedure Call (RPC) framework, and an event system. All of these components are designed to
 utilize runtime type information, providing a unified, type-safe development environment for building complex applications in the TypeScript ecosystem.

Try to answer with code examples using markdown syntax, but keep it short. Answer in 3 paragraphs or less.

You answer in the following format with a generated short title of the topic/summary of the question/answer:

Title: <Here is the generated title>
Answer:
<Here is the multi-line answer>
`;

export type StreamAnswerResponse = Subject<{ title: string, text: string }>;

const tooLongText = `...\n\nThe answer is too long for Discord, see Browser link below.`;
const uuidV4Length = 36;

export class Questions {
    constructor(
        private openAi: OpenAI,
        private pageProcessor: PageProcessor,
        private client: Client,
        private logger: Logger,
        private database: Database,
    ) {
        this.logger = logger.scoped('Questions');
    }

    async ask(thread: CommunityThread, question: CommunityMessage, url?: string): Promise<StreamAnswerResponse> {
        if (!this.client.user) {
            this.logger.error('Discord bot not logged in');
            throw new Error('Discord bot not logged in');
        }

        const messages = await this.database.query(CommunityMessage).filter({ question: thread }).find();
        const response = await this.askDoc(question.content, messages, url);

        const answer = new CommunityMessage(thread, this.client.user.id, this.client.user.displayName);
        const channelId = '1154848447116091494'; //test vs community

        if (!thread.discordMessageId) {
            //create a new thread in `community` channel
            const channel = await this.client.channels.fetch(channelId);
            if (!channel || channel.type !== ChannelType.GuildText) {
                this.logger.warning('Channel not found or wrong type', channelId, { type: channel?.type });
                throw new Error('Channel not found or wrong type');
            }

            const message = await channel.send({
                content: question.content
            });
            thread.discordMessageId = message.id;
            thread.discordChannelId = channel.id;
        }

        if (thread.discordMessageId) {
            asyncOperation(async (resolve) => {
                try {
                    const res = await this.sendToDiscord(
                        response,
                        thread,
                        answer
                    );
                    if (!res) throw new Error('Could not send to discord');

                    thread.title = res.title;
                    thread.discordThreadId = res.threadId;
                    answer.content = res.text;
                    answer.assistant = true;
                    await this.database.persist(thread, question, answer);
                } finally {
                    resolve(undefined);
                }
            }).catch(error => {
                this.logger.error('Sync to discord failed', error);
            });
        }

        return response;
    }

    async sendToDiscord(response: StreamAnswerResponse, thread: CommunityThread, answer: CommunityMessage) {
        let fetched = thread.discordThreadId ? await this.client.channels.fetch(thread.discordThreadId) : undefined;
        let discordThread: AnyThreadChannel | undefined = fetched && (fetched.type === ChannelType.GuildPublicThread || fetched.type === ChannelType.GuildPrivateThread) ? fetched : undefined;

        if (!thread.discordMessageId) {
            this.logger.warning('Message not found', thread.discordMessageId);
            return;
        }

        if (thread.discordThreadId && !discordThread) {
            this.logger.warning('Thread not found', thread.discordThreadId);
            return;
        }

        const channel = thread.discordChannelId ? await this.client.channels.fetch(thread.discordChannelId) : undefined;
        if (thread.discordChannelId && (!channel || channel.type !== ChannelType.GuildText)) {
            this.logger.warning('Channel not found or wrong type', thread.discordChannelId, { type: channel?.type });
            return;
        }

        const c = channel ?? discordThread;

        if (!c || (c.type !== ChannelType.GuildText && c.type !== ChannelType.GuildPublicThread && c.type !== ChannelType.GuildPrivateThread)) {
            this.logger.warning('Channel and thread not found', { channelId: thread.discordChannelId, threadId: thread.discordThreadId });
            return;
        }

        const message = await c.messages.fetch(thread.discordMessageId);
        if (!message) {
            this.logger.warning('Message not found', thread.discordMessageId);
            return;
        }

        this.logger.log('lets go');

        let text = '';
        let lastSend = Date.now() - 1100;
        let discordAnswer: Message<true> | undefined = undefined;
        let tooLong = false;

        const checkIfNext = async (last = false) => {
            const timeSinceLastSend = Date.now() - lastSend;
            this.logger.log('timeSinceLastSend', { last, timeSinceLastSend, text, tooLong });

            if (tooLong) return;
            if (!last && timeSinceLastSend < 1000) {
                return;
            }

            let textToSend = text;
            const puffer = 20;
            if (text.length + tooLongText.length + uuidV4Length + puffer > 2000) {
                textToSend = text.substring(0, 2000 - (tooLongText.length + uuidV4Length + puffer));
                tooLong = true;
            }

            try {
                textToSend = textToSend + (last ? '' : ' ...');

                if (!discordAnswer && discordThread) {
                    console.log('new message in thread');
                    discordAnswer = await discordThread.send({
                        content: textToSend,
                        components: [{
                            type: ComponentType.ActionRow,
                            components: [{
                                type: ComponentType.Button,
                                label: 'Open in browser',
                                style: ButtonStyle.Link,
                                url: `https://deepkit.io/documentation/questions/${thread.id}#${answer.id}`
                            }]
                        }],
                        // embeds: [{
                        //     title: 'Deepkit Documentation',
                        //     url: `https://deepkit.io/documentation/community-questions/${message.id}`,
                        // }]
                    });
                } else if (discordAnswer) {
                    await discordAnswer.edit(textToSend);
                }
            } catch (error) {
                this.logger.warning('Discord error sending text', error);
            }
            lastSend = Date.now();
        }

        let title = '';
        for await (const r of eachValueFrom(response)) {
            if (!title && !discordThread) {
                title = r.title;
                discordThread = await message.startThread({
                    name: r.title,
                    autoArchiveDuration: 60, // auto-archive after 1 hour
                });
            }
            text += r.text;
            await checkIfNext();
        }
        await checkIfNext(true);

        return { title, text, threadId: discordThread?.id };
    }

    async askDoc(prompt: string, existingMessages: CommunityMessage[] = [], url?: string): Promise<StreamAnswerResponse> {
        const page = url ? await this.pageProcessor.read(url) : '';
        const model = 'gpt-3.5-turbo-16k'; //see https://platform.openai.com/account/rate-limits

        const subject = new Subject<{ title: string, text: string }>();
        let pre = '';
        if (url) {
            pre = `
I'm on the page ${url} with following content:

\`\`\`
${page}
\`\`\`

----

`;
        }

        prompt = `
${pre}
${prompt}
        `;

        const messages: { role: 'system' | 'user' | 'assistant' | 'function', content: string }[] = [
            { role: 'system', content: system },
        ];

        for (const m of existingMessages) {
            messages.push({ role: m.assistant ? 'assistant' : 'user', content: m.content.substring(0, 2500) });
        }
        messages.push({ role: 'user', content: prompt });

        const completion = await this.openAi.chat.completions.create({ messages, model: model, stream: true }, { stream: true });
        let title = '';
        let buffer = '';

        (async () => {
            for await (const message of completion) {
                const text = message.choices[0].delta.content || '';

                if (!title) {
                    buffer += text;
                    if (buffer.includes('\nAnswer:')) {
                        const titleStart = buffer.indexOf('Title:');
                        const answerStart = buffer.indexOf('Answer:');
                        title = buffer.substring(titleStart + 6, answerStart).trim();
                        const restText = buffer.substring(answerStart + 7).trimLeft();
                        if (restText) {
                            subject.next({ title, text });
                        }
                    }
                } else {
                    subject.next({ title, text });
                }
            }

            if (!title) {
                subject.next({ title: 'Unknown topic', text: buffer });
            }
        })().then(() => subject.complete()).catch(error => subject.error(error));

        return subject;
    }
}
