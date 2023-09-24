import { OpenAI } from "openai";
import { PageProcessor } from "@app/server/page-processor";
import { Database } from "@deepkit/orm";
import { CommunityMessage, CommunityMessageVote, projectMap } from "@app/common/models";
import { AnyThreadChannel, ButtonStyle, ChannelType, Client, ComponentType, Message } from "discord.js";
import { Logger } from "@deepkit/logger";
import { asyncOperation } from "@deepkit/core";
import { ReplaySubject, Subject } from "rxjs";
import { eachValueFrom } from "rxjs-for-await";
import { AppConfig } from "@app/server/config";
import { Url } from "@app/server/url";

export async function testQuestions(question: string, ml: Questions) {
    const message = new CommunityMessage('test', 'test', question);
    const response = await ml.askDoc(message);

    console.log('Type:', response.type);
    console.log('Title:', response.title);
    for await (const m of eachValueFrom(response.text)) {
        process.stdout.write(m);
    }
}

const system = `
You are a chat bot that helps people answer questions and help people understand a TypeScript framework called Deepkit.
You are allowed to talk also about other technology topics, but you should focus on Deepkit. Keep politics out of the conversation.
You are an Apple fan and you love TypeScript. When someone talks about hardware, praise Apple's Macbooks. When someone talks about programming languages, praise TypeScript.

You answer/output always in this format:

\`\`\`
type: <type>
category: <category>
title: <short title of answer>
text: <your answer>
\`\`\`

<category> can be one of: ${Object.keys(projectMap).join(', ')}.

<type> can either be "message", "edit", "refused". Per default you use "message". If you don't know the answer or if it's out of scope, you use "refused".

If the user corrects you, you use "edit" as type and edit your previously send message/output. If the user asks a new question, use the type "message" and generate a new title.

Some information about Deepkit:

Deepkit is a very modular TypeScript framework that offers a rich set of integrated libraries, such as a dependency injection container,
 ORM, CLI framework, HTTP router, RPC framework, and an event system, all built upon the concept of retaining runtime types.
 This holistic framework is crafted to simplify the development of intricate software, positioning it at the forefront of solutions for the TypeScript ecosystem's contemporary challenges.

Keep the output formatted as described. You can use markdown in the text.
`;

export type StreamAnswerResponse = { title: string, type: string, category: string, text: ReplaySubject<string> };

const tooLongText = `...\n\nThe answer is too long for Discord, see Browser link below.`;
const uuidV4Length = 36;

class MessageStreamer {
    protected text = '';
    protected lastSend = Date.now() - 1100;
    protected tooLong = false;

    constructor(
        public logger: Logger,
        public message: Message<true>,
    ) {
    }

    async send(subject: Subject<string>): Promise<string> {
        for await (const r of eachValueFrom(subject)) {
            await this.feed(r);
        }
        await this.feed('', true);
        return this.text;
    }

    async feed(r: string, last = false) {
        this.text += r;
        await this.checkIfNext(last);
    }

    async checkIfNext(last = false): Promise<void> {
        const timeSinceLastSend = Date.now() - this.lastSend;
        // this.logger.log('timeSinceLastSend', { last, timeSinceLastSend, text: this.text, tooLong: this.tooLong });
        if (this.tooLong) return;
        if (!last && timeSinceLastSend < 1000) {
            return;
        }

        let textToSend = this.text;
        const puffer = 20;
        if (this.text.length + tooLongText.length + uuidV4Length + puffer > 2000) {
            textToSend = this.text.substring(0, 2000 - (tooLongText.length + uuidV4Length + puffer));
            this.tooLong = true;
        }

        try {
            textToSend = textToSend + (last ? '' : ' ...');
            await this.message.edit(textToSend);
        } catch (error) {
            this.logger.warning('Discord error sending text', error);
        }
        this.lastSend = Date.now();
    }
}

function streamAnswerToDiscord(logger: Logger, client: Client, database: Database, messageToEdit: CommunityMessage, response: StreamAnswerResponse) {
    asyncOperation(async (resolve) => {
        logger.log('Editing message', messageToEdit.id, messageToEdit.discordMessageId);
        const discordAnswer = await findMessage(logger, client, messageToEdit);
        if (!discordAnswer) throw new Error('Message not found');
        const streamer = new MessageStreamer(logger, discordAnswer);
        logger.log('Found answer. Stream changes to message ' + discordAnswer.id);
        const text = await streamer.send(response.text);

        logger.log('Stream done. Text: ' + text);
        messageToEdit.setTitle(response.title);
        messageToEdit.category = response.category;
        messageToEdit.content = text;
        await database.persist(messageToEdit);
    }).catch(error => {
        logger.error('Sync to discord failed', error);
    });
}

function streamAnswerToDatabase(logger: Logger, database: Database, message: CommunityMessage, subject: Subject<string>) {
    asyncOperation(async (resolve) => {
        //stream to database
        let text = '';
        for await (const r of eachValueFrom(subject)) {
            text += r;
        }
        message.content = text;
        await database.persist(message);
    }).catch(error => {
        logger.error('Could not persist answer', error);
    });
}

