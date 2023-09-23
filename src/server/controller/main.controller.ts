import { rpc } from "@deepkit/rpc";
import { CommunityMessage, CommunityThread, Content, IndexEntry, Page } from "@app/common/models";
import { findParentPath } from "@deepkit/app";
import { deserialize } from "@deepkit/type";
import { readFile } from "fs/promises";
import { join } from "path";
import { Logger } from "@deepkit/logger";
import { Algolia } from "@app/server/algolia";
import { OpenAI } from "openai";
import { Observable } from "rxjs";
import { Questions } from "@app/server/questions";
import { markdownAsJsTree } from "@app/common/markdown";
import { PageProcessor } from "@app/server/page-processor";
import { Database } from "@deepkit/orm";
import { eachValueFrom } from "rxjs-for-await";

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

@rpc.controller('/main')
export class MainController {
    constructor(
        private logger: Logger,
        private algolia: Algolia,
        private ml: Questions,
        private page: PageProcessor,
        private openAi: OpenAI,
        private database: Database,
    ) {
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
    async askDoc(prompt: string, threadId?: string, url?: string): Promise<Observable<{ next: (string | Content)[], remove: number }>> {
        return new Observable(subscriber => {
            console.log('start', prompt, url);
            (async () => {
                let content = '';
                let lastBody: (string | Content)[] = [];

                let question = new CommunityThread('', 'Anonymous');
                question = await this.database.query(CommunityThread).filter({ id: threadId }).findOneOrUndefined() ?? question;
                const message = new CommunityMessage(question, '', 'Anonymous', prompt)

                const response = await this.ml.ask(question, message, url);

                for await (const message of eachValueFrom(response)) {
                    content += message.text;
                    const page = await markdownAsJsTree(content);
                    const nextBody = page.body.children || [];

                    let remove = 0;
                    const next: (string | Content)[] = [];
                    for (let i = 0; i < lastBody.length; i++) {
                        if (different(lastBody[i], nextBody[i])) {
                            remove++;
                            console.log('different', lastBody[i], nextBody[i]);
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
