import { findParentPath } from "@deepkit/app";
import { readFile } from "fs/promises";
import { join } from "path";
import { CodeExample, magicSeparator, Page, QuestionAnswer } from "@app/common/models";
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
        const page = this.parser.parse(content);
        page.url = url;
        return page;
    }

    async parseQuestions(url: string, top: number = 5): Promise<QuestionAnswer[]> {
        const content = await this.read(url);
        const texts = content.split(magicSeparator);
        const questions: QuestionAnswer[] = [];
        for (const text of texts) {
            const userStart = text.indexOf('User:') + 'User:'.length;
            const assistantStart = text.indexOf('\nAssistant:');
            const question = text.substr(userStart, assistantStart - userStart).trim();
            if (!question) continue;
            const answer = text.substr(assistantStart + '\nAssistant:'.length).trim();
            questions.push({ title: question, answer: this.parser.parse(answer).body });
            if (questions.length >= top) break;
        }
        return questions;
    }

    async parseExamples(url: string, withContent: boolean = false, top: number = 5): Promise<CodeExample[]> {
        const content = await this.read('examples/' + url);
        const texts = content.split(magicSeparator);
        const examples: CodeExample[] = [];
        for (const text of texts) {
            const titleStart = text.indexOf('Title:') + 'Title:'.length;
            const titleEnd = text.indexOf('\n', titleStart);
            const title = text.slice(titleStart, titleEnd).trim();
            if (!title) continue;

            examples.push({
                title,
                url: url + '/' + title.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase(),
                content: withContent ? this.parser.parse(text.slice(titleEnd + 1)).body : undefined
            });
            if (examples.length >= top) break;
        }
        return examples;
    }
}