async function findMessage(logger: Logger, client: Client, communityMessage: CommunityMessage): Promise<Message<true> | undefined> {
    if (!communityMessage.discordMessageId) {
        logger.warning('Message has no discord messageId', communityMessage.discordMessageId);
        return;
    }

    if (!communityMessage.discordChannelId && !communityMessage.discordThreadId) {
        logger.warning('Message has neither discord channel nor thread id', communityMessage.id);
        return;
    }

    const channelId = communityMessage.discordThreadId || communityMessage.discordChannelId || '';
    const channel = channelId ? await client.channels.fetch(channelId) : undefined;
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildPublicThread && channel.type !== ChannelType.GuildPrivateThread)) {
        logger.warning('Send to discord: Channel not found or wrong type', channelId, { type: channel?.type });
        return;
    }

    return await channel.messages.fetch(communityMessage.discordMessageId);
}

export class Questions {
    constructor(
        private openAi: OpenAI,
        private pageProcessor: PageProcessor,
        private client: Client,
        private logger: Logger,
        private database: Database,
        private discordChannel: AppConfig['discordChannel'],
        private model: AppConfig['openaiModel'],
        private url: Url,
    ) {
        this.logger = logger.scoped('Questions');
    }

    async vote(messageId: number, userId: string, voteChange: number): Promise<CommunityMessage> {
        const message = await this.database.query(CommunityMessage).filter({ id: messageId }).findOne();
        let vote = await this.database.query(CommunityMessageVote).filter({ message, userId }).findOneOrUndefined();
        if (vote) {
            message.votes -= vote.vote;
            vote.vote = voteChange;
        } else {
            vote = new CommunityMessageVote(message, userId);
            vote.vote = voteChange;
        }
        message.votes += voteChange;

        await this.database.persist(message, vote);

        return message;
    }

