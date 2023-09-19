import { OpenAI } from "openai";
import { findParentPath } from "@deepkit/app";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";

class Context {
    messages: { role: 'system' | 'user' | 'assistant' | 'function', content: string }[] = [
        { role: 'system', content: 'You are a documentation chat bot that helps the user to understand a TypeScript framework called Deepkit.' }
    ];

    addUser(content: string) {
        this.messages.push({ role: 'user', content });
    }

    addAssistant(content: string) {
        this.messages.push({ role: 'assistant', content });
    }
}

function getPath(path: string) {
    const baseDir = findParentPath('src/pages', __dirname);
    if (!baseDir) throw new Error('Could not find base dir');
    return join(baseDir, path);
}

const magicSeparator = '##-------------------------------------------------##';

class Page {
    questions: { question: string, answer: string }[] = [];
    textPath: string;
    questionsPath: string;
    fileContent?: string;

    constructor(public path: string) {
        this.textPath = getPath('documentation/' + path);
        this.questionsPath = getPath('questions/' + path);
    }

    async getContent(): Promise<string> {
        if (this.fileContent) return this.fileContent;
        return this.fileContent = await readFile(this.textPath, 'utf8');
    }

    getNextUnansweredQuestions(limit: number = 5): string[] {
        const result: string[] = [];
        for (const question of this.questions) {
            if (!question.answer) result.push(question.question);
            if (result.length >= limit) break;
        }
        return result;
    }

    async save() {
        await writeFile(this.questionsPath, this.generateContent());
    }

    generateContent(): string {
        const texts: string[] = [];
        for (const question of this.questions) {
            texts.push(`User: ${question.question}\nAssistant: ${question.answer}`);
        }
        return texts.join(`\n\n${magicSeparator}\n\n`);
    }

    async load() {
        const text = await readFile(this.questionsPath, 'utf8');
        const texts = text.split(magicSeparator);
        for (const text of texts) {
            const userStart = text.indexOf('User:') + 'User:'.length;
            const assistantStart = text.indexOf('\nAssistant:');
            const question = text.substr(userStart, assistantStart - userStart).trim();
            if (!question) continue;
            const answer = text.substr(assistantStart + '\nAssistant:'.length).trim();
            this.questions.push({ question, answer });
        }
    }

    setAnswers(questions: string[], answers: string[]) {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const index = this.questions.findIndex(v => v.question === q);
            if (index === -1) throw new Error('Could not find question ' + q);
            this.questions[index].answer = answers[i];
        }
    }
}


async function genQuestionPrompt(path: string) {
    path = getPath(path);
    const content = await readFile(path, 'utf8');
    return `
    Given text from a documentation:

\`\`\`${content}\`\`\`

Generate me 20 possible questions or queries a potential user could ask/query.
`;
}

async function genAnswerPrompt(page: Page, questions: string[]) {
    return `
    Given text from a documentation:

\`\`\`${await page.getContent()}\`\`\`

Answer me following questions and prefix the answer with \`Assistant:\` and then the number. For example \`Assistant: 1. ...\`.

${questions.map((v, i) => `${i + 1}. ${v}`).join('\n')}
`;
}

function parseQuestions(text: string): string[] {
    //Input: 1. xxx\n2. xxx\n3. xxx
    //Output: [xxx, xxx, xxx]
    return text.split('\n').map((line) => {
        return line.slice(line.indexOf('.') + 1);
    }).filter(v => !!v);
}

function parseAnswers(text: string): string[] {
    return ('\n' + text).split('\nAssistant: ').map((line) => {
        return line.slice(line.indexOf('.') + 1);
    }).filter(v => !!v);
}

export async function mlGenQuestionCommand(
    openai: OpenAI
) {
    const context = new Context();

    const page = new Page('introduction.md');
    await page.load();
    console.log(page.questions);


    const questions = page.getNextUnansweredQuestions(5);
    console.log(questions);
    if (questions.length === 0) throw new Error('No more questions to answer');

    context.addUser(await genAnswerPrompt(page, questions));

    // const path = 'introduction.md';
    // context.addUser(await genQuestionPrompt('documentation/' + path));

    const completion = await openai.chat.completions.create({
        messages: context.messages,
        model: 'gpt-3.5-turbo',
    });

    console.log(completion.choices);
    const result = completion.choices[0]['message']['content'];
    if (!result) throw new Error('No result');

    const answers = parseAnswers(result);
    console.log('answers', answers);
    page.setAnswers(questions, answers);
    console.log(page.generateContent());
    // await page.save();
}
