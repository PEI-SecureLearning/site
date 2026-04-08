"use client";

import Image from "next/image";
import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MutableRefObject,
    Fragment,
} from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip";

gsap.registerPlugin(Flip);

type HowItWorksStep = {
    id: string;
    number: string;
    title: string;
    captionLines: readonly [string, string];
    stageGlow: string;
    beamStyle: CSSProperties;
};

const STEPS: readonly HowItWorksStep[] = [
    {
        id: "import",
        number: "01",
        title: "Import your org",
        captionLines: ["Connect via LDAP/AD or CSV.", "Tag users by role, department, and risk profile."],
        stageGlow:
            "radial-gradient(38% 46% at 18% 20%, rgba(167,139,250,0.18) 0%, rgba(167,139,250,0.05) 34%, transparent 72%), radial-gradient(44% 54% at 84% 78%, rgba(124,58,237,0.14) 0%, transparent 76%)",
        beamStyle: {
            background:
                "linear-gradient(118deg, rgba(167,139,250,0.13) 0%, rgba(167,139,250,0.04) 42%, transparent 100%)",
            opacity: 0.54,
            transform: "translate3d(-8%, -10%, 0) rotate(-16deg)",
        },
    },
    {
        id: "build",
        number: "02",
        title: "Design your campaign",
        captionLines: ["Choose templates, set lure types, schedule waves, segment by group.", ""],
        stageGlow:
            "radial-gradient(34% 40% at 50% 18%, rgba(167,139,250,0.16) 0%, rgba(167,139,250,0.04) 32%, transparent 74%), radial-gradient(34% 42% at 80% 76%, rgba(124,58,237,0.16) 0%, transparent 72%)",
        beamStyle: {
            background:
                "linear-gradient(96deg, rgba(167,139,250,0.12) 0%, rgba(167,139,250,0.04) 36%, transparent 100%)",
            opacity: 0.48,
            transform: "translate3d(10%, -2%, 0) rotate(-8deg)",
        },
    },
    {
        id: "launch",
        number: "03",
        title: "Launch & monitor",
        captionLines: ["Real-time tracking of clicks, credentials submitted, and time-to-click.", ""],
        stageGlow:
            "radial-gradient(34% 42% at 76% 24%, rgba(167,139,250,0.15) 0%, rgba(167,139,250,0.04) 32%, transparent 72%), radial-gradient(40% 50% at 20% 84%, rgba(124,58,237,0.18) 0%, transparent 76%)",
        beamStyle: {
            background:
                "linear-gradient(132deg, rgba(167,139,250,0.12) 0%, rgba(124,58,237,0.04) 38%, transparent 100%)",
            opacity: 0.58,
            transform: "translate3d(14%, 8%, 0) rotate(10deg)",
        },
    },
    {
        id: "train",
        number: "04",
        title: "Review & improve",
        captionLines: [
            "Export KPIs, see susceptibility trends, and auto-assign follow-up training.",
            "",
        ],
        stageGlow:
            "radial-gradient(36% 42% at 82% 20%, rgba(167,139,250,0.16) 0%, rgba(167,139,250,0.04) 30%, transparent 72%), radial-gradient(44% 50% at 18% 82%, rgba(124,58,237,0.18) 0%, transparent 76%)",
        beamStyle: {
            background:
                "linear-gradient(102deg, rgba(167,139,250,0.13) 0%, rgba(167,139,250,0.04) 36%, transparent 100%)",
            opacity: 0.52,
            transform: "translate3d(-2%, 12%, 0) rotate(18deg)",
        },
    },
] as const;

const AUTOPLAY_INTERVAL_MS = 6000;
const CARD_FILL_DURATION_MS = 4600;
/** Share of each step segment spent tracing the active card outline (rest = vertical connector). */
const CARD_SEGMENT_FRACTION = CARD_FILL_DURATION_MS / AUTOPLAY_INTERVAL_MS;
/**
 * Symmetric commit band in `stepFloat` units: advance at `sf >= c + B`, retreat at `sf <= c - B`.
 * Leaves a dead zone so crossing one threshold cannot immediately ping-pong the other way.
 */