    async ask(communityMessage: CommunityMessage, references?: CommunityMessage, url?: string): Promise<StreamAnswerResponse & { message: CommunityMessage }> {
        if (!this.client.user) {
            this.logger.error('Discord bot not logged in');
            throw new Error('Discord bot not logged in');
        }

        const messages = communityMessage.thread ? await this.database.query(CommunityMessage).filter({ thread: communityMessage.thread }).orderBy('created', 'asc').find() : [];
        if (communityMessage.thread) {
            messages.unshift(communityMessage.thread);
        }
        const response = await this.askDoc(communityMessage, messages, url);

        communityMessage.setTitle(response.title);
        communityMessage.category = response.category;

        if (response.type === 'edit') {
            communityMessage.type = 'edit';
            await this.database.persist(communityMessage);

            //instead of sending a new message, we edit the previous one (the last one in messages from the assistant)
            let messageToEdit: CommunityMessage | undefined = references;
            if (!references) {
                for (const m of messages) if (m.assistant) messageToEdit = m;
            }

            if (!messageToEdit) {
                this.logger.warning('Got an edit answer, but no assistant message in the thread.');
                throw new Error('Message not found');
            }

            streamAnswerToDatabase(this.logger, this.database, messageToEdit, response.text);
            streamAnswerToDiscord(this.logger, this.client, this.database, messageToEdit, response);

            return { ...response, message: messageToEdit };
        }

        const answer = new CommunityMessage(this.client.user.id, this.client.user.displayName, '', communityMessage.thread ?? communityMessage);
        answer.order = communityMessage.order + 1;
        answer.type = 'message';
        answer.category = response.category;
        answer.setTitle(response.title);
        answer.discordUserAvatarUrl = this.client.user.avatarURL() || '';
        answer.assistant = true;

        await this.database.persist(communityMessage, answer);

        streamAnswerToDatabase(this.logger, this.database, answer, response.text);

        asyncOperation(async (resolve) => {
            if (!communityMessage.discordMessageId) {
                //create a new message in `community` channel
                const channel = await this.client.channels.fetch(communityMessage.discordThreadId || this.discordChannel);
                if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildPublicThread && channel.type !== ChannelType.GuildPrivateThread)) {
                    this.logger.warning('Creating message failed. Channel not found or wrong type', this.discordChannel, { type: channel?.type });
                    throw new Error('Channel not found or wrong type');
                }

                const message = await channel.send({
                    content: `Website User: ${communityMessage.content}`,
                });
                communityMessage.discordMessageId = message.id;
                communityMessage.discordChannelId = channel.id;
            }

            if (communityMessage.discordMessageId) {
                try {
                    //now create thread/answer on last discord message
                    await this.database.persist(communityMessage); //discord needs the primary key to create URLs
                    const res = await this.sendToDiscord(
                        response,
                        communityMessage,
                        answer
                    );
                    if (!res) throw new Error('Could not send to discord');

                    communityMessage.discordThreadId = res.threadId;
                    answer.discordThreadId = res.threadId;
                    answer.discordMessageId = res.discordMessageId;
                    await this.database.persist(communityMessage, answer);
                } finally {
                    resolve(undefined);
                }
            }
        }).catch(error => {
            this.logger.error('Sync to discord failed', error);
        });

        return { ...response, message: answer };
    }

    async sendToDiscord(response: StreamAnswerResponse, communityMessage: CommunityMessage, answer: CommunityMessage) {
        let fetched = communityMessage.discordThreadId ? await this.client.channels.fetch(communityMessage.discordThreadId) : undefined;
        let discordThread: AnyThreadChannel | undefined = fetched && (fetched.type === ChannelType.GuildPublicThread || fetched.type === ChannelType.GuildPrivateThread) ? fetched : undefined;

        const message = await findMessage(this.logger, this.client, communityMessage);
        if (!message) {
            this.logger.warning('Message not found', communityMessage.discordMessageId);
            return;
        }

        this.logger.log('lets go');

        if (!discordThread) {
            discordThread = await message.startThread({
                name: response.title,
                autoArchiveDuration: 60, // auto-archive after 1 hour
            });
        }

        const discordMessage = await discordThread.send({
            content: 'Thinking ...',
            components: [{
                type: ComponentType.ActionRow,
                components: [{
                    type: ComponentType.Button,
                    label: 'Open in browser',
                    style: ButtonStyle.Link,
                    url: this.url.getCommunityQuestionUrl(communityMessage)
                }, {
                    type: ComponentType.Button,
                    label: 'Upvote',
                    style: ButtonStyle.Success,
                    customId: `upvote_answer:${communityMessage.id}`
                }, {
                    type: ComponentType.Button,
                    label: 'Downvote',
                    style: ButtonStyle.Danger,
                    customId: `downvote_answer:${communityMessage.id}`
                }]
            }],
            // embeds: [{
            //     title: 'Deepkit Documentation',
            //     url: `https://deepkit.io/documentation/community-questions/${message.id}`,
            // }]
        });
        answer.discordUrl = discordMessage.url;
        const streamer = new MessageStreamer(this.logger, discordMessage);
        const text = await streamer.send(response.text);
        return { title: response.title, type: response.type, text, threadId: discordThread?.id, discordMessageId: discordMessage.id };
    }

    async askDoc(message: CommunityMessage, existingMessages: CommunityMessage[] = [], url?: string): Promise<StreamAnswerResponse> {
        const page = url ? await this.pageProcessor.read(url) : '';

        const subject = new ReplaySubject<string>();
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

        let prompt = `
${pre}
${message.content}
        `;

        const messages: { role: 'system' | 'user' | 'assistant' | 'function', content: string }[] = [
            { role: 'system', content: system },
        ];

        for (const m of existingMessages) {
            if (m.assistant) {
                messages.push({
                    role: 'assistant', content: `
type: answer
title: ${m.title}
text: ${m.content.substring(0, 2000)}
`
                });
            } else {
                messages.push({ role: 'user', content: `User @${m.userDisplayName}: ${m.content.substring(0, 1000)}` });
            }
        }
        messages.push({ role: 'user', content: `User @${message.userDisplayName}: ${prompt}` });

        console.log('Debug prompt');
        for (const m of messages) {
            console.log('   ', m.role, m.content.slice(0, 200).replace(/\n/g, '\\n'));
        }

        const completion = await this.openAi.chat.completions.create({ messages, model: this.model, stream: true }, { stream: true });
        let type = '';
        let title = '';
        let category = '';
        let buffer = '';
        let sendText = false;
        let firstSend = true;

        await asyncOperation((resolve) => {
            (async () => {
                for await (const message of completion) {
                    let text = message.choices[0].delta.content || '';

                    if (!sendText && !title) {
                        buffer += text;
                        if (buffer.includes('\ntext:')) {
                            const typeStart = buffer.indexOf('type:');
                            const titleStart = buffer.indexOf('title:');
                            const answerStart = buffer.indexOf('text:');
                            const categoryStart = buffer.indexOf('category:');
                            type = buffer.substring(typeStart + 5, titleStart).trim();
                            title = buffer.substring(titleStart + 6, answerStart).trim();
                            const restText = buffer.substring(answerStart + 'text:'.length).trimLeft();
                            if (categoryStart !== -1) {
                                category = buffer.substring(categoryStart + 9, buffer.indexOf('\n', categoryStart)).trim();
                            }
                            sendText = true;
                            text = restText;
                            resolve(undefined);
                        }
                    }

                    if (!sendText && buffer.length > 10 && buffer.indexOf('type:') === -1) {
                        //we got no correctly formatted answer, but we got some text. Send it.
                        sendText = true;
                        text = buffer;
                        resolve(undefined);
                    }

                    if (sendText) {
                        if (firstSend) {
                            if (text.trimLeft() === '') {
                                continue;
                            } else {
                                text = text.trimLeft();
                            }
                        }

                        firstSend = false;
                        subject.next(text);
                    }
                }
            })().then(() => subject.complete()).catch(error => subject.error(error));
        });

        return { title, type, category, text: subject };
    }
}
