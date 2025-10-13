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
    .use(remarkDirective);

  if (options.removeHeading) {
    processor.use(stripHeadingPlugin(options.removeHeading));
  }

  const file = await processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}

