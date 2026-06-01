"use client";

import Image from "next/image";
import {
    useCallback,
    useEffect,
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

const STEP_STAGE_MEDIA: Partial<
    Record<
        HowItWorksStep["id"],
        {
            webm?: string;
            mp4?: string;
            durationMs?: number;
            imageSrc?: string;
        }
    >
> = {
    import: {
        webm: "/assets/how-it-works/1-import-org.webm",
        mp4: "/assets/how-it-works/1-import-org.mp4",
        durationMs: 23080,
    },
    build: {
        webm: "/assets/how-it-works/2-launch-campaign.webm",
        mp4: "/assets/how-it-works/2-launch-campaign.mp4",
        durationMs: 43235,
    },
    launch: {
        webm: "/assets/how-it-works/3-details.webm",
        mp4: "/assets/how-it-works/3-details.mp4",
        durationMs: 17967,
    },
    train: {
        webm: "/assets/how-it-works/4-assign_training.webm",
        mp4: "/assets/how-it-works/4-assign_training.mp4",
        durationMs: 33633,
    },
};

const DEFAULT_AUTOPLAY_INTERVAL_MS = 6000;
const CARD_FILL_DURATION_MS = 4600;
/** Share of each step segment spent tracing the active card outline (rest = vertical connector). */
const CARD_SEGMENT_FRACTION = CARD_FILL_DURATION_MS / DEFAULT_AUTOPLAY_INTERVAL_MS;
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
const HORIZONTAL_INACTIVE_STEP_SIZE_PX = 36;
const HORIZONTAL_CONNECTOR_WIDTH_PX = 16;
const HORIZONTAL_ACTIVE_CARD_PADDING_X_PX = 32;
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
    onStepDurationResolved,
    canPlayActiveMedia,
}: Readonly<{
    activeIndex: number;
    idBase: string;
    onStepDurationResolved: (stepId: HowItWorksStep["id"], durationMs: number) => void;
    canPlayActiveMedia: boolean;
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

                            <StagePanelMedia
                                step={step}
                                isActive={isActive}
                                canPlay={canPlayActiveMedia}
                                priority={index === 0}
                                onDurationResolved={onStepDurationResolved}
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

function StagePanelMedia({
    step,
    isActive,
    canPlay,
    priority,
    onDurationResolved,
}: Readonly<{
    step: HowItWorksStep;
    isActive: boolean;
    canPlay: boolean;
    priority: boolean;
    onDurationResolved: (stepId: HowItWorksStep["id"], durationMs: number) => void;
}>) {
    const media = STEP_STAGE_MEDIA[step.id];
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive && canPlay) {
            void video.play().catch(() => {
                // Autoplay can be rejected in some environments; leave the first frame rendered.
            });
            return;
        }

        video.pause();
        video.currentTime = 0;
    }, [isActive, canPlay]);

    if (media?.webm && media?.mp4) {
        return (
            <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload={priority ? "auto" : "metadata"}
                className="h-full w-full object-cover object-top opacity-90"
                onLoadedMetadata={(event) => {
                    const durationSec = event.currentTarget.duration;
                    if (!Number.isFinite(durationSec) || durationSec <= 0) return;
                    onDurationResolved(step.id, durationSec * 1000);
                }}
            >
                <source src={media.webm} type="video/webm" />
                <source src={media.mp4} type="video/mp4" />
            </video>
        );
    }

    return (
        <Image
            src={media?.imageSrc ?? "/assets/placeholders/how-it-works-admin-console.png"}
            alt={step.title}
            fill
            sizes="(min-width: 1024px) 1024px, 92vw"
            className="object-cover object-top opacity-90"
            priority={priority}
        />
    );
}

