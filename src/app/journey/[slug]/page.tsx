import Link from "next/link";
import { notFound } from "next/navigation";

import { docs, getDocBySlug } from "@/lib/docs";
import { markdownToHtml } from "@/lib/markdown";
import TableOfContents from "@/components/TableOfContents";

export async function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

interface JourneyDocPageProps {
  params: Promise<{ slug: string }>;
}

export default async function JourneyDocPage({ params }: JourneyDocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const { html, headings } = await markdownToHtml(doc.content, { removeHeading: doc.title });
  const hasToc = headings.length > 0;

  return (
    <div className="relative">
    <article className="space-y-8">
      <header className="space-y-3">
        <Link
          href="/journey"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-secondary)] transition hover:text-[var(--foreground)]"
        >
          ← Back to journey timeline
        </Link>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-secondary)]">
            {doc.phase}
          </span>
          <h1 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            {doc.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">Updated {doc.updated}</p>
        </div>
      </header>

        {hasToc && <TableOfContents items={headings} className="mt-6 xl:hidden" />}

      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </article>

      {hasToc && <TableOfContents items={headings} className="hidden xl:block" />}
    </div>
  );
}

