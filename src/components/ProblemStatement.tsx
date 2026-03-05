"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Data ────────────────────────────────────────────── */

const painPoints = [
    <>
        Generic awareness training doesn&rsquo;t{" "}
        <span className="text-[var(--accent-primary)]">change behavior</span>.
    </>,
    <>
        Employees <span className="text-[var(--accent-primary)]">forget</span>{" "}
        what they learned in two weeks.
    </>,
    <>
        Security teams have no way to{" "}
        <span className="text-[var(--accent-primary)]">measure</span> real risk
        reduction.
    </>,
];

/* ── Constants ───────────────────────────────────────── */

const STACK_OFFSET = 12;

/* ── Component ───────────────────────────────────────── */

export default function ProblemStatement() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 40%",    // start when section top hits 40% (early reveal)
                    end: "bottom bottom",
                    scrub: 0.8,
                    // NO pin — CSS position: sticky handles that
                },
            });

            /* ── Phase 1: "94%" radial reveal ── */
            tl.fromTo(
                ".quote-number-text",
                { clipPath: "circle(0% at 50% 50%)" },
                {
                    clipPath: "circle(100% at 50% 50%)",
                    duration: 0.12,
                    ease: "power2.out",
                }
            );

            /* ── Phase 2: Sentence slides up to dock ── */
            tl.fromTo(
                ".quote-sentence",
                { y: 80, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.13, ease: "power3.out" },
                0.06
            );

            /* ── Phase 3: Attribution center-out soft wipe ── */
            tl.fromTo(
                ".quote-attribution",
                { "--wipe": 0 },
                {
                    "--wipe": 1,
                    duration: 0.18, // Much slower wipe over a longer scroll distance
                    ease: "power2.out",
                },
                0.15 // Start earlier (sentence finishes at 0.19)
            );

            /* ── Phase 4–6: Cards fly up and stack ── */
            // We start the first card very shortly after the quote attribution wipe finishes (which ends around 0.33, but we can overlap its tail end)
            painPoints.forEach((_, i) => {
                const cardEl = `.pain-card-${i}`;
                const startTime = 0.18 + i * 0.16; // Tighter initial gap, tighter stagger

                tl.fromTo(
                    cardEl,
                    { y: 400, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.16,
                        ease: "power3.out",
                    },
                    startTime
                );

                if (i > 0) {
                    for (let j = 0; j < i; j++) {
                        tl.to(
                            `.pain-card-${j}`,
                            {
                                scale: 1 - (i - j) * 0.03,
                                filter: `blur(${(i - j) * 1.5}px)`,
                                duration: 0.16,
                                ease: "power2.out",
                            },
                            startTime
                        );
                    }
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="full-bleed relative"
            style={{ height: "300vh" }}
        >
            {/* CSS sticky viewport — proven to work */}
            <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-6">
                {/* IBM Quote — cinematic puzzle assembly */}
                <div className="relative mb-14 max-w-3xl text-center">
                    {/* LAYER 1: "94%" — clip-path radial reveal */}
                    <p className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                        <span style={{ color: "transparent" }}>
                            <span className="font-serif">&ldquo;</span>
                        </span>
                        <span
                            className="quote-number-text inline-block"
                            style={{
                                color: "var(--accent-primary)",
                                clipPath: "circle(0% at 50% 50%)",
                            }}
                        >
                            94%
                        </span>{" "}
                        <span style={{ color: "transparent" }}>
                            of all cyberattacks begin with a phishing
                            email.<span className="font-serif">&rdquo;</span>
                        </span>
                    </p>

                    {/* LAYER 2: Full sentence — slides up to dock */}
                    <p
                        className="quote-sentence absolute inset-x-0 top-0 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
                        style={{ opacity: 0 }}
                    >
                        <span className="text-[var(--foreground)]">
                            <span className="font-serif">&ldquo;</span>
                        </span>
                        <span style={{ color: "transparent" }}>
                            94%
                        </span>{" "}
                        <span className="text-[var(--foreground)]">
                            of all cyberattacks begin with a phishing
                            email.<span className="font-serif">&rdquo;</span>
                        </span>
                    </p>

                    {/* Attribution — center-out soft wipe */}
                    <p
                        className="quote-attribution mt-5 text-xs font-medium uppercase tracking-[0.25em] text-white/40"
                        style={{
                            fontFamily: "var(--font-geist-mono), monospace",
                            "--wipe": 0,
                            WebkitMaskImage: "linear-gradient(90deg, transparent calc(50% - (var(--wipe) * 60%)), black calc(50% - (var(--wipe) * 50%)), black calc(50% + (var(--wipe) * 50%)), transparent calc(50% + (var(--wipe) * 60%)))",
                            maskImage: "linear-gradient(90deg, transparent calc(50% - (var(--wipe) * 60%)), black calc(50% - (var(--wipe) * 50%)), black calc(50% + (var(--wipe) * 50%)), transparent calc(50% + (var(--wipe) * 60%)))",
                        } as React.CSSProperties}
                    >
                        IBM Security Report
                    </p>
                </div>

                {/* Card stack area */}
                <div
                    className="relative w-full max-w-4xl"
                    style={{ height: "140px" }}
                >
                    {painPoints.map((text, i) => (
                        <div
                            key={i}
                            className={`pain-card-${i} absolute inset-x-0 rounded-2xl px-6 py-5 md:px-8 md:py-6 flex items-center justify-center`}
                            // eslint-disable-next-line
                            style={{
                                top: `${i * STACK_OFFSET}px`,
                                opacity: 0,
                                zIndex: i + 1,
                                background: "rgba(0, 0, 0, 0.2)", // Pure sheer black "icy lens"
                                backdropFilter: "blur(32px)",
                                WebkitBackdropFilter: "blur(32px)",
                                borderTop: "1px solid transparent",
                                borderImageSource: "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
                                borderImageSlice: 1,
                                boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.02)",
                                transformOrigin: "top center",
                            }}
                        >
                            <p className="text-center text-lg font-medium leading-relaxed tracking-tight text-white/90 sm:text-xl md:text-2xl">
                                {text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
