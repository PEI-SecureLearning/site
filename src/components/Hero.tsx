"use client";

import Link from "next/link";

import Reveal from "./Reveal";
import DarkVeil from "./effects/DarkVeil";
import ShinyText from "./ShinyText";

export default function Hero() {
  return (
    <section className="full-bleed hero-offset relative isolate flex min-h-[82vh] flex-col justify-center overflow-hidden bg-[var(--background)] px-6 pb-28 pt-28 sm:px-10 md:min-h-[90vh] md:px-20 lg:min-h-[95vh]">
      <div className="absolute bottom-0 left-0 right-0 h-[28rem] bg-gradient-to-b from-transparent via-[rgba(24,20,32,0.6)] to-[var(--background)]" aria-hidden />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[rgba(12,10,15,0.85)] to-transparent" aria-hidden />

      <div className="pointer-events-none absolute inset-0">
        <DarkVeil fadeStart="75%" />
      </div>

      <div className="relative z-10 mx-auto -mt-6 md:-mt-8 flex w-full max-w-5xl flex-col items-center gap-12 text-center">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <div className="space-y-7 text-balance">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                SecureLearning
              </h1>
              <p className="text-xl font-medium text-[rgba(237,237,237,0.85)] sm:text-[1.35rem]">
                <ShinyText speed={4}>
                  Strengthening organizations through
                  <span className="ml-2 bg-gradient-to-r from-[#7C3AED] via-[#9B6BFF] to-[#A78BFA] bg-clip-text text-transparent">
                    cybersecurity awareness
                  </span>
                  .
                </ShinyText>
              </p>
              <p className="text-lg text-[rgba(237,237,237,0.72)] sm:text-lg">
                Simulate real attacks, train smarter, and measure progress with SecureLearning.
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
      </div>
    </section>
  );
}
