import { rpc } from "@deepkit/rpc";
import { CommunityMessage, CommunityQuestion, CommunityQuestionListItem, Content, IndexEntry, Page } from "@app/common/models";
import { findParentPath } from "@deepkit/app";
import { readFile } from "fs/promises";
import { join } from "path";
import { Algolia } from "@app/server/algolia";
import { Observable } from "rxjs";
import { Questions } from "@app/server/questions";
import { MarkdownParser } from "@app/common/markdown";
import { PageProcessor } from "@app/server/page-processor";
import { Database } from "@deepkit/orm";
import { eachValueFrom } from "rxjs-for-await";
import { createReference } from "@deepkit/type";

function different(a?: string | Content, b?: string | Content): boolean {
    if ('string' === typeof a || 'undefined' === typeof a) {
        return a !== b;
    }

    if ('string' === typeof b || 'undefined' === typeof b) {
        return true;
    }

    if (a.tag !== b.tag) return true;
    if (a.children?.length !== b.children?.length) return true;

    if (a.children) {
        if (!b.children) return true;
        for (let i = 0; i < a.children.length; i++) {
            if (different(a.children[i], b.children[i])) return true;
        }
    }

    return false;
}

function createCommunityQuestion(
    markdownParser: MarkdownParser,
    question: CommunityMessage,
    messages: CommunityMessage[]
): CommunityQuestion {
    return {
        id: question.id,
        created: question.created,
        discordUrl: question.discordUrl,
        answerDiscordUrl: messages[0]?.discordUrl || '',
        category: question.category,
        votes: question.votes,
        title: question.title,
        allowEdit: false,
        user: question.userDisplayName,
        userAvatar: question.discordUserAvatarUrl,
        content: markdownParser.parse(question.content).body,
        messages: messages.map(v => ({ id: v.id, user: v.userDisplayName, userAvatar: v.discordUserAvatarUrl, content: markdownParser.parse(v.content).body })),
    }
}

@rpc.controller('/main')
export class MainController {
    constructor(
        private algolia: Algolia,
        private ml: Questions,
        private page: PageProcessor,
        private database: Database,
        private markdownParser: MarkdownParser,
    ) {
    }

    @rpc.action()
    async getQuestion(id: number, authId?: string): Promise<CommunityQuestion> {
        const message = await this.database.query(CommunityMessage).filter({ id }).findOne();
        const messages = await this.database.query(CommunityMessage).filter({ thread: message, type: { $ne: 'edit' } }).orderBy('created', 'asc').find();
        const question = createCommunityQuestion(this.markdownParser, message, messages);
        question.allowEdit = message.authId === authId;
        return question;
    }

    @rpc.action()
    async getQuestions(): Promise<{ top: CommunityQuestionListItem[], newest: CommunityQuestionListItem[] }> {
        const top = await this.database.query(CommunityMessage).filter({ order: 0 }).orderBy('votes', 'desc').limit(15).find();
        const newest = await this.database.query(CommunityMessage).filter({ order: 0 }).orderBy('created', 'desc').limit(15).find();

        const answers = await this.database.query(CommunityMessage).filter({ order: 1, thread: { $in: [...top, ...newest] } }).find();

        const result: { top: CommunityQuestionListItem[], newest: CommunityQuestionListItem[] } = { top: [], newest: [] };

        // we could also joins and what not, but we keep it simple since we only fetch 15*2 questions, so should always be fast enough.
        function add(items: CommunityMessage[], to: CommunityQuestionListItem[]) {
            for (const question of items) {
                const answer = answers.find(v => v.thread?.id === question.id);
                if (!answer) continue;
                const entry = {
                    id: question.id,
                    created: question.created,
                    discordUrl: question.discordUrl,
                    answerDiscordUrl: answer.discordUrl,
                    category: question.category,
                    votes: question.votes,
                    title: question.title,
                    user: question.userDisplayName,
                };

                to.push(entry);
            }
        }

        add(top, result.top);
        add(newest, result.newest);

        return result;
    }

    @rpc.action()
    async getAsset(path: string): Promise<string> {
        //remove all special characters and remove all ../...../...
        path = path.replace(/[^a-zA-Z0-9\-_.\/]/g, '').replace(/\.\.+/g, '.');
        const dir = await findParentPath('src/assets/', __dirname);
        if (!dir) throw new Error('Assets folder not found');
        const file = join(dir, path);
        const content = await readFile(file, 'utf8');
        return content;
    }

    @rpc.action()
    async createQuestion(prompt: string, threadId: number = 0, authId?: string): Promise<CommunityQuestion> {
        const thread = threadId ? await this.database.query(CommunityMessage).filter({ id: threadId }).findOne() : undefined;
        if (thread) {
            //additional message should be added, so check for authId
            if (thread.authId !== authId) throw new Error('Invalid authId');
        }

        const message = new CommunityMessage('', 'Anonymous', prompt, thread);
        message.discordChannelId = thread?.discordChannelId;
        message.discordThreadId = thread?.discordThreadId;
        await this.database.persist(message);

        const question = createCommunityQuestion(this.markdownParser, message, []);
        question.authId = message.authId;
        return question;
    }

    @rpc.action()
    async createAnswer(messageId: number): Promise<Observable<{ next: (string | Content)[], remove: number, message?: CommunityQuestion }>> {
        const question = await this.database.query(CommunityMessage)
            .joinWith('thread')
            .filter({ id: messageId })
            .findOne();

        return new Observable(subscriber => {
            (async () => {
                let content = '';
                let lastBody: (string | Content)[] = [];

                const response = await this.ml.ask(question);
                subscriber.next({ next: [], remove: 0, message: createCommunityQuestion(this.markdownParser, response.message, []) });

                for await (const t of eachValueFrom(response.text)) {
                    content += t;
                    const page = this.markdownParser.parse(content);
                    const nextBody = page.body.children || [];

                    let remove = 0;
                    const next: (string | Content)[] = [];
                    for (let i = 0; i < lastBody.length; i++) {
                        if (different(lastBody[i], nextBody[i])) {
                            remove++;
                            // console.log('different', lastBody[i], nextBody[i]);
                            next.push(nextBody[i]);
                        }
                    }

                    for (let i = lastBody.length; i < nextBody.length; i++) {
                        next.push(nextBody[i]);
                    }

                    lastBody = nextBody;

                    subscriber.next({ next, remove });
                }
                subscriber.complete();
            })();
        });
    }

    @rpc.action()
    async search(query: string): Promise<IndexEntry[]> {
        const hits = await this.algolia.find(query);
        return hits;
    }

    @rpc.action()
    async prompt(url: string, prompt: string): Promise<string> {
        const page = await this.getPage(url);
        return '';
    }

    @rpc.action()
    async getPage(url: string): Promise<Page | undefined> {
        return await this.page.parse(url);
    }

    // @rpc.action()
    // async getCompanies(): Promise<string[]> {
    //     const result: string[] = [];
    //     const dir = await findParentPath('src/assets/companies', __dirname);
    //     if (!dir) return [];
    //
    //     const files = await readdir(dir);
    //     return files;
    // }
}