const COMMIT_BAND = 0.55;
/** Idle fallback when `scrollend` is missing (Safari / some Firefox). */
const SCROLL_IDLE_MS = 72;
/** Ignore scroll-based step commits while smooth `scrollIntoView` from tab/keyboard catches up. */
const PROGRAMMATIC_SCROLL_GUARD_MS = 1200;
const SNAP_DURATION_S = 0.22;
const ACTIVE_CARD_RADIUS_PX = 48;
/** Width/height tween (scale:false) avoids non-uniform scaleX/Y that turns circles into “number ovals”. */
const FLIP_DURATION_S = 0.78;
/** Constant rate — no ease-in/out slowdown at the end. */
const FLIP_EASE = "none";
/**
 * Stage media for the committed step only (`activeIndex`). When you add `<video>` per step, keep
 * `activeIndex` as the committed index; on `timeupdate`, report normalized progress (0–1) to the
 * parent only while the user is not scroll-scrubbing, and merge it into the same **segment**
 * progress (card outline + vertical connector) as autoplay — do not change `activeIndex` until
 * scroll/keyboard/tab commits as today.
 */
function StagePanels({
    activeIndex,
    idBase,
}: Readonly<{
    activeIndex: number;
    idBase: string;
}>) {
    return (
        <div className="relative w-full max-w-[1240px]">
            {/* ── Glass Display ── */}
            <div className="hiw-glass-display relative aspect-[1920/976] overflow-hidden rounded-[18px] bg-[#05060b]">

                {/* Top-edge specular highlight — light catching a glass bezel */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[1px]"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.07) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.07) 75%, transparent 92%)",
                    }}
                />

                {/* Inner edge vignette — recessed screen depth */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
                    style={{
                        boxShadow:
                            "inset 0 2px 6px rgba(0,0,0,0.25), inset 0 -1px 3px rgba(0,0,0,0.15), inset 2px 0 4px rgba(0,0,0,0.08), inset -2px 0 4px rgba(0,0,0,0.08)",
                    }}
                />

                {STEPS.map((step, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={step.id}
                            id={`${idBase}-panel-${step.id}`}
                            role="tabpanel"
                            aria-labelledby={`${idBase}-tab-${step.id}`}
                            aria-hidden={!isActive}
                            tabIndex={isActive ? 0 : -1}
                            className={`absolute inset-0 transition-[opacity,transform,filter] duration-1000 ease-out ${isActive ? "scale-100 blur-none opacity-100 z-10" : "scale-[1.03] blur-[4px] opacity-0 z-0 pointer-events-none"}`}
                        >
                            <div
                                className="absolute inset-0 mix-blend-screen"
                                style={{ background: step.stageGlow }}
                            />
                            <div
                                className="absolute left-[10%] top-[20%] h-[60%] w-[50%] rounded-[999px] blur-[100px] mix-blend-screen"
                                style={{ ...step.beamStyle, transition: "none" }}
                            />

                            <Image
                                src="/assets/placeholders/how-it-works-admin-console.png"
                                alt={step.title}
                                fill
                                sizes="(min-width: 1024px) 1024px, 92vw"
                                className="object-cover object-top opacity-90"
                                priority={index === 0}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Ambient ground glow */}
            <div className="pointer-events-none absolute -bottom-16 inset-x-[12%] h-36 rounded-[100%] bg-[rgba(167,139,250,0.10)] blur-[72px]" />

            <style jsx>{`
                .hiw-glass-display {
                    box-shadow:
                        /* Primary depth shadow */
                        0 44px 100px rgba(0, 0, 0, 0.55),
                        0 18px 44px rgba(0, 0, 0, 0.3),
                        /* Outer bezel ring */
                        0 0 0 1px rgba(255, 255, 255, 0.06),
                        /* Bottom edge catch — faint light on the chin */
                        0 1px 0 rgba(255, 255, 255, 0.03);
                }
            `}</style>
        </div>
    );
}

function canonicalSegmentCombinedFromElapsed(elapsedMs: number): number {
    return Math.min(1, Math.max(0, elapsedMs / AUTOPLAY_INTERVAL_MS));
}

/** Vertical connector fill (0–100) for each spine segment from unified segment progress [0,1]. */
function connectorFillsFromSegmentCombined(committedIndex: number, segmentCombined01: number): number[] {
    const r = CARD_SEGMENT_FRACTION;
    const c = segmentCombined01;
    const activeConn =
        c <= r ? 0 : ((c - r) / (1 - r)) * 100;
    return Array.from({ length: STEPS.length - 1 }, (_, i) => {
        if (committedIndex > i) return 100;
        if (committedIndex < i) return 0;
        return Math.min(100, Math.max(0, activeConn));
    });
}

/** Card fork stroke progress (0–1) from the same unified segment progress as the spine. */
function cardOutlineProgressFromCombined(segmentCombined01: number): number {
    const r = CARD_SEGMENT_FRACTION;
    return Math.min(1, Math.max(0, segmentCombined01 / r));
}

function SingleLineTimeline({
    activeIndex,
    cardOutlineProgress01,
    connectorFillPercents,
    idBase,
    tabRefs,
    onSelectStep,
    onTabKeyDown,
    progressKey
}: Readonly<{
    activeIndex: number;
    /** 0–1: shared timeline progress through the active card border (same clock as spine). */
    cardOutlineProgress01: number;
    /** 0–100 height for each spine segment below step i (length STEPS.length - 1). */
    connectorFillPercents: readonly number[];
    idBase: string;
    tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
    onSelectStep: (index: number) => void;
    onTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
    progressKey: number;
}>) {
    return (
        <div className="w-full flex-col items-center space-y-4">
            <div
                role="tablist"
                aria-orientation="vertical"
                aria-label="How SecureLearning works timeline"
                className="flex flex-col w-full items-center"
            >
                {STEPS.map((step, index) => {
                    const isActive = index === activeIndex;
                    const isPast = index < activeIndex;

                    return (
                        <Fragment key={step.id}>
                            <button
                                ref={(button) => {
                                    tabRefs.current[index] = button;
                                }}
                                id={`${idBase}-tab-${step.id}`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`${idBase}-panel-${step.id}`}
                                aria-label={step.title}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => onSelectStep(index)}
                                onKeyDown={(event) => onTabKeyDown(event, index)}
                                className={`
                                    group relative overflow-hidden focus-visible:outline-none z-10 mx-auto
                                    ${isActive
                                        ? `hiw-active-card flex w-full min-h-[175px] flex-col items-center justify-start rounded-[48px] bg-[#0d071b] px-4 pb-8 pt-5 mb-4 h-auto md:min-h-[185px]${index > 0 ? " -mt-[7px]" : ""}`
                                        : 'flex h-[44px] w-[44px] items-center justify-center rounded-[999px] bg-[#05060b] md:h-[50px] md:w-[50px] mb-4'
                                    }
                                    ${!isActive && isPast ? 'shadow-[0_0_24px_rgba(167,139,250,0.25)]' : ''}
                                    ${!isActive && !isPast ? 'hover:bg-white/[0.05]' : ''}
                                `}
                            >
                                <div
                                    className={`
                                        absolute inset-0 rounded-[inherit] pointer-events-none z-0
                                        ${isActive
                                            ? ''
                                            : isPast
                                                ? 'shadow-[inset_0_0_0_1.5px_#a78bfa]'
                                                : 'shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.15)]'}
                                    `}
                                />

                                {isActive && (
                                    <ActiveCardBorder progressKey={progressKey} outlineProgress01={cardOutlineProgress01} />
                                )}

                                {/* Continues the spine into the pill so the stroke doesn’t stop short of the border */}
                                {isActive && index > 0 && (
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute left-1/2 top-0 z-[6] h-[14px] w-[2px] -translate-x-1/2 -translate-y-full bg-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.65)]"
                                    />
                                )}

                                <div className="relative z-10 flex w-full flex-col items-center justify-start px-2">
                                    <div
                                        className={`
                                        relative shrink-0 flex items-center justify-center
                                        ${isActive
                                            ? 'z-20 mb-1 h-[32px] w-[32px] rounded-[999px] border-[1px] border-white/10 bg-white/[0.03]'
                                            : 'h-[44px] w-[44px] md:h-[50px] md:w-[50px]'
                                        }
                                    `}
                                    >
                                        <span
                                            className={`font-bold tracking-widest ${
                                                isActive ? 'text-white/30 text-[0.7rem]' : 'text-white/40 text-[0.95rem] md:text-[1.1rem]'
                                            } ${isPast && !isActive ? 'text-white/90' : ''}`}
                                        >
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Fixed-width block: layout is stable; overflow-hidden on the button reveals it as the shell widens */}
                                    {isActive && (
                                        <div
                                            key={`${step.id}-body`}
                                            className="pointer-events-none absolute left-1/2 top-9 z-[12] w-[350px] -translate-x-1/2 text-center"
                                        >
                                            <h3 className="text-[1.5rem] font-bold leading-tight tracking-tight text-white md:text-[1.85rem]">{step.title}</h3>
                                            <div className="mt-3 flex flex-col space-y-1">
                                                <p className="text-[0.9rem] font-medium leading-relaxed text-white/50 md:text-[0.95rem]">{step.captionLines[0]} {step.captionLines[1]}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>

                            {index !== STEPS.length - 1 && (
                                <div
                                    className="relative -mt-3 -mb-[7px] flex h-[44px] w-full items-stretch justify-center"
                                    aria-hidden="true"
                                >
                                    <div className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 bg-white/[0.09]" />
                                    {(isPast || isActive) && (
                                        <div
                                            className="absolute left-1/2 top-0 w-[2px] -translate-x-1/2 origin-top bg-[#a78bfa] shadow-[0_0_14px_rgba(167,139,250,0.55)]"
                                            style={{
                                                height: `${connectorFillPercents[index] ?? 0}%`,
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>
            <style jsx>{`
                .hiw-active-card {
                    box-shadow:
                        0 -12px 28px -16px rgba(167, 139, 250, 0.22),
                        0 48px 80px rgba(0, 0, 0, 0.6),
                        0 0 0 1.5px rgba(255, 255, 255, 0.04),
                        inset 0 0 32px rgba(167, 139, 250, 0.12);
                }
            `}</style>
        </div>
    );
}

function ActiveCardBorder({
    progressKey,
    outlineProgress01,
}: Readonly<{ progressKey: number; outlineProgress01: number }>) {
    const frameRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;

        const updateSize = () => {
            const nextWidth = frame.clientWidth;
            const nextHeight = frame.clientHeight;
            setSize((current) =>
                current.width === nextWidth && current.height === nextHeight
                    ? current
                    : { width: nextWidth, height: nextHeight }
            );
        };

        updateSize();

        if (typeof ResizeObserver === "undefined") return;

        const observer = new ResizeObserver(() => updateSize());
        observer.observe(frame);

        return () => observer.disconnect();
    }, []);

    const inset = 1;
    const strokeWidth = 2;
    const x = inset;
    const y = inset;
    const width = Math.max(size.width - inset * 2, 0);
    const height = Math.max(size.height - inset * 2, 0);
    const radius = Math.max(0, Math.min(ACTIVE_CARD_RADIUS_PX, width / 2, height / 2));
    const centerX = x + width / 2;
    const rightX = x + width;
    const bottomY = y + height;

    const leftPath = `M ${centerX} ${y} H ${x + radius} A ${radius} ${radius} 0 0 0 ${x} ${y + radius} V ${bottomY - radius} A ${radius} ${radius} 0 0 0 ${x + radius} ${bottomY} H ${centerX}`;
    const rightPath = `M ${centerX} ${y} H ${rightX - radius} A ${radius} ${radius} 0 0 1 ${rightX} ${y + radius} V ${bottomY - radius} A ${radius} ${radius} 0 0 1 ${rightX - radius} ${bottomY} H ${centerX}`;
    const dashOffset = 100 * (1 - outlineProgress01);

    return (
        <div
            ref={frameRef}
            key={`progress-${progressKey}`}
            className="absolute inset-0 rounded-[inherit] pointer-events-none z-20"
        >
            {width > 0 && height > 0 && (
                <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox={`0 0 ${size.width} ${size.height}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        d={leftPath}
                        pathLength="100"
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            filter: "drop-shadow(0 0 6px rgba(167,139,250,0.95))",
                            strokeDasharray: 100,
                            strokeDashoffset: dashOffset,
                        }}
                    />
                    <path
                        d={rightPath}
                        pathLength="100"
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            filter: "drop-shadow(0 0 6px rgba(167,139,250,0.95))",
                            strokeDasharray: 100,
                            strokeDashoffset: dashOffset,
                        }}
                    />
                </svg>
            )}
        </div>
    );
}

