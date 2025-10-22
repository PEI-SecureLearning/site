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

export async function markdownToHtml(markdown: string, options: MarkdownOptions = {}) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(rewriteRelativeImagesPlugin("/assets/docs/"));

  if (options.removeHeading) {
    processor.use(stripHeadingPlugin(options.removeHeading));
  }

  const file = await processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}

type MdNode = { type?: string; url?: string; children?: MdNode[] };

function rewriteRelativeImagesPlugin(basePath: string) {
  return () => (tree: Root) => {
    const visit = (node: MdNode | undefined): void => {
      if (!node) return;
      if (node.type === "image" && typeof node.url === "string") {
        const url = node.url;
        const isAbsolute = /^(https?:)?\/\//i.test(url) || url.startsWith("/");
        if (!isAbsolute) node.url = basePath + url;
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree as unknown as MdNode);
  };
}

