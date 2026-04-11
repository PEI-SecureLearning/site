"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { useEarlyAccess } from "./early-access/EarlyAccessProvider";
import DarkVeil from "./effects/DarkVeil";
import ShinyText from "./ShinyText";

export default function Hero() {
  const { open: openEarlyAccess } = useEarlyAccess();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVeilPaused, setIsVeilPaused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVeilPaused(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVeilPaused(!entry.isIntersecting),
      {
        threshold: 0.05,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setIsDocumentHidden(document.hidden);

    update();
    document.addEventListener("visibilitychange", update);

    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const isHeroAmbientMotionPaused = isVeilPaused || isDocumentHidden;

  return (
    <section
      ref={sectionRef}
      className="full-bleed relative isolate flex min-h-[82vh] flex-col justify-center overflow-hidden bg-[var(--background)] px-6 pb-6 pt-20 sm:px-10 md:min-h-[90vh] md:px-20 lg:min-h-[95vh]"
    >
      {/* Bottom fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-[28rem] bg-gradient-to-b from-transparent via-[rgba(24,20,32,0.6)] to-[var(--background)]" aria-hidden />
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[rgba(12,10,15,0.85)] to-transparent" aria-hidden />

      {/* DarkVeil generative background */}
      <div className="pointer-events-none absolute inset-0">
        <DarkVeil fadeStart="75%" isPaused={isVeilPaused} />
      </div>

      <div className="relative z-10 mx-auto mt-[-3rem] flex w-full max-w-5xl flex-col items-center gap-10 text-center">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">


            <div className="space-y-7">
              <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-[4.5rem] text-white">
                Make your people{" "}
                <ShinyText
                  className="inline-block bg-[image:var(--gradient-accent)] bg-clip-text text-transparent pb-1"
                  speed={4}
                  disabled={isHeroAmbientMotionPaused}
                >
                  unphishable
                </ShinyText>
              </h1>

              <div className="mx-auto max-w-2xl space-y-1">
                <p className="text-xl font-medium leading-snug text-[rgba(255,255,255,0.9)] sm:text-[1.35rem]">
                  Because generic awareness training doesn&apos;t change behavior.
                </p>
                <p className="text-base leading-relaxed text-[rgba(237,237,237,0.55)] sm:text-lg">
                  SecureLearning simulates real attacks, trains by role, and
                  measures what actually changes.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button type="button" className="btn btn-primary" onClick={openEarlyAccess}>
                Request Early Access
              </button>
              <a href="#how-it-works" className="btn btn-secondary">
                See How It Works
              </a>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
