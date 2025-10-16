// removed Link; no links on this page after deleting CTA section

import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      <div className="space-y-6">
        <Hero />
      </div>

      <section className="-mt-6">
        <Reveal>
          <div className="surface section-spacing text-center">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-10 md:px-14 md:py-16">
              <span className="text-sm uppercase tracking-[0.3em] text-[var(--accent-secondary)]">
                Our mission
              </span>
              <p className="text-lg leading-relaxed text-[rgba(237,237,237,0.9)] md:text-xl">
                Our mission is to make cybersecurity awareness measurable, engaging, and scalable. SecureLearning enables organizations to safely simulate phishing attacks, deliver targeted training, and track behavioral improvements.
                <br />
                That, or just getting a 20 on PEI... (don&apos;t tell anyone)
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* removed the extra CTA section for a cleaner home page */}
    </div>
  );
}
