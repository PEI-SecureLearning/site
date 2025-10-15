import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <div className="flex flex-col gap-24">
      <section className="radial-hero flex min-h-[70vh] flex-col justify-center pb-20 pt-16">
        <Reveal>
          <div className="flex flex-col items-start gap-8">
            <div className="tag">Secure, measurable learning</div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                SecureLearning
              </h1>
              <p className="max-w-xl text-lg text-[var(--muted)]">
                Empower employees with safe, data-driven cybersecurity training.
              </p>
              <p className="max-w-2xl text-base text-[rgba(237,237,237,0.78)] sm:text-lg">
                Realistic phishing simulations, just-in-time learning, measurable impact.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/journey" className="btn btn-primary">
                Follow our Journey
              </Link>
              <a
                href="https://github.com/PEI-SecureLearning"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <div className="surface section-spacing text-center">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-10 md:px-14 md:py-16">
              <span className="text-sm uppercase tracking-[0.3em] text-[var(--accent-secondary)]">
                Our mission
              </span>
              <p className="text-lg leading-relaxed text-[rgba(237,237,237,0.9)] md:text-xl">
                Our mission is to make cybersecurity awareness measurable, engaging, and scalable. SecureLearning enables organizations to safely simulate phishing attacks, deliver targeted training, and track behavioral improvements — all without compromising user trust.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <div className="surface-inset section-spacing">
            <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-6 py-10 md:px-14 md:py-14">
              <p className="text-base text-[rgba(237,237,237,0.85)]">
                📄 Curious about our progress? Explore how SecureLearning is evolving — from early documentation to a working prototype.
              </p>
              <Link href="/journey" className="btn btn-primary">
                Follow the Journey →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
