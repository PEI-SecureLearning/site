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
  isMilestone?: boolean;
}

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

export const docs: DocMeta[] = [
  {
    slug: "personas",
    title: "Personas",
    summary: "Profiles of key stakeholders guiding SecureLearning decisions.",
    updated: "2025-10-13",
    file: "personas.md",
    phase: "Inception",
    order: 1,
  },
  {
    slug: "user-stories",
    title: "User Stories",
    summary: "Narratives capturing needs from the main stakeholders.",
    updated: "2025-10-13",
    file: "user-stories.md",
    phase: "Inception",
    order: 2,
  },
  {
    slug: "requirements",
    title: "Requirements",
    summary: "Functional and non-functional expectations for the platform.",
    updated: "2025-10-16",
    file: "requirements.md",
    phase: "Inception",
    order: 3,
  },
  {
    slug: "mockups",
    title: "Paper Mockups",
    summary: "Visual direction for each persona's main screens.",
    updated: "2025-10-20",
    file: "mockups.md",
    phase: "Inception",
    order: 4,
  },
  {
    slug: "architecture",
    title: "Architecture Overview",
    summary: "System components, data flow, and integration points.",
    updated: "2025-10-27",
    file: "architecture.md",
    phase: "Inception",
    order: 5,
  },
  {
    slug: "milestone-1",
    title: "Milestone 1: Inception",
    summary: "Project overview, inception phase summary.",
    updated: "2025-10-28",
    file: "milestone-1.md",
    phase: "Inception",
    order: 6,
    isMilestone: true,
  },
  {
    slug: "figma",
    title: "Figma Mockups",
    summary: "First visual explorations of core screens: campaigns, tenants, learner stats, and courses.",
    updated: "2025-11-16",
    file: "figma-mocks.md",
    phase: "Elaboration",
    order: 7,
  },
  {
    slug: "domain-model",
    title: "Domain Model & Core Concepts",
    summary: "Defining how the system’s key entities relate across the platform.",
    updated: "2025-11-16",
    file: "domain-model.md",
    phase: "Elaboration",
    order: 8,
  },
  {
    slug: "use-cases",
    title: "Use Cases",
    summary: "Defining how the system’s key entities relate across the platform.",
    updated: "2025-11-17",
    file: "use-cases.md",
    phase: "Elaboration",
    order: 9,
  },
  {
    slug: "data-model",
    title: "Data Model & Storage Design",
    summary: "How data is organised across relational tables and flexible MongoDB content.",
    updated: "2025-11-17",
    file: "data-model.md",
    phase: "Elaboration",
    order: 10,
  },
  {
    slug: "milestone-2",
    title: "Milestone 2: Elaboration",
    summary: "Project overview, elaboration phase summary.",
    updated: "2025-11-18",
    file: "milestone-2.md",
    phase: "Elaboration",
    order: 11,
    isMilestone: true,
  },
  {
    slug: "mvp-workflows",
    title: "MVP Workflow Videos",
    summary:
      "Short walkthrough videos of the MVP workflows.",
    updated: "2025-12-14",
    file: "mvp-workflows.md",
    phase: "Construction",
    order: 12,
  },
  {
    slug: "milestone-3",
    title: "Milestone 3: MVP",
    summary: "MVP demo, key flows, and what we built during Construction.",
    updated: "2025-12-14",
    file: "milestone-3.md",
    phase: "Construction",
    order: 13,
    isMilestone: true,
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