function canonicalSegmentCombinedFromElapsed(elapsedMs: number, intervalMs: number): number {
    return Math.min(1, Math.max(0, elapsedMs / intervalMs));
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

const HORIZONTAL_CARD_RADIUS_PX = 28;

function HorizontalCardBorder({
    progressKey,
    outlineProgress01,
}: Readonly<{ progressKey: number; outlineProgress01: number }>) {
    const frameRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;

        let rafId = 0;
        let stopLiveSamplingAt = 0;

        const updateSize = () => {
            const rect = frame.getBoundingClientRect();
            const w = Math.max(rect.width, frame.clientWidth);
            const h = Math.max(rect.height, frame.clientHeight);
            setSize((cur) =>
                Math.abs(cur.width - w) < 0.25 && Math.abs(cur.height - h) < 0.25
                    ? cur
                    : { width: w, height: h }
            );
        };

        const tick = () => {
            updateSize();
            if (performance.now() < stopLiveSamplingAt) {
                rafId = window.requestAnimationFrame(tick);
            }
        };

        updateSize();
        stopLiveSamplingAt = performance.now() + FLIP_DURATION_S * 1000 + 120;
        rafId = window.requestAnimationFrame(tick);

        if (typeof ResizeObserver === "undefined") {
            return () => window.cancelAnimationFrame(rafId);
        }

        const obs = new ResizeObserver(() => updateSize());
        obs.observe(frame);

        return () => {
            window.cancelAnimationFrame(rafId);
            obs.disconnect();
        };
    }, [progressKey]);

    const inset = 1;
    const strokeWidth = 2;
    const x = inset;
    const y = inset;
    const w = Math.max(size.width - inset * 2, 0);
    const h = Math.max(size.height - inset * 2, 0);
    const r = Math.max(0, Math.min(HORIZONTAL_CARD_RADIUS_PX, w / 2, h / 2));
    const centerY = y + h / 2;
    const rightX = x + w;
    const bottomY = y + h;

    const topPath = `M ${x} ${centerY} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} H ${rightX - r} A ${r} ${r} 0 0 1 ${rightX} ${y + r} V ${centerY}`;
    const bottomPath = `M ${x} ${centerY} V ${bottomY - r} A ${r} ${r} 0 0 0 ${x + r} ${bottomY} H ${rightX - r} A ${r} ${r} 0 0 0 ${rightX} ${bottomY - r} V ${centerY}`;
    const dashOffset = 100 * (1 - outlineProgress01);

    return (
        <div
            ref={frameRef}
            key={`h-progress-${progressKey}`}
            className="absolute inset-0 rounded-[inherit] pointer-events-none z-20"
        >
            {w > 0 && h > 0 && (
                <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox={`0 0 ${size.width} ${size.height}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path d={topPath} pathLength="100" fill="none" stroke="#a78bfa" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.95))", strokeDasharray: 100, strokeDashoffset: dashOffset }} />
                    <path d={bottomPath} pathLength="100" fill="none" stroke="#a78bfa" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.95))", strokeDasharray: 100, strokeDashoffset: dashOffset }} />
                </svg>
            )}
        </div>
    );
}

function HorizontalTimeline({
    activeIndex,
    cardOutlineProgress01,
    connectorFillPercents,
    idBase,
    tabRefs,
    onSelectStep,
    onTabKeyDown,
    progressKey,
}: Readonly<{
    activeIndex: number;
    cardOutlineProgress01: number;
    connectorFillPercents: readonly number[];
    idBase: string;
    tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
    onSelectStep: (index: number) => void;
    onTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
    progressKey: number;
}>) {
    const tablistRef = useRef<HTMLDivElement | null>(null);
    const measureRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [activeBodyWidth, setActiveBodyWidth] = useState<number | null>(null);
    const [reservedHeight, setReservedHeight] = useState<number | null>(null);

    useLayoutEffect(() => {
        const tablist = tablistRef.current;
        if (!tablist) return;

        const updateWidth = () => {
            const occupiedWidth =
                (STEPS.length - 1) * HORIZONTAL_INACTIVE_STEP_SIZE_PX +
                (STEPS.length - 1) * HORIZONTAL_CONNECTOR_WIDTH_PX;
            const nextWidth = Math.max(
                tablist.clientWidth - occupiedWidth - HORIZONTAL_ACTIVE_CARD_PADDING_X_PX,
                0
            );

            setActiveBodyWidth((current) => (current === nextWidth ? current : nextWidth));
        };

        updateWidth();

        if (typeof ResizeObserver === "undefined") return;

        const observer = new ResizeObserver(() => updateWidth());
        observer.observe(tablist);

        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        if (!activeBodyWidth) return;

        const frame = window.requestAnimationFrame(() => {
            const maxHeight = measureRefs.current.reduce((currentMax, element) => {
                if (!element) return currentMax;
                return Math.max(currentMax, element.offsetHeight);
            }, 0);

            setReservedHeight((current) => (current === maxHeight ? current : maxHeight));
        });

        return () => window.cancelAnimationFrame(frame);
    }, [activeBodyWidth]);

    return (
        <div
            className="relative w-full mt-6 overflow-hidden"
            style={reservedHeight ? { height: `${reservedHeight}px` } : undefined}
        >
            <div
                ref={tablistRef}
                role="tablist"
                aria-orientation="horizontal"
                aria-label="How SecureLearning works timeline"
                className="flex h-full w-full flex-row items-start"
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
                                id={`${idBase}-htab-${step.id}`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`${idBase}-panel-${step.id}`}
                                aria-label={step.title}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => onSelectStep(index)}
                                onKeyDown={(event) => onTabKeyDown(event, index)}
                                className={`
                                    group relative focus-visible:outline-none z-10
                                    ${isActive
                                        ? 'hiw-active-card-h overflow-visible flex flex-1 flex-col items-center justify-center rounded-[28px] bg-[#0d071b] px-4 py-4 h-auto'
                                        : 'overflow-hidden flex h-[36px] w-[36px] shrink-0 self-center items-center justify-center rounded-[999px] bg-[#05060b]'
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
                                    <HorizontalCardBorder progressKey={progressKey} outlineProgress01={cardOutlineProgress01} />
                                )}

                                {isActive ? (
                                    <>
                                        <div
                                            aria-hidden="true"
                                            className="invisible relative z-10 mx-auto flex flex-col items-center text-center"
                                            style={{ width: activeBodyWidth ? `${activeBodyWidth}px` : undefined }}
                                        >
                                            <span className="text-[0.6rem] font-bold tracking-widest text-white/25 mb-1">{step.number}</span>
                                            <h3 className="text-[0.92rem] font-bold leading-snug tracking-tight text-white">{step.title}</h3>
                                            <p className="mt-1 text-[0.68rem] font-medium leading-relaxed text-white/40">{step.captionLines[0]} {step.captionLines[1]}</p>
                                        </div>
                                        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
                                            <div
                                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                                style={{ width: activeBodyWidth ? `${activeBodyWidth}px` : undefined }}
                                            >
                                                <div className="flex flex-col items-center text-center">
                                                    <span className="text-[0.6rem] font-bold tracking-widest text-white/25 mb-1">{step.number}</span>
                                                    <h3 className="text-[0.92rem] font-bold leading-snug tracking-tight text-white">{step.title}</h3>
                                                    <p className="mt-1 text-[0.68rem] font-medium leading-relaxed text-white/40">{step.captionLines[0]} {step.captionLines[1]}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <span
                                        className={`relative z-10 font-bold tracking-widest text-[0.8rem] ${
                                            isPast ? 'text-white/90' : 'text-white/40'
                                        }`}
                                    >
                                        {step.number}
                                    </span>
                                )}
                            </button>

                            {index !== STEPS.length - 1 && (
                                <div
                                    className="relative h-[2px] w-4 shrink-0 self-center"
                                    aria-hidden="true"
                                >
                                    <div className="absolute inset-0 bg-white/[0.09]" />
                                    {(isPast || isActive) && (
                                        <div
                                            className="absolute inset-y-0 left-0 origin-left bg-[#a78bfa]"
                                            style={{
                                                width: `${connectorFillPercents[index] ?? 0}%`,
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>
            <div className="pointer-events-none absolute left-0 top-0 -z-10 opacity-0" aria-hidden="true">
                {STEPS.map((step, index) => (
                    <div
                        key={`${step.id}-measure`}
                        ref={(element) => {
                            measureRefs.current[index] = element;
                        }}
                        className="hiw-active-card-h flex flex-col items-center justify-center rounded-[28px] px-4 py-4"
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: activeBodyWidth
                                ? `${activeBodyWidth + HORIZONTAL_ACTIVE_CARD_PADDING_X_PX}px`
                                : undefined,
                        }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <span className="text-[0.6rem] font-bold tracking-widest text-white/25 mb-1">{step.number}</span>
                            <h3 className="text-[0.92rem] font-bold leading-snug tracking-tight text-white">{step.title}</h3>
                            <p className="mt-1 text-[0.68rem] font-medium leading-relaxed text-white/40">{step.captionLines[0]} {step.captionLines[1]}</p>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .hiw-active-card-h {
                    box-shadow:
                        0 -8px 24px -12px rgba(167, 139, 250, 0.2),
                        0 32px 60px rgba(0, 0, 0, 0.5),
                        0 0 0 1.5px rgba(255, 255, 255, 0.04),
                        inset 0 0 24px rgba(167, 139, 250, 0.10);
                }
            `}</style>
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
    const mobileTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const sentenceRef = useRef<HTMLParagraphElement | null>(null);
    const contentGridRef = useRef<HTMLDivElement | null>(null);
    const introWrapperRef = useRef<HTMLDivElement | null>(null);
    const idBase = "how-it-works";
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
    const [isSectionActive, setIsSectionActive] = useState(false);
    const [isDocumentHidden, setIsDocumentHidden] = useState(false);

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
    const stepDurationsMsRef = useRef<Partial<Record<HowItWorksStep["id"], number>>>({});
    const savedElapsedOnScrollStartRef = useRef(0);
    const reduceMotionRef = useRef(false);
    /** Smoothed step-float for the intro visuals — lerped toward the real value each frame. */
    const smoothSfRef = useRef<number | null>(null);  // null = not yet initialised
    /** True once the content grid has fully faded in after the intro. */
    const contentReadyRef = useRef(false);
    const stageMediaVisibleRef = useRef(false);

    const isMobileRef = useRef(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isStageMediaVisible, setIsStageMediaVisible] = useState(false);

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

    const getStepIntervalMs = useCallback((index: number) => {
        const step = STEPS[index];
        const resolved = stepDurationsMsRef.current[step.id];
        if (typeof resolved === "number" && Number.isFinite(resolved) && resolved > 0) {
            return resolved;
        }
        const configured = STEP_STAGE_MEDIA[step.id]?.durationMs;
        if (typeof configured === "number" && Number.isFinite(configured) && configured > 0) {
            return configured;
        }
        return DEFAULT_AUTOPLAY_INTERVAL_MS;
    }, []);

    const handleStepDurationResolved = useCallback(
        (stepId: HowItWorksStep["id"], durationMs: number) => {
            const roundedDurationMs = Math.max(250, Math.round(durationMs));
            if (stepDurationsMsRef.current[stepId] === roundedDurationMs) return;
            stepDurationsMsRef.current[stepId] = roundedDurationMs;
        },
        []
    );

    /**
     * Drives the intro → content wipe in 3 phases:
     *   Settle (0→0.1):  sentence rises from +8vh to centre.
     *   Dock   (0.1→0.4): sentence holds at centre — reading time.
     *   Wipe   (0.4→1.0): whole stack slides up, sentence exits top,
     *                      content rises into centre from below.
     */
    const updateIntroVisuals = useCallback((sf: number) => {
        const introF = Math.max(0, Math.min(1, sf + 1));
        const isMobileLayout = isMobileRef.current;

        const wrapper = introWrapperRef.current;
        if (wrapper) {
            const wf = isMobileLayout ? sf + 1.22 : sf + 1.35;
            let travel: number;
            if (wf < 0) {
                travel = 10;
            } else if (wf < (isMobileLayout ? 0.3 : 0.35)) {
                const settleWindow = isMobileLayout ? 0.3 : 0.35;
                travel = 10 * (1 - wf / settleWindow);
            } else if (wf < (isMobileLayout ? 0.5 : 0.75)) {
                travel = 0;
            } else {
                const wipeF = isMobileLayout
                    ? Math.min(1, (wf - 0.5) / 0.5)
                    : Math.min(1, (wf - 0.75) / 0.6);
                travel = (isMobileLayout ? -38 : -70) * wipeF;
            }
            wrapper.style.transform = `translateY(${travel}vh)`;
        }

        const sentence = sentenceRef.current;
        if (sentence) {
            const sp = isMobileLayout ? sf + 1.18 : sf + 1.25;

            if (isMobileLayout) {
                const op = sp < 0 ? 0 : sp < 0.32 ? sp / 0.32 : 1;
                sentence.style.opacity = String(Math.max(0, Math.min(1, op)));
                sentence.style.filter = "none";
            } else {
                let op: number;
                if (sp < 0) op = 0;
                else if (sp < 0.35) op = sp / 0.35;
                else if (sp < 0.5) op = 1;
                else if (sp < 0.8) op = 1 - (sp - 0.5) / 0.3;
                else op = 0;
                const blur = sp > 0.55 ? ((sp - 0.55) / 0.45) * 8 : 0;

                sentence.style.opacity = String(Math.max(0, Math.min(1, op)));
                sentence.style.filter = blur > 0.1 ? `blur(${blur}px)` : "none";
            }
        }

        const grid = contentGridRef.current;
        if (grid) {
            const contentF = isMobileLayout
                ? Math.max(0, Math.min(1, (introF - 0.18) / 0.46))
                : Math.max(0, Math.min(1, (introF - 0.45) / 0.4));
            grid.style.opacity = String(contentF);
            grid.style.transform = isMobileLayout
                ? `translateY(${(1 - contentF) * 2.5}vh)`
                : "translateY(0)";

            const shouldShowStageMedia = contentF >= 0.98;
            if (stageMediaVisibleRef.current !== shouldShowStageMedia) {
                stageMediaVisibleRef.current = shouldShowStageMedia;
                setIsStageMediaVisible(shouldShowStageMedia);
            }

            if (contentF >= 0.98 && !contentReadyRef.current) {
                contentReadyRef.current = true;
                stepClockStartRef.current = performance.now();
            }
        }
    }, []);

    const applyStepIndex = useCallback((nextIndex: number) => {
        if (nextIndex === activeIndexRef.current) return;
        activeIndexRef.current = nextIndex;
        stepClockStartRef.current = performance.now();
        const refs = isMobileRef.current ? mobileTabRefs : tabRefs;
        captureTimelineFlipState(refs, flipStateBeforeRef);
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
        const target = canonicalSegmentCombinedFromElapsed(
            elapsed,
            getStepIntervalMs(activeIndexRef.current)
        );
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
    }, [getStepIntervalMs]);

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

    useLayoutEffect(() => {
        if (typeof window === "undefined") return;
        const mql = window.matchMedia("(max-width: 1023px)");
        const update = () => {
            const mobile = mql.matches;
            isMobileRef.current = mobile;
            setIsMobile(mobile);
            if (!mobile) smoothSfRef.current = null;
        };
        update();
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
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
                setIsSectionActive(entry.isIntersecting);
                if (!wasVisible && entry.isIntersecting) {
                    stepClockStartRef.current = performance.now();
                    smoothSfRef.current = null;
                }
            },
            { threshold: 0.1 }
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

    const shouldRunSectionMotion = isSectionActive && !isDocumentHidden;

    useEffect(() => {
        if (typeof window === "undefined" || !shouldRunSectionMotion || isMobile) return;

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
                        performance.now() - stepClockStartRef.current,
                        getStepIntervalMs(activeIndexRef.current)
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
    }, [computeStepFloat, finishScrollInteraction, shouldRunSectionMotion, isMobile, getStepIntervalMs]);

    /** Drive unified segment progress (card outline + spine) from the same clock as autoplay. */
    useEffect(() => {
        if (typeof window === "undefined" || !shouldRunSectionMotion) return;
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
            const activeIntervalMs = getStepIntervalMs(c);

            if (!userHasInteracted && elapsed >= activeIntervalMs) {
                if (!isLastStep) {
                    applyNextStepAutoplay();
                    return;
                }
                if (isMobileRef.current) {
                    applyStepIndex(0);
                    return;
                }
            }

            setSegmentCombined01(canonicalSegmentCombinedFromElapsed(elapsed, activeIntervalMs));
        };

        rafId = window.requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [activeIndex, userHasInteracted, applyNextStepAutoplay, shouldRunSectionMotion, updateIntroVisuals, getStepIntervalMs]);

    const handleStepSelection = (index: number) => {
        setUserHasInteracted(true);
        suppressScrollCommitUntilRef.current = performance.now() + PROGRAMMATIC_SCROLL_GUARD_MS;
        applyStepIndex(index);

        if (!isMobileRef.current) {
            itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const moveFocusToStep = (index: number) => {
        const normalizedIndex = (index + STEPS.length) % STEPS.length;
        const refs = isMobileRef.current ? mobileTabRefs : tabRefs;
        refs.current[normalizedIndex]?.focus();
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
            className="relative h-[164vh] lg:h-[500vh] full-bleed"
        >
            {/* Visually hidden heading for a11y / SEO */}
            <h2 className="sr-only">How SecureLearning works</h2>

            {/* Scroll Anchors — 1 intro + 4 steps (desktop only) */}
            <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
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

            {/* Sticky Container — overflow-hidden viewport frame (desktop only) */}
            <div className="sticky top-0 h-[100svh] lg:h-screen w-full overflow-hidden">
                {/* Wipe wrapper — 2×vh stack that slides upward (desktop) */}
                <div ref={introWrapperRef} className="[will-change:transform]">

                    {/* Panel 1: Sentence — centred on screen (desktop); compact block (mobile) */}
                    <div className="h-[100svh] lg:h-screen flex items-center justify-center pointer-events-none">
                        <p
                            ref={sentenceRef}
                            aria-hidden
                            className="hiw-sentence hiw-underline text-[1.7rem] md:text-[2.8rem] lg:text-[3.4rem] font-light italic tracking-[-0.02em] select-none opacity-0"
                            style={{ willChange: "opacity, filter" }}
                        >
                            Sounds complicated?
                        </p>
                    </div>

                    {/* Panel 2: Content — pulled up closer to sentence (desktop); normal flow (mobile) */}
                    <div className="h-[100svh] lg:h-screen flex items-center -mt-[58vh] sm:-mt-[50vh] md:-mt-[28vh] lg:-mt-[30vh]">
                        <div className="relative mx-auto max-w-[1440px] w-full px-6 md:px-12">
                            <div
                                ref={contentGridRef}
                                className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-x-16 lg:items-center opacity-0"
                                style={{ willChange: "opacity" }}
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
                                        onStepDurationResolved={handleStepDurationResolved}
                                        canPlayActiveMedia={shouldRunSectionMotion && isStageMediaVisible}
                                    />
                                </div>

                                {/* Mobile: Horizontal Timeline (below glass display) */}
                                <div className="lg:hidden">
                                    <HorizontalTimeline
                                        activeIndex={activeIndex}
                                        cardOutlineProgress01={cardOutlineProgress01}
                                        connectorFillPercents={connectorFillPercents}
                                        idBase={idBase}
                                        tabRefs={mobileTabRefs}
                                        onSelectStep={handleStepSelection}
                                        onTabKeyDown={handleTabKeyDown}
                                        progressKey={progressKey}
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
