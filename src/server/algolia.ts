import algoliasearch, { SearchClient } from 'algoliasearch';
import { AppConfig } from "@app/server/config";
import { findParentPath } from "@deepkit/app";
import glob from 'tiny-glob';
import { readFile } from "fs/promises";
import { join } from "path";
import { deserialize } from "@deepkit/type";
import { bodyToString, IndexEntry, Page, projectMap } from "@app/common/models";
import { markdownAsJsTree } from "@app/common/markdown";
import { PageProcessor } from "@app/server/page-processor";

function createIndexEntriesForPage(page: Page, rootPath: string = ''): IndexEntry[] {
    const entries: IndexEntry[] = [];
    let id = 0;
    if (!page.url) return entries;

    if (!page.body.children) return entries;

    const path: string[] = [];

    for (const section of page.body.children) {
        if ('string' === typeof section) continue;
        if (!section.children) continue;
        if (section.tag.startsWith('h')) {
            const level = parseInt(section.tag.substr(1));
            if (path.length > level - 1) path.splice(level - 1);
            path.push(bodyToString(section.children));
        } else {
            const p = path.slice();
            if (rootPath) p.unshift(rootPath);

            entries.push({
                objectID: page.url + '_' + id++,
                tag: section.tag,
                props: section.props || {},
                title: page.title || '',
                url: page.url,
                path: p.map(v => projectMap[v] || v),
                content: bodyToString(section.children)
            })
        }
    }

    return entries;
}

export class Algolia {
    client: SearchClient

    constructor(
        algoliaAppId: AppConfig['algoliaAppId'],
        algoliaApiKey: AppConfig['algoliaApiKey'],
        protected page: PageProcessor,
    ) {
        this.client = algoliasearch(algoliaAppId, algoliaApiKey);
    }

    async find(query: string) {
        const index = this.client.initIndex('pages');
        await index.setSettings({
            //sort by priority
            searchableAttributes: [
                'title',
                'content',
                'path',
            ],
        });
        const res = await index.search<IndexEntry>(query);
        console.log('res', res);
        return res.hits;
    }

    async index() {
        const pages = this.client.initIndex('pages');
        // pages.saveObjects()

        //go through all .md files in src/pages
        const pagesDir = findParentPath('src/pages');
        if (!pagesDir) throw new Error('Could not find pages directory');

        const files = await glob('**/*.md', { cwd: pagesDir });

        for (const file of files) {
            const page = await this.page.parse(file);
            // console.log(json);
            // const body = bodyToString(page.body);
            page.url = file.replace('.md', '');
            console.log(file);
            const categories = file.split('/');
            const category = categories.length > 2 ? categories[1] : '';
            const entries = createIndexEntriesForPage(page, category);
            // console.log(entries);
            await pages.saveObjects(entries);
        }
    }
}
