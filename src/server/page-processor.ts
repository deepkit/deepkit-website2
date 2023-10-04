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

    async parseExamples(url: string, top: number = 5): Promise<CodeExample[]> {
        const content = await this.read(url);
        const texts = content.split(magicSeparator);
        /*
Example structure:

```
Title: <title>

Code here
```

Or example with several files

```
Title: <title>

File: <file1>

Code here

File: <file2>

Code here
```
         */
        const examples: CodeExample[] = [];
        for (const text of texts) {
            const userStart = text.indexOf('Title:') + 'Title:'.length;
            const title = text.substr(userStart, text.indexOf('\n', userStart)).trim();
            if (!title) continue;


            // const assistantStart = text.indexOf('\nCode:');
            // const title = text.substr(userStart, assistantStart - userStart).trim();
            // if (!title) continue;
            // const code = text.substr(assistantStart + '\nCode:'.length).trim();
            // const files = code.split('\nFile:').map(v => v.trim()).filter(v => v);
            // examples.push({ title, files });
            if (examples.length >= top) break;
        }
        return examples;
    }
}
