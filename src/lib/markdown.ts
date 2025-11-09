import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { toString } from "mdast-util-to-string";
import type { Root } from "mdast";

interface MarkdownOptions {
  removeHeading?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

function stripHeadingPlugin(title: string) {
  return () => (tree: Root) => {
    if (!tree.children.length) return;
    const index = tree.children.findIndex((node) => node.type === "heading");
    if (index === -1) return;

    const node = tree.children[index];
    if (node.type !== "heading") return;

    const headingText = toString(node).trim();
    if (!headingText) return;

    if (headingText.localeCompare(title.trim(), undefined, { sensitivity: "base" }) === 0) {
      tree.children.splice(index, 1);
    }
  };
}

type AstNode = {
  type?: string;
  url?: string;
  depth?: number;
  value?: string;
  children?: AstNode[];
  data?: {
    [key: string]: unknown;
    hProperties?: Record<string, unknown>;
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function collectHeadingsPlugin(target: TocItem[]) {
  return () => (tree: Root) => {
    const slugCounts = new Map<string, number>();

    const visit = (node: AstNode | undefined) => {
      if (!node) return;
      if (node.type === "heading" && typeof node.depth === "number") {
        const level = node.depth;
        if (level >= 1 && level <= 4) {
          const text = toString(node as unknown as Root).trim();
          if (text) {
            const baseSlug = slugify(text);
            const count = slugCounts.get(baseSlug) ?? 0;
            const id = count > 0 ? `${baseSlug}-${count}` : baseSlug;
            slugCounts.set(baseSlug, count + 1);

            if (!node.data) node.data = {};
            const data = node.data;
            data.id = id;
            data.hProperties = { ...(data.hProperties ?? {}), id };

            target.push({ id, text, level });
          }
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach((child) => visit(child));
      }
    };

    visit(tree as unknown as AstNode);
  };
}

export async function markdownToHtml(markdown: string, options: MarkdownOptions = {}) {
  const headings: TocItem[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(rewriteRelativeImagesPlugin("/assets/docs/"));

  if (options.removeHeading) {
    processor.use(stripHeadingPlugin(options.removeHeading));
  }

  const file = await processor
    .use(collectHeadingsPlugin(headings))
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return { html: String(file), headings };
}

function rewriteRelativeImagesPlugin(basePath: string) {
  return () => (tree: Root) => {
    const visit = (node: AstNode | undefined): void => {
      if (!node) return;
      if (node.type === "image" && typeof node.url === "string") {
        const url = node.url;
        const isAbsolute = /^(https?:)?\/\//i.test(url) || url.startsWith("/");
        if (!isAbsolute) node.url = basePath + url;
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree as unknown as AstNode);
  };
}

