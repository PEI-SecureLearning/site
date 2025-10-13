import Link from "next/link";
import { notFound } from "next/navigation";

import { docs, getDocBySlug } from "@/lib/docs";
import { markdownToHtml } from "@/lib/markdown";

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

  const html = await markdownToHtml(doc.content, { removeHeading: doc.title });

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <Link
          href="/journey"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700"
        >
          ← Back to journey timeline
        </Link>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            {doc.phase}
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {doc.title}
          </h1>
          <p className="text-sm text-slate-500">Updated {doc.updated}</p>
        </div>
      </header>
      <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

