import { Page } from "@app/common/models";

import frontMatterParser from "gray-matter";

function renderText(node: any): any {
    if (typeof node === "string") return node;
    if (typeof node === "object")
        return Array.isArray(node.children)
            ? node.children.map((child: any) => renderText(child)).join("")
            : renderText(node.children);
    return "";
}

function getHeadings(node: any): any {
    if (node != undefined) {
        if (typeof node === "string") {
            return [];
        }
        if (typeof node.tag === "string") {
            const tag = node.tag;
            const level = parseInt(tag[1], 10);
            if (tag[0] === "h" && !isNaN(level)) {
                return [
                    {
                        level,
                        text: renderText(node),
                        id: node.props && node.props.id ? String(node.props.id) : "",
                    },
                ];
            }
        }
        return (Array.isArray(node.children)
                ? node.children.reduce(
                    (acc: any, child: any) => acc.concat(getHeadings(child)),
                    [],
                )
                : getHeadings(node.children)
        ).filter((h: any) => h);
    }
    return [];
};

function extractMetaFromBodyNode(node: any): any {
    const headings = getHeadings(node);
    const firstH1 = headings.find((h: any) => h.level === 1);
    return {
        title: firstH1 ? firstH1.text : undefined,
        headings,
    };
}

const getOnlyChildren = (ast: any) => {
    // rehype-react add an outer div by default
    // lets try to remove it
    if (
        ast.tag === "div" &&
        ast.children != undefined &&
        Array.isArray(ast.children) &&
        ast.children.length === 1 &&
        ast.children[0] != undefined
    ) {
        return ast.children[0];
    }
    return ast;
};

export async function markdownAsJsTree(contents: string): Promise<Page> {
    const front = frontMatterParser(contents.toString());

    const unified = await import('unified');
    const processor = unified.unified();
    processor.use((await import("remark-parse")).default);
    processor.use((await import("remark-rehype")).default);
    //@ts-ignore
    processor.use((await import("rehype-raw")).default);
    //@ts-ignore
    processor.use((await import("rehype-slug")).default);
    //@ts-ignore
    processor.use((await import("rehype-react")).default, {
        createElement: (component: any, props: any, children: any) => {
                return {
                    tag: component,
                    props: props && Object.keys(props).length ? props : undefined,
                    children,
                } ;
            },
    } as any);

    const processed = processor.processSync(front.content);

    if (
        processed != undefined &&
        typeof processed === "object" &&
        processed.result != undefined &&
        typeof processed.result === "object"
    ) {
        const body = processed.result;
        return Object.assign(extractMetaFromBodyNode(body), front.data, {
            body: getOnlyChildren(body),
        });
    }
    throw new Error("unified processSync didn't return an object.");
}
