import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "This page is coming soon.",
};

export default async function ComingSoonPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await searchParams; // label not used anymore
  return (
    <section className="section-spacing">
      <div className="surface mx-auto max-w-2xl p-10 text-center md:p-14">
        <h1 className="text-3xl font-semibold md:text-4xl">Coming Soon</h1>
        <p className="mt-3 text-[rgba(237,237,237,0.78)]">We&apos;re working hard to bring this page online.</p>
      </div>
    </section>
  );
}


