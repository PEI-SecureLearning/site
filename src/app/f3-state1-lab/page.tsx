"use client";

import Link from "next/link";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";
import F3StateOneScene from "@/components/F3StateOneScene";
import { type F3LabCheckpoint } from "@/components/F3PhishingEmail";
import {
    F3_FORENSIC_BREAKPOINTS,
    cloneF3ForensicLayoutSet,
    type F3ForensicBreakpoint,
    type F3ForensicLayoutSet,
} from "@/components/F3ForensicOverlay";

const LAB_CHECKPOINTS: ReadonlyArray<{
    id: F3LabCheckpoint;
    label: string;
    short: string;
    description: string;
}> = [
    {
        id: "absolute-beginning",
        label: "Absolute beginning",
        short: "A0",
        description: "The sequence has not started yet.",
    },
    {
        id: "end-state1",
        label: "End of State 1",
        short: "S1",
        description: "The phishing email is fully composed and waiting at the CTA.",
    },
    {
        id: "end-state2",
        label: "End of State 2",
        short: "S2",
        description: "The verdict is fully settled on screen.",
    },
    {
        id: "end-slab-entrance",
        label: "End of slab entrance",
        short: "SL",
        description: "The slab has fully entered and is holding before the next step.",
    },
    {
        id: "end-docking",
        label: "End of docking",
        short: "DK",
        description: "The slab has collapsed into the icon tile and docked into the inbox corner.",
    },
    {
        id: "end-surface",
        label: "End of surface reveal",
        short: "SF",
        description:
            "The material transformation has finished and the new surface is holding before the forensic annotations appear.",
    },
    {
        id: "absolute-end",
        label: "Final annotated surface",
        short: "AE",
        description: "The full final remediation surface is visible with the forensic annotations in place.",
    },
] as const;

const FORENSIC_LAYOUT_STORAGE_KEY = "f3-forensic-layouts-v1";
type RangeHandle = "start" | "end";

