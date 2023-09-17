import { rpc } from "@deepkit/rpc";
import { Page } from "@app/common/models";
import { findParentPath } from "@deepkit/app";
import { deserialize } from "@deepkit/type";
import { readFile } from "fs/promises";
import { join } from "path";
import { Logger } from "@deepkit/logger";

@rpc.controller('/main')
export class MainController {
    constructor(private logger: Logger) {
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

    //
    // @rpc.action()
    // async getPosts(): Promise<Post[]> {
    //     const dir = await findParentPath('src/posts', __dirname);
    //     const posts: Post[] = [];
    //
    //     //read all markdown files in the posts folder
    //     if (!dir) return posts;
    //
    //     const mdjs = require("@moox/markdown-to-json");
    //
    //     const files = await readdir(dir);
    //     for (const file of files) {
    //         const content = await readFile(join(dir, file), 'utf8');
    //         const json = mdjs.markdownAsJsTree(content);
    //         if (json.private) continue;
    //         const post = deserialize<Post>(json);
    //         posts.push(post);
    //     }
    //
    //     //sort by date
    //     posts.sort((a, b) => {
    //         return b.date.getTime() - a.date.getTime();
    //     });
    //
    //     return posts;
    // }

    // @rpc.action()
    // async getWork(): Promise<Work[]> {
    //     const dir = await findParentPath('src/work', __dirname);
    //     const posts: Work[] = [];
    //
    //     //read all markdown files in the posts folder
    //     if (!dir) return posts;
    //
    //     const mdjs = require("@moox/markdown-to-json");
    //
    //     const files = await readdir(dir);
    //     for (const file of files) {
    //         const content = await readFile(join(dir, file), 'utf8');
    //         const json = mdjs.markdownAsJsTree(content);
    //         const post = deserialize<Work>(json);
    //         posts.push(post);
    //     }
    //
    //     //sort by date
    //     posts.sort((a, b) => {
    //         return b.date?.getTime() - a.date?.getTime();
    //     });
    //
    //     return posts;
    // }

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