function captureTimelineFlipState(
    tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>,
    flipStateBeforeRef: MutableRefObject<Flip.FlipState | null>
) {
    const buttons = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (buttons.length === 0) return;
    flipStateBeforeRef.current = Flip.getState(buttons, {
        props: "borderRadius,backgroundColor,boxShadow",
    });
}

export default function HowItWorks() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const sentenceRef = useRef<HTMLParagraphElement | null>(null);
    const contentGridRef = useRef<HTMLDivElement | null>(null);
    const introWrapperRef = useRef<HTMLDivElement | null>(null);
    const idBase = useId().replace(/:/g, "");
    const flipStateBeforeRef = useRef<Flip.FlipState | null>(null);
    const flipCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null);
    const activeIndexRef = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [progressKey, setProgressKey] = useState(0);
    /** Only true after an explicit click/keyboard interaction — NOT scroll. */
    const [userHasInteracted, setUserHasInteracted] = useState(false);
    const suppressScrollCommitUntilRef = useRef(0);
    /** One scalar for the committed step: card outline + connector below share this [0,1] progress. */
    const [segmentCombined01, setSegmentCombined01] = useState(0);
    const segmentCombinedRef = useRef(0);
    segmentCombinedRef.current = segmentCombined01;

    const scrollStartSfRef = useRef(0);
    const scrollStartCombinedRef = useRef(0);
    const isVisibleRef = useRef(false);

    const connectorFillPercents = useMemo(
        () => connectorFillsFromSegmentCombined(activeIndex, segmentCombined01),
        [activeIndex, segmentCombined01]
    );
    const cardOutlineProgress01 = useMemo(
        () => cardOutlineProgressFromCombined(segmentCombined01),
        [segmentCombined01]
    );

    const isScrollingRef = useRef(false);
    const isSnappingRef = useRef(false);
    const scrollRafRef = useRef<number | null>(null);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const snapTweenRef = useRef<gsap.core.Tween | null>(null);
    const stepFloatRef = useRef(0);
    const stepClockStartRef = useRef(0);
    const savedElapsedOnScrollStartRef = useRef(0);
    const reduceMotionRef = useRef(false);
    /** Smoothed step-float for the intro visuals — lerped toward the real value each frame. */
    const smoothSfRef = useRef<number | null>(null);  // null = not yet initialised
    /** True once the content grid has fully faded in after the intro. */
    const contentReadyRef = useRef(false);

    activeIndexRef.current = activeIndex;

    /**
     * Step float with intro offset.
     * returns -1 when the section top hits viewport top (intro phase begins).
     * returns  0 when the intro viewport has been fully scrolled (step 0 starts).
     * +1 per additional vh of travel.
     */
    const computeStepFloat = useCallback(() => {
        const section = sectionRef.current;
        if (!section) return -1;
        const vh = window.innerHeight || 1;
        return -section.getBoundingClientRect().top / vh - 1;
    }, []);

    /**
     * Drives the intro → content wipe in 3 phases:
     *   Settle (0→0.1):  sentence rises from +8vh to centre.
     *   Dock   (0.1→0.4): sentence holds at centre — reading time.
     *   Wipe   (0.4→1.0): whole stack slides up, sentence exits top,
     *                      content rises into centre from below.
     */
    const updateIntroVisuals = useCallback((sf: number) => {
        const introF = Math.max(0, Math.min(1, sf + 1));

        // --- Wrapper translation ---
        // Pre-shifted MORE than the opacity (1.35 vs 1.25) so the wrapper
        // begins moving while the sentence is still invisible — the hard start
        // from the clamping corner is hidden in the dark.
        const wrapper = introWrapperRef.current;
        if (wrapper) {
            const wf = sf + 1.35;
            let travel: number;
            if (wf < 0) {
                travel = 10;                                     // before everything
            } else if (wf < 0.35) {
                travel = 10 * (1 - wf / 0.35);                  // settle
            } else if (wf < 0.75) {
                travel = 0;                                      // dock
            } else {
                const wipeF = Math.min(1, (wf - 0.75) / 0.6);   // wipe
                travel = -70 * wipeF;
            }
            wrapper.style.transform = `translateY(${travel}vh)`;
        }

        // --- Sentence opacity + blur (pre-shifted so it appears a touch earlier) ---
        const sentence = sentenceRef.current;
        if (sentence) {
            const sp = sf + 1.25; // starts ~25vh before the main intro phase
            let op: number;
            if (sp < 0) op = 0;
            else if (sp < 0.35) op = sp / 0.35;                // gradual fade in
            else if (sp < 0.5) op = 1;                          // hold during dock
            else if (sp < 0.8) op = 1 - (sp - 0.5) / 0.3;      // fade out during wipe
            else op = 0;
            const blur = sp > 0.55 ? ((sp - 0.55) / 0.45) * 8 : 0;

            sentence.style.opacity = String(Math.max(0, Math.min(1, op)));
            sentence.style.filter = blur > 0.1 ? `blur(${blur}px)` : "none";
        }

        // --- Content grid opacity ---
        const grid = contentGridRef.current;
        if (grid) {
            const contentF = Math.max(0, Math.min(1, (introF - 0.45) / 0.4)); // 0.45→0.85
            grid.style.opacity = String(contentF);

            // Gate autoplay: content is "ready" once fully opaque
            if (contentF >= 0.98 && !contentReadyRef.current) {
                contentReadyRef.current = true;
                stepClockStartRef.current = performance.now(); // fresh timer
            }
        }
    }, []);

    const applyStepIndex = useCallback((nextIndex: number) => {
        if (nextIndex === activeIndexRef.current) return;
        activeIndexRef.current = nextIndex;
        stepClockStartRef.current = performance.now();
        captureTimelineFlipState(tabRefs, flipStateBeforeRef);
        setActiveIndex(nextIndex);
        setProgressKey((k) => k + 1);
    }, []);

    const applyNextStepAutoplay = useCallback(() => {
        const c = activeIndexRef.current;
        if (c >= STEPS.length - 1) return;
        applyStepIndex(c + 1);
    }, [applyStepIndex]);

    const runSnapToCanonical = useCallback(() => {
        snapTweenRef.current?.kill();
        snapTweenRef.current = null;
        const elapsed = performance.now() - stepClockStartRef.current;
        const target = canonicalSegmentCombinedFromElapsed(elapsed);
        const start = segmentCombinedRef.current;
        if (reduceMotionRef.current) {
            setSegmentCombined01(target);
            isSnappingRef.current = false;
            return;
        }
        const proxy = { t: 0 };
        isSnappingRef.current = true;
        snapTweenRef.current = gsap.to(proxy, {
            t: 1,
            duration: SNAP_DURATION_S,
            ease: "power1.out",
            onUpdate: () => {
                const k = proxy.t;
                setSegmentCombined01(start + (target - start) * k);
            },
            onComplete: () => {
                isSnappingRef.current = false;
                snapTweenRef.current = null;
                setSegmentCombined01(target);
            },
        });
    }, []);

    const finishScrollInteraction = useCallback(() => {
        if (!isScrollingRef.current) return;

        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (scrollRafRef.current != null) {
            cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = null;
        }

        const sf = computeStepFloat();
        stepFloatRef.current = sf;

        const startSf = scrollStartSfRef.current;
        const startC = scrollStartCombinedRef.current;
        const combined = Math.min(1, Math.max(0, startC + sf - startSf));
        setSegmentCombined01(combined);

        isScrollingRef.current = false;

        const c = activeIndexRef.current;
        const sfClamped = Math.max(0, Math.min(STEPS.length - 1, sf));
        const nearest = Math.max(0, Math.min(STEPS.length - 1, Math.round(sfClamped)));
        const distance = Math.abs(sf - c);

        const allowScrollCommit = performance.now() >= suppressScrollCommitUntilRef.current;
        if (allowScrollCommit && nearest !== c && distance >= COMMIT_BAND) {
            applyStepIndex(nearest);
            return;
        }

        stepClockStartRef.current = performance.now() - savedElapsedOnScrollStartRef.current;
        runSnapToCanonical();
    }, [applyStepIndex, computeStepFloat, runSnapToCanonical]);

    useLayoutEffect(() => {
        flipCtxRef.current?.revert();
        flipCtxRef.current = null;

        const state = flipStateBeforeRef.current;
        flipStateBeforeRef.current = null;
        if (!state) return;

        flipCtxRef.current = gsap.context(() => {
            Flip.from(state, {
                duration: FLIP_DURATION_S,
                ease: FLIP_EASE,
                nested: false,
                absolute: false,
                scale: false,
            });
        });

        return () => {
            flipCtxRef.current?.revert();
            flipCtxRef.current = null;
        };
    }, [activeIndex]);

    useEffect(() => {
        stepClockStartRef.current = performance.now();
        setSegmentCombined01(0);
    }, [activeIndex]);

    useLayoutEffect(() => {
        if (typeof window === "undefined") return;
        reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    /** Initial scroll position → committed step + fills (no Flip on first paint). */
    useLayoutEffect(() => {
        const sf = computeStepFloat();
        const sfClamped = Math.max(0, Math.min(STEPS.length - 1, sf));
        stepFloatRef.current = sfClamped;
        const initial = Math.round(sfClamped);
        activeIndexRef.current = initial;
        setActiveIndex((prev) => (prev === initial ? prev : initial));
        setSegmentCombined01(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time sync to scroll on mount
    }, []);

    /** Only autoplay when the section is actually visible. Reset clock on each visibility entry. */
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const wasVisible = isVisibleRef.current;
                isVisibleRef.current = entry.isIntersecting;
                if (!wasVisible && entry.isIntersecting) {
                    stepClockStartRef.current = performance.now();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const scheduleScrollRead = () => {
            if (scrollRafRef.current != null) return;
            scrollRafRef.current = window.requestAnimationFrame(() => {
                scrollRafRef.current = null;
                const sf = computeStepFloat();
                stepFloatRef.current = sf;
                if (!isScrollingRef.current) return;

                const startSf = scrollStartSfRef.current;
                const startC = scrollStartCombinedRef.current;
                const combined = Math.min(1, Math.max(0, startC + sf - startSf));
                setSegmentCombined01(combined);
            });
        };

        const onScroll = () => {
            const sf = computeStepFloat();
            const inSection = sf >= 0 && sf <= STEPS.length - 1;

            if (!inSection) {
                if (isScrollingRef.current) finishScrollInteraction();
                return;
            }

            if (!isScrollingRef.current) {
                isScrollingRef.current = true;

                if (isSnappingRef.current) {
                    snapTweenRef.current?.kill();
                    snapTweenRef.current = null;
                    isSnappingRef.current = false;
                    const canonical = canonicalSegmentCombinedFromElapsed(
                        performance.now() - stepClockStartRef.current
                    );
                    segmentCombinedRef.current = canonical;
                    setSegmentCombined01(canonical);
                }

                scrollStartSfRef.current = sf;
                scrollStartCombinedRef.current = segmentCombinedRef.current;
                savedElapsedOnScrollStartRef.current = performance.now() - stepClockStartRef.current;
            }

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            idleTimerRef.current = setTimeout(() => {
                idleTimerRef.current = null;
                finishScrollInteraction();
            }, SCROLL_IDLE_MS);

            scheduleScrollRead();
        };

        const onScrollEnd = () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            finishScrollInteraction();
        };

        const onResize = () => {
            const sf = computeStepFloat();
            stepFloatRef.current = sf;
            if (isScrollingRef.current) {
                const startSf = scrollStartSfRef.current;
                const startC = scrollStartCombinedRef.current;
                const combined = Math.min(1, Math.max(0, startC + sf - startSf));
                setSegmentCombined01(combined);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("scrollend", onScrollEnd);
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("scrollend", onScrollEnd);
            window.removeEventListener("resize", onResize);
            if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            snapTweenRef.current?.kill();
        };
    }, [computeStepFloat, finishScrollInteraction]);

    /** Drive unified segment progress (card outline + spine) from the same clock as autoplay. */
    useEffect(() => {
        if (typeof window === "undefined") return;
        let rafId = 0;

        const LERP_FACTOR = 0.085; // lower = smoother/floatier

        const tick = () => {
            rafId = window.requestAnimationFrame(tick);
            if (!isVisibleRef.current) return;

            // Smooth the step float for intro visuals
            const rawSf = computeStepFloat();
            if (smoothSfRef.current === null) {
                // First visible frame: snap to current position (no lerp lag on load)
                smoothSfRef.current = rawSf;
            } else {
                smoothSfRef.current += (rawSf - smoothSfRef.current) * LERP_FACTOR;
            }
            updateIntroVisuals(smoothSfRef.current);

            if (isScrollingRef.current || isSnappingRef.current) return;

            // Don't autoplay until the intro wipe is complete and content is visible
            if (!contentReadyRef.current) return;

            const now = performance.now();
            const elapsed = now - stepClockStartRef.current;
            const c = activeIndexRef.current;
            const isLastStep = c >= STEPS.length - 1;

            if (!userHasInteracted && !isLastStep && elapsed >= AUTOPLAY_INTERVAL_MS) {
                applyNextStepAutoplay();
                return;
            }

            setSegmentCombined01(canonicalSegmentCombinedFromElapsed(elapsed));
        };

        rafId = window.requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [activeIndex, userHasInteracted, applyNextStepAutoplay, updateIntroVisuals]);

    const handleStepSelection = (index: number) => {
        setUserHasInteracted(true);
        suppressScrollCommitUntilRef.current = performance.now() + PROGRAMMATIC_SCROLL_GUARD_MS;
        applyStepIndex(index);

        // Scroll to the respective anchor
        itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const moveFocusToStep = (index: number) => {
        const normalizedIndex = (index + STEPS.length) % STEPS.length;
        tabRefs.current[normalizedIndex]?.focus();
        handleStepSelection(normalizedIndex);
    };

    const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                event.preventDefault();
                moveFocusToStep(index + 1);
                break;
            case "ArrowLeft":
            case "ArrowUp":
                event.preventDefault();
                moveFocusToStep(index - 1);
                break;
            case "Home":
                event.preventDefault();
                moveFocusToStep(0);
                break;
            case "End":
                event.preventDefault();
                moveFocusToStep(STEPS.length - 1);
                break;
            default:
                break;
        }
    };

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            aria-label="How SecureLearning works"
            className="relative h-[500vh] full-bleed"
        >
            {/* Visually hidden heading for a11y / SEO */}
            <h2 className="sr-only">How SecureLearning works</h2>

            {/* Scroll Anchors — 1 intro + 4 steps */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="h-screen w-full" />{/* intro viewport */}
                {STEPS.map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => { itemRefs.current[i] = el; }}
                        data-index={i}
                        className="h-screen w-full"
                    />
                ))}
            </div>

            {/* Sticky Container — overflow-hidden viewport frame */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Wipe wrapper — 2×vh stack that slides upward */}
                <div ref={introWrapperRef} style={{ willChange: "transform" }}>

                    {/* Panel 1: Sentence — starts centred on screen */}
                    <div className="h-screen flex items-center justify-center pointer-events-none">
                        <p
                            ref={sentenceRef}
                            aria-hidden
                            className="hiw-sentence hiw-underline text-[2.2rem] md:text-[2.8rem] lg:text-[3.4rem] font-light italic tracking-[-0.02em] select-none"
                            style={{ opacity: 0, willChange: "opacity, filter" }}
                        >
                            Sounds complicated?
                        </p>
                    </div>

                    {/* Panel 2: Content — pulled up closer to sentence */}
                    <div className="h-screen flex items-center -mt-[30vh]">
                        <div className="relative mx-auto max-w-[1440px] w-full px-6 md:px-12">
                            <div
                                ref={contentGridRef}
                                className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-x-16 items-center"
                                style={{ opacity: 0, willChange: "opacity" }}
                            >

                                {/* Left: Vertical Timeline */}
                                <div className="hidden lg:block">
                                    <SingleLineTimeline
                                        activeIndex={activeIndex}
                                        cardOutlineProgress01={cardOutlineProgress01}
                                        connectorFillPercents={connectorFillPercents}
                                        idBase={idBase}
                                        tabRefs={tabRefs}
                                        onSelectStep={handleStepSelection}
                                        onTabKeyDown={handleTabKeyDown}
                                        progressKey={progressKey}
                                    />
                                </div>

                                {/* Right: Glass Display */}
                                <div className="w-full">
                                    <StagePanels
                                        activeIndex={activeIndex}
                                        idBase={idBase}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hiw-sentence {
                    color: rgba(255, 255, 255, 0.92);
                    text-shadow:
                        0 0 50px rgba(167, 139, 250, 0.12),
                        0 0 100px rgba(124, 58, 237, 0.06);
                }
                .hiw-underline {
                    background-image: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(124, 58, 237, 0.5) 8%,
                        rgba(139, 92, 246, 0.55) 50%,
                        rgba(124, 58, 237, 0.5) 92%,
                        transparent 100%
                    );
                    background-repeat: no-repeat;
                    background-position: 0 calc(100% + 1px);
                    background-size: 100% 2.5px;
                    padding-bottom: 4px;
                }
            `}</style>
        </section>
    );
}
