import fs from "node:fs";
import path from "node:path";

export interface DocMeta {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  file: string;
  phase: string;
  order: number;
}

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

export const docs: DocMeta[] = [
  {
    slug: "personas",
    title: "Personas",
    summary: "Profiles of key stakeholders guiding SecureLearning decisions.",
    updated: "2025-10-13",
    file: "personas.md",
    phase: "Discover",
    order: 1,
  },
  {
    slug: "user-stories",
    title: "User Stories",
    summary: "Narratives capturing needs from the main stakeholders.",
    updated: "2025-10-13",
    file: "user-stories.md",
    phase: "Define",
    order: 2,
  },
  {
    slug: "requirements",
    title: "Requirements",
    summary: "Functional and non-functional expectations for the platform.",
    updated: "2025-10-16",
    file: "requirements.md",
    phase: "Design",
    order: 3,
  },
  {
    slug: "architecture",
    title: "Architecture Overview",
    summary: "System components, data flow, and integration points.",
    updated: "2025-10-20",
    file: "architecture.md",
    phase: "Design",
    order: 4,
  },
  {
    slug: "mockups",
    title: "Mockups & UI Notes",
    summary: "Visual direction for campaign, training, and dashboard experiences.",
    updated: "2025-10-20",
    file: "mockups.md",
    phase: "Prototype",
    order: 5,
  },
];

export function getDocBySlug(slug: string) {
  const doc = docs.find((item) => item.slug === slug);
  if (!doc) {
    return null;
  }

  const filePath = path.join(DOCS_ROOT, doc.file);
  const content = fs.readFileSync(filePath, "utf-8");
  return { ...doc, content };
}

export function getPhases() {
  const phases = new Map<string, DocMeta[]>();
  docs
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((doc) => {
      const current = phases.get(doc.phase) ?? [];
      current.push(doc);
      phases.set(doc.phase, current);
    });
  return phases;
}

