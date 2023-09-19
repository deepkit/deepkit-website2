import { rpc } from "@deepkit/rpc";
import { IndexEntry, Page } from "@app/common/models";
import { findParentPath } from "@deepkit/app";
import { deserialize } from "@deepkit/type";
import { readFile } from "fs/promises";
import { join } from "path";
import { Logger } from "@deepkit/logger";
import { Algolia } from "@app/server/algolia";

@rpc.controller('/main')
export class MainController {
    constructor(private logger: Logger, private algolia: Algolia) {
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
    async search(query: string): Promise<IndexEntry[]> {
        const hits = await this.algolia.find(query);
        return hits;
    }

    @rpc.action()
    async getPage(url: string): Promise<Page | undefined> {
        const dir = findParentPath('src/pages', __dirname);
        if (!dir) throw new Error('Pages folder not found');
        url = url.replace(/[^a-zA-Z0-9\-_\/]/g, '');
        const mdjs = require("@moox/markdown-to-json");
        const file = url + '.md';
        const content = await readFile(join(dir, file), 'utf8');
        const json = mdjs.markdownAsJsTree(content, () => []);
        const post = deserialize<Page>(json);
        return post;
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
