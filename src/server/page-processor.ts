import { findParentPath } from "@deepkit/app";
import { readFile } from "fs/promises";
import { join } from "path";
import { deserialize } from "@deepkit/type";
import { Page } from "@app/common/models";
import { MarkdownParser } from "@app/common/markdown";

export class PageProcessor {
    constructor(protected parser: MarkdownParser) {
    }
    async read(url: string): Promise<string> {
        const dir = findParentPath('src/pages', __dirname);
        if (!dir) throw new Error('Pages folder not found');
        url = url.replace(/[^a-zA-Z0-9\-_\/]/g, '');
        const file = url + '.md';
        return await readFile(join(dir, file), 'utf8');
    }

    async parse(url: string): Promise<Page> {
        const content = await this.read(url);
        return this.parser.parse(content);
    }
}
