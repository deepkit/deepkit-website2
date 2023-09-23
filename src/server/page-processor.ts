import { findParentPath } from "@deepkit/app";
import { readFile } from "fs/promises";
import { join } from "path";
import { deserialize } from "@deepkit/type";
import { Page } from "@app/common/models";
import { markdownAsJsTree } from "@app/common/markdown";

export class PageProcessor {
    async read(url: string): Promise<string> {
        const dir = findParentPath('src/pages', __dirname);
        if (!dir) throw new Error('Pages folder not found');
        url = url.replace(/[^a-zA-Z0-9\-_\/]/g, '');
        const file = url + '.md';
        return await readFile(join(dir, file), 'utf8');
    }

    async parse(url: string): Promise<Page> {
        const content = await this.read(url);
        const json = await markdownAsJsTree(content);
        const post = deserialize<Page>(json);
        return post;
    }
}