export default function F3StateOneLabPage() {
    const [mode, setMode] = useState<"full" | "range">("range");
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(LAB_CHECKPOINTS.length - 1);
    const [sceneVersion, setSceneVersion] = useState(0);
    const [calibrationEnabled, setCalibrationEnabled] = useState(false);
    const [calibrationPanelOpen, setCalibrationPanelOpen] = useState(false);
    const [calibrationBreakpoint, setCalibrationBreakpoint] =
        useState<F3ForensicBreakpoint>("desktop");
    const [forensicLayouts, setForensicLayouts] = useState<F3ForensicLayoutSet>(() =>
        cloneF3ForensicLayoutSet()
    );
    const [copied, setCopied] = useState(false);
    const sliderTrackRef = useRef<HTMLDivElement>(null);
    const startIndexRef = useRef(startIndex);
    const endIndexRef = useRef(endIndex);
    const [draggingHandle, setDraggingHandle] = useState<RangeHandle | null>(null);

    const startCheckpoint = LAB_CHECKPOINTS[startIndex] ?? LAB_CHECKPOINTS[0];
    const endCheckpoint =
        LAB_CHECKPOINTS[endIndex] ?? LAB_CHECKPOINTS[LAB_CHECKPOINTS.length - 1];
    const forensicExport = useMemo(
        () =>
            `export const F3_FORENSIC_LAYOUTS = ${JSON.stringify(forensicLayouts, null, 2)} as const;`,
        [forensicLayouts]
    );

    useEffect(() => {
        try {
            const raw = globalThis.window.localStorage.getItem(FORENSIC_LAYOUT_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw) as F3ForensicLayoutSet;
            if (
                parsed != null &&
                typeof parsed === "object" &&
                "desktop" in parsed &&
                "tablet" in parsed &&
                "mobile" in parsed
            ) {
                setForensicLayouts(parsed);
            }
        } catch {
            // Ignore malformed draft data and keep the seeded fallback.
        }
    }, []);

    useEffect(() => {
        globalThis.window.localStorage.setItem(
            FORENSIC_LAYOUT_STORAGE_KEY,
            JSON.stringify(forensicLayouts)
        );
    }, [forensicLayouts]);

    useEffect(() => {
        if (!copied) return;

        const timeoutId = globalThis.window.setTimeout(() => setCopied(false), 1400);
        return () => globalThis.window.clearTimeout(timeoutId);
    }, [copied]);

    useEffect(() => {
        startIndexRef.current = startIndex;
        endIndexRef.current = endIndex;
    }, [endIndex, startIndex]);

    const scrollToScene = () => {
        globalThis.window.requestAnimationFrame(() => {
            const scene = globalThis.document.getElementById("f3-lab-scene");
            if (!scene) return;

            const top =
                scene.getBoundingClientRect().top +
                globalThis.window.scrollY -
                globalThis.window.innerHeight * 0.62;

            globalThis.window.scrollTo({
                top: Math.max(top, 0),
                behavior: "auto",
            });
        });
    };

    const replayScene = () => {
        setSceneVersion((value) => value + 1);
        scrollToScene();
    };

    const handleStartChange = useCallback((value: number) => {
        const next = Math.min(value, endIndexRef.current);
        setStartIndex(next);
    }, []);

    const handleEndChange = useCallback((value: number) => {
        const next = Math.max(value, startIndexRef.current);
        setEndIndex(next);
    }, []);

    const resolveCheckpointIndexFromClientX = useCallback((clientX: number) => {
        const track = sliderTrackRef.current;
        if (!track) return null;

        const rect = track.getBoundingClientRect();
        if (rect.width <= 0) return null;

        const progress = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        return Math.round(progress * (LAB_CHECKPOINTS.length - 1));
    }, []);

    useEffect(() => {
        if (draggingHandle === null) return;

        const handlePointerMove = (event: PointerEvent) => {
            const nextIndex = resolveCheckpointIndexFromClientX(event.clientX);
            if (nextIndex == null) return;

            if (draggingHandle === "start") {
                handleStartChange(nextIndex);
            } else {
                handleEndChange(nextIndex);
            }
        };

        const stopDragging = () => setDraggingHandle(null);

        globalThis.window.addEventListener("pointermove", handlePointerMove);
        globalThis.window.addEventListener("pointerup", stopDragging);
        globalThis.window.addEventListener("pointercancel", stopDragging);

        return () => {
            globalThis.window.removeEventListener("pointermove", handlePointerMove);
            globalThis.window.removeEventListener("pointerup", stopDragging);
            globalThis.window.removeEventListener("pointercancel", stopDragging);
        };
    }, [draggingHandle, handleEndChange, handleStartChange, resolveCheckpointIndexFromClientX]);

    const beginHandleDrag = (handle: RangeHandle) => (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDraggingHandle(handle);
    };

    const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        const nextIndex = resolveCheckpointIndexFromClientX(event.clientX);
        if (nextIndex == null) return;

        const nearestHandle =
            Math.abs(nextIndex - startIndexRef.current) <= Math.abs(nextIndex - endIndexRef.current)
                ? "start"
                : "end";

        if (nearestHandle === "start") {
            handleStartChange(nextIndex);
        } else {
            handleEndChange(nextIndex);
        }

        setDraggingHandle(nearestHandle);
    };

    const freezeOnCheckpoint = (checkpointId: F3LabCheckpoint) => {
        const nextIndex = LAB_CHECKPOINTS.findIndex((checkpoint) => checkpoint.id === checkpointId);
        if (nextIndex < 0) return;

        setMode("range");
        setStartIndex(nextIndex);
        setEndIndex(nextIndex);
        setSceneVersion((value) => value + 1);
        scrollToScene();
    };

    const copyForensicLayouts = async () => {
        await globalThis.navigator.clipboard.writeText(forensicExport);
        setCopied(true);
    };

    const resetCurrentBreakpoint = () => {
        setForensicLayouts((current) => ({
            ...current,
            [calibrationBreakpoint]: {},
        }));
    };

    const resetAllBreakpoints = () => {
        setForensicLayouts(cloneF3ForensicLayoutSet());
    };

    return (
        <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
            <section className="relative overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_36%),linear-gradient(180deg,#09070d_0%,#0c0a0f_100%)]">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:px-10 md:py-24">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-[var(--accent-secondary)]">
                            F3 Transition Lab
                        </div>
                        <h1 className="max-w-[14ch] text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white md:text-6xl">
                            Test the real sequence, or cut it between exact checkpoints.
                        </h1>
                        <p className="max-w-2xl text-[1.02rem] leading-8 text-white/58 md:text-[1.08rem]">
                            Full normal mode runs the component exactly as it behaves on the page.
                            Range mode starts the sequence from the checkpoint you choose and freezes
                            it on the selected end checkpoint.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/12 px-5 text-sm font-semibold tracking-[-0.01em] text-white transition hover:border-[var(--accent-secondary)]/50 hover:bg-[var(--accent-secondary)]/18"
                            onClick={replayScene}
                        >
                            Replay
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

            <section className="border-b border-white/[0.06] bg-white/[0.02]">
                <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
                    <div className="mb-5 flex flex-wrap gap-3">
                        {[
                            { id: "full", label: "Full normal" },
                            { id: "range", label: "Range tool" },
                        ].map((option) => {
                            const active = mode === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold tracking-[-0.01em] transition ${
                                        active
                                            ? "border-[var(--accent-secondary)]/42 bg-[var(--accent-secondary)]/16 text-white"
                                            : "border-white/[0.1] bg-white/[0.02] text-white/72 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                    }`}
                                    onClick={() => setMode(option.id as "full" | "range")}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                    {mode === "range" ? (
                        <div className="rounded-[28px] border border-white/[0.08] bg-black/20 px-5 py-6 md:px-6">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/42">
                                        Checkpoint range
                                    </p>
                                    <p className="mt-2 text-sm text-white/64">
                                        Start: {startCheckpoint.label}
                                        {"  "}-{"  "}
                                        End: {endCheckpoint.label}
                                    </p>
                                </div>
                            </div>

                            <div className="relative pb-12 pt-8">
                                <div className="absolute left-3 right-3 top-[2.18rem] h-px bg-white/[0.1]" />
                                <div
                                    className="absolute top-[2.18rem] h-px bg-[var(--accent-secondary)]/55"
                                    style={{
                                        left: `calc(${(startIndex / (LAB_CHECKPOINTS.length - 1)) * 100}% + 0.75rem)`,
                                        width: `calc(${((endIndex - startIndex) / (LAB_CHECKPOINTS.length - 1)) * 100}% - 0rem)`,
                                    }}
                                />
                                <div
                                    ref={sliderTrackRef}
                                    className="absolute left-3 right-3 top-[2.18rem] h-8 -translate-y-1/2 cursor-pointer"
                                    style={{ touchAction: "none" }}
                                    onPointerDown={handleTrackPointerDown}
                                />
                                {[
                                    {
                                        id: "start",
                                        label: "Start",
                                        index: startIndex,
                                    },
                                    {
                                        id: "end",
                                        label: "End",
                                        index: endIndex,
                                    },
                                ].map((handle) => (
                                    <button
                                        key={handle.id}
                                        type="button"
                                        aria-label={`${handle.label} checkpoint handle`}
                                        className={`absolute top-[2.18rem] z-[2] flex h-8 min-w-[4.3rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full border px-3 text-[0.64rem] font-semibold uppercase tracking-[0.14em] transition ${
                                            draggingHandle === handle.id
                                                ? "cursor-grabbing border-[var(--accent-secondary)]/70 bg-[color-mix(in_srgb,var(--accent-secondary)_24%,#0b0910)] text-white shadow-[0_0_0_1px_rgba(167,139,250,0.2),0_10px_24px_rgba(76,29,149,0.26)]"
                                                : "cursor-grab border-white/[0.12] bg-[rgba(11,9,16,0.92)] text-white/72 shadow-[0_8px_18px_rgba(0,0,0,0.24)] hover:border-white/[0.18] hover:text-white"
                                        }`}
                                        style={{
                                            left: `calc(${(handle.index / (LAB_CHECKPOINTS.length - 1)) * 100}% + 0.75rem)`,
                                            touchAction: "none",
                                        }}
                                        onPointerDown={beginHandleDrag(handle.id)}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                                        {handle.label}
                                    </button>
                                ))}

                                <div className="relative flex justify-between">
                                    {LAB_CHECKPOINTS.map((checkpoint, index) => {
                                        const active = index >= startIndex && index <= endIndex;

                                        return (
                                            <button
                                                key={checkpoint.id}
                                                type="button"
                                                className="group relative flex w-24 flex-col items-center text-center"
                                                onClick={() => {
                                                    if (
                                                        Math.abs(index - startIndex) <=
                                                        Math.abs(index - endIndex)
                                                    ) {
                                                        handleStartChange(index);
                                                    } else {
                                                        handleEndChange(index);
                                                    }
                                                }}
                                            >
                                                <span
                                                    className={`relative z-[1] flex h-6 w-6 items-center justify-center rounded-full border text-[0.58rem] font-semibold transition ${
                                                        active
                                                            ? "border-[var(--accent-secondary)]/65 bg-[var(--accent-secondary)]/18 text-white"
                                                            : "border-white/[0.14] bg-[var(--background)] text-white/44"
                                                    }`}
                                                >
                                                    {checkpoint.short}
                                                </span>
                                                <span className="mt-3 text-[0.72rem] font-medium leading-tight text-white/68 transition group-hover:text-white">
                                                    {checkpoint.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-white/[0.08] bg-black/20 px-5 py-4 text-sm text-white/62 md:px-6">
                                {startCheckpoint.description}
                                {" "}
                                It will then run until {endCheckpoint.label.toLowerCase()} and freeze there.
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[24px] border border-white/[0.08] bg-black/20 px-5 py-4 text-sm text-white/62 md:px-6">
                            The scene below is running in full normal mode, with no checkpoint
                            overrides.
                        </div>
                    )}

                    <div className="mt-6 rounded-[22px] border border-white/[0.08] bg-black/20 px-5 py-4 md:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/42">
                                    Forensic calibration
                                </p>
                                <p className="mt-1 text-sm leading-6 text-white/54">
                                    Calibration tools for annotation geometry.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold tracking-[-0.01em] transition ${
                                        calibrationEnabled
                                            ? "border-[var(--accent-secondary)]/42 bg-[var(--accent-secondary)]/16 text-white"
                                            : "border-white/[0.1] bg-white/[0.02] text-white/72 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                    }`}
                                    onClick={() => setCalibrationEnabled((value) => !value)}
                                >
                                    {calibrationEnabled ? "Calibration on" : "Calibration off"}
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-5 text-sm font-semibold tracking-[-0.01em] text-white/78 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                    onClick={() => setCalibrationPanelOpen((value) => !value)}
                                >
                                    {calibrationPanelOpen ? "Hide panel" : "Show panel"}
                                </button>
                            </div>
                        </div>

                        {calibrationPanelOpen ? (
                            <>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-5 text-sm font-semibold tracking-[-0.01em] text-white/78 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                        onClick={() => freezeOnCheckpoint("end-surface")}
                                    >
                                        Freeze on end surface
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-5 text-sm font-semibold tracking-[-0.01em] text-white/78 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                        onClick={() => freezeOnCheckpoint("absolute-end")}
                                    >
                                        Freeze on absolute end
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-5 text-sm font-semibold tracking-[-0.01em] text-white/78 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                        onClick={resetCurrentBreakpoint}
                                    >
                                        Reset {calibrationBreakpoint}
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-5 text-sm font-semibold tracking-[-0.01em] text-white/78 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                        onClick={resetAllBreakpoints}
                                    >
                                        Reset all
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/12 px-5 text-sm font-semibold tracking-[-0.01em] text-white transition hover:border-[var(--accent-secondary)]/50 hover:bg-[var(--accent-secondary)]/18"
                                        onClick={() => void copyForensicLayouts()}
                                    >
                                        {copied ? "Copied" : "Copy export"}
                                    </button>
                                </div>

                                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
                                    <div className="rounded-[24px] border border-white/[0.08] bg-black/20 p-5">
                                        <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-white/42">
                                            Breakpoint profile
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {F3_FORENSIC_BREAKPOINTS.map((breakpoint) => {
                                                const active = calibrationBreakpoint === breakpoint;
                                                return (
                                                    <button
                                                        key={breakpoint}
                                                        type="button"
                                                        className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold tracking-[-0.01em] capitalize transition ${
                                                            active
                                                                ? "border-[var(--accent-secondary)]/42 bg-[var(--accent-secondary)]/16 text-white"
                                                                : "border-white/[0.1] bg-white/[0.02] text-white/72 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                                                        }`}
                                                        onClick={() => setCalibrationBreakpoint(breakpoint)}
                                                    >
                                                        {breakpoint}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-white/58">
                                            The active profile is forced into the overlay while you edit, so
                                            you can tune desktop, tablet, and mobile separately without
                                            changing the measured targets.
                                        </p>
                                    </div>

                                    <div className="rounded-[24px] border border-white/[0.08] bg-black/20 p-5">
                                        <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-white/42">
                                            Export
                                        </p>
                                        <p className="mt-3 text-sm leading-7 text-white/58">
                                            Paste this back into the production component once the geometry is
                                            locked.
                                        </p>
                                        <textarea
                                            readOnly
                                            value={forensicExport}
                                            className="mt-4 min-h-[16rem] w-full rounded-[20px] border border-white/[0.08] bg-[rgba(8,8,12,0.86)] px-4 py-4 font-mono text-[0.76rem] leading-6 text-white/70 outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="mt-4 text-sm leading-6 text-white/48">
                                Panel hidden. Current geometry still applies to the scene below.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section id="f3-lab-scene" className="pb-24 pt-10 md:pb-32 md:pt-14">
                <div className="full-bleed bg-[var(--background)]">
                    <F3StateOneScene
                        key={`${sceneVersion}-${mode}-${startIndex}-${endIndex}`}
                        sceneHeightClassName="h-[260vh]"
                        labRange={
                            mode === "range"
                                ? {
                                      start: startCheckpoint.id,
                                      end: endCheckpoint.id,
                                  }
                                 : undefined
                         }
                        forensicLayouts={forensicLayouts}
                        forensicEditor={
                            calibrationEnabled
                                ? {
                                      enabled: true,
                                      breakpointOverride: calibrationBreakpoint,
                                      onLayoutsChange: (next) => setForensicLayouts(next),
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
