export interface Content {
    tag: string;
    props?: { [name: string]: any };
    children?: (string | Content)[];
}

export const projectMap: {[name: string]: string} = {
    'framework': 'Framework',
    'runtime-types': 'Runtime Types',
    'dependency-injection': 'Dependency Injection',
    'cli': 'CLI',
    'http': 'HTTP',
    'rpc': 'RPC',
    'orm': 'ORM',
    'desktop-ui': 'Desktop UI',
}

export function bodyToString(body?: string | Content | (string | Content)[]): string {
    if (!body) return '';
    if ('string' === typeof body) return body;
    if (Array.isArray(body)) {
        return body.map(v => bodyToString(v)).join('');
    }
    let result = '';
    if (body.children) {
        for (const child of body.children) {
            if ('string' === typeof child) {
                result += child;
            } else {
                result += bodyToString(child);
            }
        }
    }

    return result;
}

export function parseBody(body: Content): { title: string, subline?: Content, intro: Content[], rest: Content[] } {
    let title = '';
    let subline: Content | undefined = undefined;
    const intro: Content[] = [];
    const rest: Content[] = [];

    for (const child of body.children || []) {
        if ('string' === typeof child) continue;
        if (!title && child.tag === 'h1') {
            title = child.children ? child.children[0] as string : '';
            continue;
        } else if (child.tag === 'p') {
            if (!subline) {
                subline = child;
                continue;
            } else if (!intro.length) {
                intro.push(child);
                continue;
            }
        }

        if (rest.length === 0 && intro.length === 1) {
            if (child.tag === 'video' || child.tag === 'app-screens') {
                intro.push(child);
                continue;
            }
        }
        rest.push(child);
    }

    return { title, subline, intro: intro || { tag: 'p', children: [] }, rest };
}

export interface Page {
    title?: string;
    url?: string;
    date?: Date;
    body: Content;
}

export interface IndexEntry {
    objectID: string; // Required by Algolia for unique identification
    title: string;
    url: string;
    tag: string;
    props: { [name: string]: any };
    fragment?: string;
    path: string[]; //e.g. framework, database, orm, http, etc
    content: string; //the paragraph
    _highlightResult?: {
        [name: string]: {
            fullyHighlighted?: boolean
            matchLevel?: string,
            matchedWords?: string[],
            value?: string
        }
    };
}
