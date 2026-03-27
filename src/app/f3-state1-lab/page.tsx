"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import F3StateOneScene from "@/components/F3StateOneScene";
import F3RemediationSlab from "@/components/F3RemediationSlab";

const DEBUG_STEP_LABELS = [
    ["takeoverVisible", "1. Takeover"],
    ["shellVisible", "2. Mail shell"],
    ["selectedActive", "3. Selected row"],
    ["metaVisible", "4. Sender / meta"],
    ["subjectActive", "5. Subject"],
    ["eventActive", "6. Event sentence"],
    ["detailsVisible", "7. Incident details"],
    ["actionActive", "8. Action sentence"],
    ["ctaVisible", "9. CTA"],
    ["arrowVisible", "10. Nudge arrow"],
    ["isNudging", "11. Elastic resistance"],
    ["breatheCta", "12. CTA breathe"],
] as const;

const allStepsOn = Object.fromEntries(DEBUG_STEP_LABELS.map(([key]) => [key, true])) as Record<
    (typeof DEBUG_STEP_LABELS)[number][0],
    boolean
>;

const allStepsOff = Object.fromEntries(DEBUG_STEP_LABELS.map(([key]) => [key, false])) as Record<
    (typeof DEBUG_STEP_LABELS)[number][0],
    boolean
>;

export default function F3StateOneLabPage() {
    const [sceneVersion, setSceneVersion] = useState(0);
    const [manualMode, setManualMode] = useState(false);
    const sceneSectionRef = useRef<HTMLElement>(null);
    const [debugSteps, setDebugSteps] = useState({
        ...allStepsOn,
        arrowVisible: false,
        isNudging: false,
        breatheCta: false,
    });

    const replaySequence = () => {
        setSceneVersion((value) => value + 1);

        globalThis.window.requestAnimationFrame(() => {
            const sectionTop = sceneSectionRef.current?.offsetTop ?? 0;
            globalThis.window.scrollTo({
                top: Math.max(sectionTop - 48, 0),
                behavior: "auto",
            });
        });
    };

    return (
        <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
            <section className="relative overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_36%),linear-gradient(180deg,#09070d_0%,#0c0a0f_100%)]">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:px-10 md:py-24">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-[var(--accent-secondary)]">
                            F3 Isolation Lab
                        </div>
                        <h1 className="max-w-[14ch] text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white md:text-6xl">
                            Test F3 sequence without homepage noise.
                        </h1>
                        <p className="max-w-2xl text-[1.02rem] leading-8 text-white/58 md:text-[1.08rem]">
                            This route mounts the same F3 sticky scene as the homepage—State 1
                            choreography, State 2 consequence beat, and scroll release—in isolation
                            so you can judge motion, timing, and scroll lock without F1, F2, or the
                            rest of the page affecting the result.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold tracking-[-0.01em] transition ${
                                manualMode
                                    ? "border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary)]/16 text-white"
                                    : "border-white/[0.1] bg-white/[0.02] text-white/78 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                            }`}
                            onClick={() => setManualMode((value) => !value)}
                        >
                            {manualMode ? "Manual mode on" : "Switch to manual mode"}
                        </button>
                        <button
                            type="button"
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/12 px-5 text-sm font-semibold tracking-[-0.01em] text-white transition hover:border-[var(--accent-secondary)]/50 hover:bg-[var(--accent-secondary)]/18"
                            onClick={replaySequence}
                        >
                            Replay sequence
                        </button>
                        <Link
                            href="/"
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-5 text-sm font-semibold tracking-[-0.01em] text-white/78 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                        >
                            Back to homepage
                        </Link>
                    </div>
                </div>
            </section>

            {manualMode ? (
                <section className="border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] px-4 text-sm font-medium text-white/82 transition hover:border-white/[0.16] hover:bg-white/[0.05]"
                                onClick={() => setDebugSteps({ ...allStepsOn, arrowVisible: false, isNudging: false, breatheCta: false })}
                            >
                                All core steps on
                            </button>
                            <button
                                type="button"
                                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] px-4 text-sm font-medium text-white/82 transition hover:border-white/[0.16] hover:bg-white/[0.05]"
                                onClick={() => setDebugSteps(allStepsOff)}
                            >
                                All off
                            </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {DEBUG_STEP_LABELS.map(([key, label]) => (
                                <label
                                    key={key}
                                    className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white/78"
                                >
                                    <span>{label}</span>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-violet-400"
                                        checked={debugSteps[key]}
                                        onChange={(event) =>
                                            setDebugSteps((current) => ({
                                                ...current,
                                                [key]: event.target.checked,
                                            }))
                                        }
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            <section ref={sceneSectionRef} className="pb-24 pt-10 md:pb-32 md:pt-14">
                <div className="mx-auto mb-10 max-w-6xl px-6 md:mb-14 md:px-10">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/[0.08]" />
                        <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                            Slab preview
                        </span>
                        <div className="h-px flex-1 bg-white/[0.08]" />
                    </div>
                    <F3RemediationSlab
                        prefersReducedMotion={false}
                        placement="inline"
                        animateOnMount={false}
                    />
                </div>

                {/* Full viewport width so F3 matches homepage — max-w was framing the mail in a column */}
                <div className="full-bleed bg-[var(--background)]">
                    <F3StateOneScene
                        key={sceneVersion}
                        sceneHeightClassName="h-[260vh]"
                        debugOverrides={
                            manualMode
                                ? {
                                      manualMode: true,
                                      ...debugSteps,
                                  }
                                : undefined
                        }
                    />
                </div>
            </section>

            <section className="pb-[120vh]">
                <div className="mx-auto max-w-6xl px-6 md:px-10">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                </div>
            </section>
        </main>
    );
}
