"use client";

import { useEffect, useState } from "react";

/**
 * Firefox-only top notice.
 *
 * This site uses heavy preserve-3d + scrubbed ScrollTrigger composition for
 * its cinematic feature scenes. Gecko composites those subtrees differently
 * from Blink / WebKit, so the intended visual is only fully faithful on
 * Chromium-family browsers. We've pushed Firefox as close as we can without
 * regressing the working path; this notice sets the right expectation.
 *
 * - Only renders after hydration on Firefox (no SSR flash elsewhere).
 * - Slides in near the top-center so visitors are likely to see it.
 * - Dismissible for the current visit only.
 */
export default function FirefoxNotice() {
    const [mounted, setMounted] = useState(false);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        setMounted(true);
        const t = window.setTimeout(() => setShown(true), 280);
        return () => window.clearTimeout(t);
    }, []);

    const dismiss = () => {
        setShown(false);
        window.setTimeout(() => setMounted(false), 350);
    };

    if (!mounted) return null;

    return (
        <div
            role="alert"
            aria-live="assertive"
            className="pointer-events-none fixed inset-x-0 top-6 z-[80] flex justify-center px-4 sm:top-7"
        >
            <div
                className={`pointer-events-auto w-full max-w-[34rem] transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    shown
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-3 opacity-0"
                }`}
            >
                <div
                    className="relative overflow-hidden rounded-2xl border border-[rgba(167,139,250,0.2)]"
                    style={{
                        background: "rgba(0, 0, 0, 0.16)",
                        backdropFilter: "blur(28px) saturate(1.15)",
                        WebkitBackdropFilter: "blur(32px) saturate(1.15)",
                        boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)",
                    }}
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-2xl"
                        style={{
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                            maskImage:
                                "linear-gradient(90deg, black 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(90deg, black 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                        }}
                    />

                    <div className="relative flex items-start gap-4 px-5 py-4 sm:px-6">
                        <div className="min-w-0 flex-1">
                            <p className="text-[1rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.04rem]">
                                Firefox can&apos;t render this page correctly.
                            </p>
                            <p className="mt-1 text-[0.84rem] leading-relaxed text-white/68 sm:text-[0.86rem]">
                                Use another browser, such as Chrome, for the intended experience.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label="Dismiss notice"
                            className="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/55 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/60"
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 12 12"
                                fill="none"
                                aria-hidden
                            >
                                <path
                                    d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
