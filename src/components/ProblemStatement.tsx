"use client";

import { useEffect, useRef, useState } from "react";

/* ── Data ────────────────────────────────────────────── */

const painPoints = [
    "Generic awareness training doesn\u2019t change behavior.",
    "Employees forget what they learned in two weeks.",
    "Security teams have no way to measure real risk reduction.",
];

/* ── Helpers ─────────────────────────────────────────── */

const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out

/* ── Card stack constants ────────────────────────────── */

const STACK_OFFSET = 12;   // px each card peeks above the next
const SCALE_STEP = 0.03;   // scale-down per depth level
const BLUR_STEP = 1.5;     // blur px per depth level

/* ── Component ───────────────────────────────────────── */

export default function ProblemStatement() {
    const sectionRef = useRef<HTMLElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const el = sectionRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const scrolled = -rect.top;
            const maxScroll = el.offsetHeight - vh;
            if (maxScroll <= 0) return;
            setProgress(clamp(scrolled / maxScroll, 0, 1));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ── Quote anim (first 12% of scroll) ── */
    const quoteT = clamp(progress / 0.12, 0, 1);
    const quoteOpacity = quoteT;
    const quoteScale = 0.96 + quoteT * 0.04;
    const attrOpacity = clamp((progress - 0.08) / 0.06, 0, 1);

    /* ── Card arrival phases ── */
    const phases = [
        { start: 0.20, end: 0.40 },
        { start: 0.42, end: 0.62 },
        { start: 0.64, end: 0.84 },
    ];

    return (
        <section
            ref={sectionRef}
            className="full-bleed relative"
            style={{ height: "300vh" }}
        >
            {/* ── Sticky viewport: pins for the entire scroll runway ── */}
            <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-6">
                {/* IBM Quote */}
                <div
                    className="mb-14 max-w-3xl text-center"
                    style={{
                        opacity: quoteOpacity,
                        transform: `scale(${quoteScale})`,
                        willChange: "transform, opacity",
                    }}
                >
                    <p className="text-3xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">
                        &ldquo;94% of all cyberattacks begin with a phishing
                        email.&rdquo;
                    </p>
                    <p
                        className="mt-5 text-sm font-medium tracking-wide text-[var(--muted)]"
                        style={{ opacity: attrOpacity }}
                    >
                        — IBM Security Report
                    </p>
                </div>

                {/* Card stack area */}
                <div
                    className="relative w-full max-w-[780px]"
                    style={{ height: "120px" }}
                >
                    {painPoints.map((text, i) => {
                        const phase = phases[i];
                        const entryT = clamp(
                            (progress - phase.start) /
                            (phase.end - phase.start),
                            0,
                            1
                        );
                        const eased = easeOut(entryT);
                        const arrived = entryT > 0;

                        /* How many LATER cards have fully arrived? */
                        let cardsOnTop = 0;
                        for (let j = i + 1; j < phases.length; j++) {
                            const jT = clamp(
                                (progress - phases[j].start) /
                                (phases[j].end - phases[j].start),
                                0,
                                1
                            );
                            if (jT > 0.6) cardsOnTop++;
                        }

                        const scale = 1 - cardsOnTop * SCALE_STEP;
                        const blur = cardsOnTop * BLUR_STEP;

                        /* Entry: 400px below → 0 (resting); opacity: 0 → 1 */
                        const translateY = arrived
                            ? (1 - eased) * 400
                            : 400;
                        const opacity = arrived
                            ? clamp(entryT * 3, 0, 1)
                            : 0;

                        return (
                            <div
                                key={i}
                                className="absolute inset-x-0 rounded-xl px-8 py-7"
                                style={{
                                    top: `${i * STACK_OFFSET}px`,
                                    transform: `translateY(${translateY}px) scale(${scale})`,
                                    transformOrigin: "top center",
                                    opacity,
                                    filter:
                                        blur > 0
                                            ? `blur(${blur}px)`
                                            : "none",
                                    zIndex: i + 1,
                                    background: "rgba(24, 21, 32, 0.92)",
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    border: "1px solid rgba(167,139,250,0.08)",
                                    borderTopColor:
                                        "rgba(167, 139, 250, 0.2)",
                                    boxShadow:
                                        "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
                                    willChange:
                                        "transform, opacity, filter",
                                    transition: "filter 0.3s ease",
                                }}
                            >
                                <p className="text-center text-xl font-semibold leading-snug tracking-tight text-white/90 sm:text-2xl">
                                    {text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
