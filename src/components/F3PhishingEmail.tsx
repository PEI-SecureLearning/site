"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type AnimationEvent,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { F3GhostInboxMobileStrip, F3GhostInboxSidebar } from "./F3GhostInbox";
import {
    F3_ACTION_SENTENCE,
    F3_CTA_LABEL,
    F3_DETAIL_DEVICE,
    F3_DETAIL_LOCATION,
    F3_DETAIL_TIME,
    F3_EVENT_SENTENCE,
    F3_SENDER_DISPLAY,
    F3_SENDER_EMAIL,
    F3_SUBJECT_LINE,
} from "./f3PhishingCopy";
import {
    F3_FORENSIC_LAYOUTS,
    type F3ForensicLayoutSet,
    type F3ForensicOverlayEditor,
    type F3ForensicTargetKey,
} from "./F3ForensicOverlay";
import F3MailReaderChrome from "./F3MailReaderChrome";
import F3NudgeArrow from "./F3NudgeArrow";
import F3RemediationReaderPanel from "./F3RemediationReaderPanel";
import F3RemediationSlab, { type F3RemediationSlabDebugStage } from "./F3RemediationSlab";

export type F3PhishingEmailProps = Readonly<{
    isSceneActive?: boolean;
    hasReleased?: boolean;
    onSequenceRelease?: () => void;
    onReviewActivity?: () => void;
    labRange?: {
        start: F3LabCheckpoint;
        end: F3LabCheckpoint;
    };
    debugOverrides?: Partial<{
        manualMode: boolean;
        phase: F3Phase;
        transitionCheckpoint: F3TransitionCheckpoint;
        takeoverVisible: boolean;
        shellVisible: boolean;
        selectedActive: boolean;
        metaVisible: boolean;
        subjectActive: boolean;
        eventActive: boolean;
        detailsVisible: boolean;
        actionActive: boolean;
        ctaVisible: boolean;
        isNudging: boolean;
        arrowVisible: boolean;
        breatheCta: boolean;
    }>;
    forensicLayouts?: F3ForensicLayoutSet;
    forensicEditor?: F3ForensicOverlayEditor;
}>;

export type F3TransitionCheckpoint =
    | "consequence-start"
    | "verdict-recede"
    | "seam"
    | "slab-formed"
    | "headline"
    | "hold";

export type F3LabCheckpoint =
    | "absolute-beginning"
    | "end-state1"
    | "end-state2"
    | "end-slab-entrance"
    | "end-docking"
    | "end-surface"
    | "absolute-end";

type F3Phase =
    | "idle"
    | "entering"
    | "composing"
    | "ready"
    | "consequence"
    | "remediationSlab"
    | "remediationDocked"
    | "remediationTransforming"
    | "remediationTransformed"
    | "remediation"
    | "remediationSettled"
    | "sequenceComplete";
type F3DebugStepKey = Exclude<
    NonNullable<F3PhishingEmailProps["debugOverrides"]> extends infer T
        ? T extends object
            ? keyof T
            : never
        : never,
    "manualMode" | "phase" | "transitionCheckpoint"
>;

const SUBJECT_LINE = F3_SUBJECT_LINE;
const EVENT_SENTENCE = F3_EVENT_SENTENCE;
const ACTION_SENTENCE = F3_ACTION_SENTENCE;
const SHELL_START_MS = 360;
const SHELL_DURATION_MS = 620;
const SELECTED_ROW_DURATION_MS = 320;
const META_DURATION_MS = 800;
const SUBJECT_DURATION_MS = 900;
const POST_SUBJECT_PAUSE_MS = 800;
const EVENT_DURATION_MS = 900;
const POST_EVENT_PAUSE_MS = 800;
const DETAILS_DURATION_MS = 900;
const POST_DETAILS_PAUSE_MS = 700;
const ACTION_DURATION_MS = 900;
const CTA_DURATION_MS = 220;
/**
 * Light throttle for keyboard / touch. Wheel uses gesture clustering instead (see handler).
 */
const NUDGE_MIN_INTERVAL_MS = 320;

/** After this quiet gap with no wheel events, the next scroll counts as a new gesture. */
const WHEEL_GESTURE_IDLE_MS = 220;

/**
 * Hard floor between wheel-driven nudges. Stops a second RAF if the idle timer fires
 * mid–trackpad burst (brief lulls still happen in one “flick”).
 */
const MIN_MS_BETWEEN_WHEEL_NUDGES = 520;

/** Must match elastic translate + overscroll glow timings */
const ELASTIC_NUDGE_DURATION_MS = 840;

/** Peak opacity for bottom wash — keep barely perceptible so the arrow stays the hero */
const ELASTIC_OVERSCROLL_GLOW_PEAK = 0.106;

/** Screen-reader / live region: natural pauses (visual lines have no punctuation). */
const CONSEQUENCE_HEADLINE = "You clicked. That's all it takes.";
/** Two beats — second line animates only after the first completes. */
const CONSEQUENCE_HEADLINE_LINE_A = "You clicked";
const CONSEQUENCE_HEADLINE_LINE_B = "That's all it takes";

/** Let the copy land before focus + auto-advance timer (ms). */
const CONSEQUENCE_POST_SETTLE_MS = 340;
/** Dead air after line 1 fully lands before line 2 begins (seconds). */
const CONSEQUENCE_LINE1_LAND_PAUSE_SEC = 1.3;
/** Dead air after line 2 lands before the support line begins (seconds). */
const CONSEQUENCE_LINE2_TO_SUBLINE_PAUSE_SEC = 0.32;
/** Dead air after support line lands before “What now?” begins (seconds). */
const CONSEQUENCE_SUBLINE_TO_CTA_PAUSE_SEC = 0.55;
const CONSEQUENCE_SUBLINE = "One rushed decision can become an incident.";
const CONSEQUENCE_CTA_LABEL = "What now?";

/** Auto-advance if “What now?” is untouched (~1.85s after focus + timer start). */
const CONSEQUENCE_AUTO_ADVANCE_MS = 1850;

const CONSEQUENCE_EXIT_HOLD_MS = 320;
const CONSEQUENCE_EXIT_REVEAL_MS = 460;
const CONSEQUENCE_EXIT_EASE = "power2.inOut";
const CONSEQUENCE_MAIL_STAGE_DURATION_MS = 3900;
const CONSEQUENCE_MAIL_STAGE_BACKDROP_RATIO = 0.92;
const CONSEQUENCE_MAIL_STAGE_EASE = "sine.inOut";
const CONSEQUENCE_DUST_PARTICLES = [
    { left: "20%", top: "16%", size: 10, x: -46, y: -24, delay: 0.02 },
    { left: "31%", top: "12%", size: 8, x: -24, y: -34, delay: 0.06 },
    { left: "43%", top: "14%", size: 11, x: -12, y: -42, delay: 0.04 },
    { left: "55%", top: "11%", size: 9, x: 14, y: -36, delay: 0.08 },
    { left: "68%", top: "15%", size: 10, x: 36, y: -26, delay: 0.05 },
    { left: "80%", top: "18%", size: 8, x: 48, y: -20, delay: 0.1 },
    { left: "18%", top: "34%", size: 9, x: -52, y: -8, delay: 0.12 },
    { left: "29%", top: "30%", size: 12, x: -30, y: -4, delay: 0.09 },
    { left: "42%", top: "31%", size: 10, x: -14, y: 6, delay: 0.14 },
    { left: "58%", top: "29%", size: 11, x: 18, y: 3, delay: 0.11 },
    { left: "71%", top: "32%", size: 9, x: 34, y: 8, delay: 0.16 },
    { left: "82%", top: "35%", size: 8, x: 50, y: 14, delay: 0.13 },
    { left: "24%", top: "54%", size: 8, x: -38, y: 18, delay: 0.18 },
    { left: "37%", top: "50%", size: 10, x: -18, y: 22, delay: 0.22 },
    { left: "52%", top: "52%", size: 12, x: 8, y: 26, delay: 0.2 },
    { left: "67%", top: "50%", size: 9, x: 28, y: 20, delay: 0.24 },
    { left: "41%", top: "73%", size: 11, x: -14, y: 34, delay: 0.28 },
    { left: "61%", top: "74%", size: 10, x: 20, y: 30, delay: 0.3 },
] as const;
const REMEDIATION_DOCK_TARGET_SELECTORS = [
    "#f3-remediation-dock-target-desktop",
    "#f3-remediation-dock-target-mobile",
] as const;
const REMEDIATION_RESKIN_START_DELAY_MS = 0;
const REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER = 2.8;
const REMEDIATION_POST_TRANSFORM_SETTLE_MS = 1200;
const REMEDIATION_ANNOTATION_PAIR_PAUSE_MS = 560;

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (globalThis.window === undefined || typeof globalThis.window.matchMedia !== "function") {
            return;
        }

        const mediaQuery = globalThis.window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setPrefersReducedMotion(mediaQuery.matches);

        update();
        mediaQuery.addEventListener("change", update);

        return () => mediaQuery.removeEventListener("change", update);
    }, []);

    return prefersReducedMotion;
}

function useTypedText(text: string, active: boolean, duration: number, skipAnimation: boolean) {
    const [displayText, setDisplayText] = useState("");
    const runIdRef = useRef(0);

    useEffect(() => {
        runIdRef.current += 1;
        const runId = runIdRef.current;

        if (!active) {
            setDisplayText("");
            return;
        }

        if (skipAnimation || duration <= 0) {
            setDisplayText(text);
            return;
        }

        let frameId = 0;
        const startedAt = globalThis.window.performance.now();

        const tick = (now: number) => {
            if (runIdRef.current !== runId) return;

            const elapsed = Math.min(now - startedAt, duration);
            const progress = elapsed / duration;
            const nextLength = Math.round(text.length * progress);
            setDisplayText(text.slice(0, nextLength));

            if (elapsed < duration) {
                frameId = globalThis.window.requestAnimationFrame(tick);
            }
        };

        frameId = globalThis.window.requestAnimationFrame(tick);

        return () => {
            runIdRef.current += 1;
            globalThis.window.cancelAnimationFrame(frameId);
        };
    }, [active, duration, skipAnimation, text]);

    return {
        displayText,
        isComplete: displayText.length >= text.length,
    };
}

function TypedLine({
    text,
    active,
    duration,
    skipAnimation,
    className,
    completeContent,
    as = "p",
    reserveSpaceText,
    reserveSpaceContent,
}: Readonly<{
    text: string;
    active: boolean;
    duration: number;
    skipAnimation: boolean;
    className: string;
    completeContent?: React.ReactNode;
    as?: "h2" | "p" | "span";
    reserveSpaceText?: string;
    reserveSpaceContent?: React.ReactNode;
}>) {
    const { displayText, isComplete } = useTypedText(text, active, duration, skipAnimation);
    const Tag = as;
    const shouldReserveSpace = reserveSpaceText !== undefined || reserveSpaceContent !== undefined;
    const reservedContent = reserveSpaceContent ?? reserveSpaceText;

    return (
        <Tag className={shouldReserveSpace ? `${className} relative` : className}>
            {shouldReserveSpace ? (
                <span className="pointer-events-none invisible block select-none" aria-hidden>
                    {reservedContent}
                </span>
            ) : null}
            <span className={shouldReserveSpace ? "absolute inset-0" : undefined}>
                {isComplete && completeContent ? completeContent : displayText}
                {active && !isComplete ? <span className="f3-type-caret" aria-hidden /> : null}
            </span>
        </Tag>
    );
}

function clampNumber(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function formatClipPoint(x: number, y: number) {
    return `${x.toFixed(2)}px ${y.toFixed(2)}px`;
}

function buildSourceBlobClip(
    sourceX: number,
    sourceY: number,
    radiusX: number,
    radiusY: number
) {
    const points = [
        [sourceX, sourceY - radiusY],
        [sourceX + radiusX * 0.78, sourceY - radiusY * 0.42],
        [sourceX + radiusX, sourceY + radiusY * 0.18],
        [sourceX + radiusX * 0.5, sourceY + radiusY],
        [sourceX - radiusX * 0.3, sourceY + radiusY * 0.88],
        [sourceX - radiusX * 0.9, sourceY + radiusY * 0.2],
        [sourceX - radiusX * 0.8, sourceY - radiusY * 0.48],
    ];

    return `polygon(${points
        .map(([x, y]) => formatClipPoint(Math.max(0, x), Math.max(0, y)))
        .join(", ")})`;
}

function buildLiquidEdgePoints(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    amplitude: number,
    phase: number,
    width: number,
    height: number
) {
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy) || 1;
    const nx = dy / length;
    const ny = -dx / length;
    const fractions = [0.06, 0.14, 0.24, 0.36, 0.5, 0.64, 0.78, 0.9];

    return fractions.map((fraction, index) => {
        const wobble =
            0.18 +
            0.46 * Math.sin(phase + index * 0.92) +
            0.24 * Math.sin(phase * 0.58 + index * 1.46) +
            0.14 * Math.sin(phase * 1.18 + index * 0.76);
        const offset = amplitude * wobble;
        const baseX = ax + dx * fraction;
        const baseY = ay + dy * fraction;

        return [
            clampNumber(baseX + nx * offset, 0, width),
            clampNumber(baseY + ny * offset, 0, height),
        ] as const;
    });
}

function buildLiquidRevealGeometry(
    width: number,
    height: number,
    sourceX: number,
    sourceY: number,
    progress: number
) {
    const resolvedWidth = Math.max(width, 1);
    const resolvedHeight = Math.max(height, 1);
    const progressClamped = clampNumber(progress, 0, 1);
    const diagonalRatio = resolvedWidth / resolvedHeight;
    const sourceMetric = sourceX + diagonalRatio * sourceY;
    const startMetric = Math.max(20, sourceMetric - 18);
    const endMetric = resolvedWidth * 2 + 30;
    const revealMetric = startMetric + progressClamped * (endMetric - startMetric);
    const liquidStrength =
        Math.min(resolvedWidth, resolvedHeight) *
        (0.04 + 0.052 * Math.sin(progressClamped * Math.PI));
    const phase = progressClamped * 8.2;

    if (progressClamped < 0.085) {
        const radiusX = 14 + progressClamped * resolvedWidth * 0.09;
        const radiusY = 16 + progressClamped * resolvedHeight * 0.11;
        return {
            clipPath: buildSourceBlobClip(sourceX, sourceY, radiusX, radiusY),
            edgeCenterX: sourceX,
            edgeCenterY: sourceY,
            edgeAngle: -24,
            edgeLength: Math.max(92, radiusX * 2.6),
            edgeThickness: Math.max(108, radiusY * 3.7),
            edgeOpacity: 0.38,
        };
    }

    if (revealMetric <= resolvedWidth) {
        const topX = clampNumber(revealMetric, 0, resolvedWidth);
        const leftY = clampNumber(revealMetric / diagonalRatio, 0, resolvedHeight);
        const edgePoints = buildLiquidEdgePoints(
            topX,
            0,
            0,
            leftY,
            liquidStrength,
            phase,
            resolvedWidth,
            resolvedHeight
        );
        const polygonPoints = [
            [0, 0],
            [topX, 0],
            ...edgePoints,
            [0, leftY],
        ];

        return {
            clipPath: `polygon(${polygonPoints
                .map(([x, y]) => formatClipPoint(x, y))
                .join(", ")})`,
            edgeCenterX: topX * 0.5,
            edgeCenterY: leftY * 0.5,
            edgeAngle: (Math.atan2(leftY, -topX || -1) * 180) / Math.PI,
            edgeLength: Math.max(110, Math.hypot(topX, leftY) * 1.2),
            edgeThickness:
                Math.max(138, Math.min(resolvedWidth, resolvedHeight) * 0.26),
            edgeOpacity: 0.34 - progressClamped * 0.06,
        };
    }

    const rightY = clampNumber(
        (revealMetric - resolvedWidth) / diagonalRatio,
        0,
        resolvedHeight
    );
    const bottomX = clampNumber(revealMetric - resolvedWidth, 0, resolvedWidth);
    const edgePoints = buildLiquidEdgePoints(
        resolvedWidth,
        rightY,
        bottomX,
        resolvedHeight,
        liquidStrength,
        phase,
        resolvedWidth,
        resolvedHeight
    );
    const polygonPoints = [
        [0, 0],
        [resolvedWidth, 0],
        [resolvedWidth, rightY],
        ...edgePoints,
        [bottomX, resolvedHeight],
        [0, resolvedHeight],
    ];

    return {
        clipPath: `polygon(${polygonPoints
            .map(([x, y]) => formatClipPoint(x, y))
            .join(", ")})`,
        edgeCenterX: (resolvedWidth + bottomX) * 0.5,
        edgeCenterY: (rightY + resolvedHeight) * 0.5,
        edgeAngle:
            (Math.atan2(resolvedHeight - rightY, bottomX - resolvedWidth || -1) *
                180) /
            Math.PI,
        edgeLength: Math.max(
            110,
            Math.hypot(resolvedWidth - bottomX, resolvedHeight - rightY) * 1.24
        ),
        edgeThickness:
            Math.max(144, Math.min(resolvedWidth, resolvedHeight) * 0.27),
        edgeOpacity: 0.31 - (progressClamped - 0.5) * 0.12,
    };
}

function F3ReskinnedMailContent({
    annotationsActive = true,
    visibleAnnotationKeys,
    animatedAnnotationKey,
    onAnimatedAnnotationComplete,
    forensicLayouts,
    forensicEditor,
}: Readonly<{
    annotationsActive?: boolean;
    visibleAnnotationKeys?: readonly F3ForensicTargetKey[];
    animatedAnnotationKey?: F3ForensicTargetKey;
    onAnimatedAnnotationComplete?: (key: F3ForensicTargetKey) => void;
    forensicLayouts?: F3ForensicLayoutSet;
    forensicEditor?: F3ForensicOverlayEditor;
}>) {
    return (
        <div className="absolute inset-0 overflow-hidden rounded-[22px]">
            <div className="shrink-0 px-3 pt-0.5 pb-0 opacity-0 md:px-5 lg:px-6" aria-hidden>
                <F3MailReaderChrome />
            </div>

            <div className="relative min-h-0 min-w-0 flex-1 overflow-visible px-3 pb-8 pt-5 md:px-5 md:pb-10 md:pt-6 lg:px-6">
                <F3RemediationReaderPanel
                    annotationsActive={annotationsActive}
                    visibleAnnotationKeys={visibleAnnotationKeys}
                    animatedAnnotationKey={animatedAnnotationKey}
                    onAnimatedAnnotationComplete={onAnimatedAnnotationComplete}
                    forensicLayouts={forensicLayouts}
                    forensicEditor={forensicEditor}
                />
            </div>
        </div>
    );
}

function F3ClientReskinOverlay({
    phase,
    prefersReducedMotion,
    onComplete,
    visibleAnnotationKeys,
    animatedAnnotationKey,
    onAnimatedAnnotationComplete,
    rightInset = 0,
    sourceOrigin,
    forensicLayouts,
    forensicEditor,
}: Readonly<{
    phase: Extract<
        F3Phase,
        | "remediationTransforming"
        | "remediationTransformed"
        | "remediation"
        | "remediationSettled"
        | "sequenceComplete"
    >;
    prefersReducedMotion: boolean;
    onComplete: () => void;
    visibleAnnotationKeys?: readonly F3ForensicTargetKey[];
    animatedAnnotationKey?: F3ForensicTargetKey;
    onAnimatedAnnotationComplete?: (key: F3ForensicTargetKey) => void;
    rightInset?: number;
    sourceOrigin: Readonly<{ x: number; y: number }>;
    forensicLayouts?: F3ForensicLayoutSet;
    forensicEditor?: F3ForensicOverlayEditor;
}>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const mineralRef = useRef<HTMLDivElement>(null);
    const sourceTileRef = useRef<HTMLDivElement>(null);
    const sourcePulseRef = useRef<HTMLDivElement>(null);
    const sweepRef = useRef<HTMLDivElement>(null);
    const sweepWakeRef = useRef<HTMLDivElement>(null);
    const sweepBodyRef = useRef<HTMLDivElement>(null);
    const sweepLipRef = useRef<HTMLDivElement>(null);
    const sweepGrainRef = useRef<HTMLDivElement>(null);
    const glossRef = useRef<HTMLDivElement>(null);
    const settleSheenRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const panel = panelRef.current;
        const mineral = mineralRef.current;
        const sourceTile = sourceTileRef.current;
        const sourcePulse = sourcePulseRef.current;
        const sweep = sweepRef.current;
        const sweepWake = sweepWakeRef.current;
        const sweepBody = sweepBodyRef.current;
        const sweepLip = sweepLipRef.current;
        const sweepGrain = sweepGrainRef.current;
        const gloss = glossRef.current;
        const settleSheen = settleSheenRef.current;
        if (
            !root ||
            !panel ||
            !mineral ||
            !sourceTile ||
            !sourcePulse ||
            !sweep ||
            !sweepWake ||
            !sweepBody ||
            !sweepLip ||
            !sweepGrain ||
            !gloss ||
            !settleSheen
        ) {
            return;
        }

        const ctx = gsap.context(() => {
            const rootRect = root.getBoundingClientRect();
            const rootWidth = rootRect.width || 1;
            const rootHeight = rootRect.height || 1;
            const sourceX = Math.min(Math.max(sourceOrigin.x, 0), rootWidth);
            const sourceY = Math.min(Math.max(sourceOrigin.y, 0), rootHeight);

            const setFinalState = () => {
                gsap.set(root, { opacity: 1 });
                gsap.set(panel, {
                    opacity: 1,
                    clipPath: "inset(0% 0% 0% 0% round 22px)",
                });
                gsap.set(mineral, { opacity: 0.74 });
                gsap.set(gloss, { opacity: 0.28 });
                gsap.set(settleSheen, { opacity: 0, xPercent: -18 });
                gsap.set(sourceTile, {
                    opacity: 0,
                    scaleX: 0.82,
                    scaleY: 0.82,
                    borderRadius: 12,
                    filter: "blur(0px)",
                });
                gsap.set(sourcePulse, {
                    opacity: 0,
                    scaleX: 2.4,
                    scaleY: 0.96,
                    rotate: -24,
                });
                gsap.set(sweep, {
                    opacity: 0,
                    x: rootWidth * 0.82,
                    y: rootHeight * 0.74,
                    rotate: -24,
                });
                gsap.set([sweepWake, sweepBody, sweepLip, sweepGrain], {
                    xPercent: 0,
                    yPercent: 0,
                    opacity: (index: number) => [0.88, 0.56, 0.78, 0.42][index] ?? 1,
                });
            };

            if (
                prefersReducedMotion ||
                phase === "remediationTransformed" ||
                phase === "remediation" ||
                phase === "remediationSettled" ||
                phase === "sequenceComplete"
            ) {
                setFinalState();
                return;
            }

            const initialGeometry = buildLiquidRevealGeometry(
                rootWidth,
                rootHeight,
                sourceX,
                sourceY,
                0.015
            );

            gsap.set(root, { opacity: 1 });
            gsap.set(panel, {
                opacity: 1,
                clipPath: initialGeometry.clipPath,
            });
                gsap.set(mineral, { opacity: 0.16 });
                gsap.set(gloss, { opacity: 0.08 });
                gsap.set(settleSheen, { opacity: 0, xPercent: -18 });
                gsap.set(sourceTile, {
                    opacity: 0,
                    scaleX: 0.98,
                    scaleY: 0.98,
                    borderRadius: 12,
                    x: sourceX,
                    y: sourceY,
                    xPercent: -50,
                    yPercent: -50,
                    filter: "blur(0px)",
                    force3D: true,
                });
                gsap.set(sourcePulse, {
                    opacity: 0,
                    scaleX: 0.58,
                    scaleY: 0.2,
                    rotate: -24,
                    x: sourceX,
                    y: sourceY,
                    xPercent: -50,
                    yPercent: -50,
                    force3D: true,
                });
            gsap.set(sweep, {
                opacity: initialGeometry.edgeOpacity,
                x: initialGeometry.edgeCenterX,
                y: initialGeometry.edgeCenterY,
                xPercent: -50,
                yPercent: -50,
                width: initialGeometry.edgeLength,
                height: initialGeometry.edgeThickness,
                rotate: initialGeometry.edgeAngle,
                force3D: true,
            });
            gsap.set(sweepWake, { xPercent: -4, yPercent: 2, opacity: 0.88, force3D: true });
            gsap.set(sweepBody, { xPercent: -2, yPercent: 1, opacity: 0.48, force3D: true });
            gsap.set(sweepLip, { xPercent: 2, yPercent: -1, opacity: 0.46, force3D: true });
            gsap.set(sweepGrain, { xPercent: 0, yPercent: 0, opacity: 0.34, force3D: true });

            const revealState = { progress: 0.015 };
            const renderReveal = () => {
                const geometry = buildLiquidRevealGeometry(
                    rootWidth,
                    rootHeight,
                    sourceX,
                    sourceY,
                    revealState.progress
                );

                gsap.set(panel, { clipPath: geometry.clipPath });
                gsap.set(sweep, {
                    x: geometry.edgeCenterX,
                    y: geometry.edgeCenterY,
                    width: geometry.edgeLength,
                    height: geometry.edgeThickness,
                    rotate: geometry.edgeAngle,
                    opacity: clampNumber(geometry.edgeOpacity, 0, 0.58),
                });
            };

            const tl = gsap.timeline({
                defaults: { ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
                onComplete: () => {
                    setFinalState();
                    onComplete();
                },
            });
            const sourceClickLead = 0;
            const sourceMaterialLag =
                0.014 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER;
            const sourceGlossLag =
                0.04 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER;
            const sourcePulseExpandLead =
                0.075 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER;

            tl.to(
                    revealState,
                    {
                        progress: 1,
                        duration: 0.72 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                        onUpdate: renderReveal,
                    },
                    sourceClickLead
                )
                .to(
                    sourcePulse,
                    {
                        opacity: 0.18,
                        scaleX: 1.1,
                        scaleY: 0.34,
                        duration: sourcePulseExpandLead,
                        ease: "power1.out",
                    },
                    sourceClickLead
                )
                .to(
                    sourcePulse,
                    {
                        opacity: 0,
                        scaleX: 2.7,
                        scaleY: 0.92,
                        duration: 0.28 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "power2.out",
                    },
                    sourceClickLead + sourcePulseExpandLead * 0.72
                )
                .to(
                    mineral,
                    {
                        opacity: 0.74,
                        duration: 0.52 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "power2.out",
                    },
                    sourceClickLead + sourceMaterialLag
                )
                .to(
                    gloss,
                    {
                        opacity: 0.28,
                        duration: 0.46 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "power2.out",
                    },
                    sourceClickLead + sourceGlossLag
                )
                .to(
                    sweepWake,
                    {
                        xPercent: -14,
                        yPercent: 5,
                        opacity: 0.82,
                        duration: 0.68 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "none",
                    },
                    sourceClickLead
                )
                .to(
                    sweepBody,
                    {
                        xPercent: -6,
                        yPercent: 2,
                        opacity: 0.5,
                        duration: 0.64 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "none",
                    },
                    sourceClickLead + sourceMaterialLag
                )
                .to(
                    sweepLip,
                    {
                        xPercent: 8,
                        yPercent: -2,
                        opacity: 0.5,
                        duration: 0.48 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "power2.out",
                    },
                    sourceClickLead + sourceGlossLag
                )
                .to(
                    sweepGrain,
                    {
                        xPercent: -10,
                        yPercent: 3,
                        opacity: 0.32,
                        duration: 0.72 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "none",
                    },
                    sourceClickLead
                )
                .to(
                    sweep,
                    {
                        opacity: 0,
                        scaleX: 1.12,
                        scaleY: 0.9,
                        duration: 0.22 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER,
                        ease: "power3.out",
                    },
                    0.52 * REMEDIATION_RESKIN_DEBUG_SLOW_MULTIPLIER
                );
        }, root);

        return () => {
            ctx.revert();
        };
    }, [onComplete, phase, prefersReducedMotion, sourceOrigin]);

    useLayoutEffect(() => {
        const settleSheen = settleSheenRef.current;
        if (!settleSheen || prefersReducedMotion || phase !== "remediationTransformed") return;

        const ctx = gsap.context(() => {
            gsap.set(settleSheen, {
                opacity: 0,
                xPercent: -138,
                yPercent: -84,
                rotate: -28,
            });

            gsap.timeline()
                .to(settleSheen, {
                    opacity: 0.14,
                    duration: 0.1,
                    ease: "power1.out",
                })
                .to(
                    settleSheen,
                    {
                        xPercent: 138,
                        yPercent: 84,
                        opacity: 0.02,
                        duration: 0.82,
                        ease: "none",
                    },
                    0
                )
                .to(settleSheen, {
                    opacity: 0,
                    duration: 0.1,
                    ease: "power1.out",
                }, 0.72);
        }, rootRef);

        return () => ctx.revert();
    }, [phase, prefersReducedMotion]);

    return (
        <div
            ref={rootRef}
            className="pointer-events-none absolute inset-y-0 left-0 z-[18] overflow-hidden rounded-[22px]"
            style={{ right: `${rightInset}px` }}
            aria-hidden
        >
            <div
                ref={panelRef}
                className="absolute inset-0 rounded-[22px]"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(30,28,36,0.992) 0%, rgba(22,20,27,0.996) 38%, rgba(15,13,18,1) 100%), radial-gradient(130% 88% at 10% 0%, rgba(110,100,138,0.06) 0%, rgba(67,60,88,0.028) 24%, rgba(255,255,255,0) 58%), radial-gradient(96% 92% at 100% 100%, rgba(84,76,110,0.06) 0%, rgba(39,35,52,0.024) 38%, rgba(255,255,255,0) 72%)",
                    boxShadow:
                        "0 24px 60px -28px rgba(0,0,0,0.46), 0 8px 22px -14px rgba(0,0,0,0.34), inset 0 0 0 1px rgba(255,255,255,0.014), inset 0 1px 0 rgba(255,255,255,0.016), inset 0 -18px 32px rgba(4,3,8,0.16)",
                }}
            >
                <div
                    ref={mineralRef}
                    className="absolute inset-0 rounded-[22px]"
                    style={{
                        background:
                            "radial-gradient(28rem 16rem at 18% 22%, rgba(168,155,208,0.08) 0%, rgba(98,88,127,0.036) 34%, rgba(255,255,255,0) 72%), radial-gradient(22rem 14rem at 76% 18%, rgba(136,124,175,0.048) 0%, rgba(80,72,104,0.022) 36%, rgba(255,255,255,0) 74%), radial-gradient(24rem 18rem at 34% 76%, rgba(96,84,132,0.058) 0%, rgba(60,52,82,0.024) 40%, rgba(255,255,255,0) 76%), radial-gradient(18rem 14rem at 84% 70%, rgba(122,111,160,0.042) 0%, rgba(63,56,86,0.018) 42%, rgba(255,255,255,0) 78%), repeating-linear-gradient(118deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, rgba(255,255,255,0) 8px, rgba(255,255,255,0) 18px), repeating-linear-gradient(24deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, rgba(255,255,255,0) 10px, rgba(255,255,255,0) 20px)",
                        mixBlendMode: "soft-light",
                        filter: "blur(0.8px)",
                        maskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.96) 92%, rgba(0,0,0,0.78) 96%, rgba(0,0,0,0.42) 99%, rgba(0,0,0,0) 100%)",
                        WebkitMaskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.96) 92%, rgba(0,0,0,0.78) 96%, rgba(0,0,0,0.42) 99%, rgba(0,0,0,0) 100%)",
                        opacity: 0,
                    }}
                />
                <div
                    ref={sourceTileRef}
                    className="absolute h-14 w-14 overflow-hidden rounded-[12px]"
                    style={{
                        background:
                            "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(184,198,214,0.06) 18%, rgba(76,82,96,0.12) 42%, rgba(18,16,24,0.08) 66%, rgba(6,4,10,0.18) 100%)",
                        boxShadow:
                            "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -10px 18px rgba(10,8,16,0.18), 0 10px 24px rgba(0,0,0,0.18)",
                        opacity: 0,
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0) 48%), linear-gradient(122deg, rgba(255,255,255,0) 22%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.02) 58%, rgba(255,255,255,0) 76%)",
                            mixBlendMode: "screen",
                        }}
                    />
                    <div
                        className="absolute inset-[22%] rounded-[10px]"
                        style={{
                            background:
                                "radial-gradient(circle at 50% 44%, rgba(167,139,250,0.42) 0%, rgba(124,58,237,0.2) 34%, rgba(255,255,255,0) 78%)",
                            filter: "blur(4px)",
                        }}
                    />
                </div>
                <div
                    ref={glossRef}
                    className="absolute inset-0 rounded-[22px]"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.012) 0%, rgba(255,255,255,0.006) 18%, rgba(255,255,255,0.002) 34%, rgba(255,255,255,0) 52%), radial-gradient(86% 62% at 50% -2%, rgba(210,199,244,0.026) 0%, rgba(160,147,198,0.012) 34%, rgba(255,255,255,0) 68%), radial-gradient(68% 84% at 8% 100%, rgba(102,88,144,0.026) 0%, rgba(72,62,102,0.012) 34%, rgba(255,255,255,0) 66%)",
                        mixBlendMode: "normal",
                        filter: "blur(1px)",
                        maskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.94) 92%, rgba(0,0,0,0.7) 96%, rgba(0,0,0,0.3) 99%, rgba(0,0,0,0) 100%)",
                        WebkitMaskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.94) 92%, rgba(0,0,0,0.7) 96%, rgba(0,0,0,0.3) 99%, rgba(0,0,0,0) 100%)",
                    }}
                />
                <div
                    ref={settleSheenRef}
                    className="absolute left-[-84%] top-[-68%] h-[240%] w-[156%] rounded-[999px]"
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(167,139,250,0.018) 18%, rgba(236,231,251,0.038) 34%, rgba(255,255,255,0.092) 50%, rgba(167,139,250,0.032) 68%, rgba(255,255,255,0) 100%)",
                        filter: "blur(32px)",
                        mixBlendMode: "screen",
                        opacity: 0,
                    }}
                />
                <div
                    className="absolute inset-0 rounded-[22px]"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.004) 16%, rgba(255,255,255,0.001) 32%, rgba(255,255,255,0) 54%), linear-gradient(180deg, rgba(255,255,255,0) 56%, rgba(10,8,14,0.014) 80%, rgba(4,3,8,0.052) 100%), radial-gradient(92% 68% at 50% 4%, rgba(255,255,255,0.014) 0%, rgba(255,255,255,0.004) 34%, rgba(255,255,255,0) 66%)",
                        boxShadow:
                            "inset 0 1px 14px rgba(255,255,255,0.006), inset 0 -14px 24px rgba(4,3,8,0.072)",
                        filter: "blur(1.4px)",
                        maskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.94) 92%, rgba(0,0,0,0.68) 96%, rgba(0,0,0,0.28) 99%, rgba(0,0,0,0) 100%)",
                        WebkitMaskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.94) 92%, rgba(0,0,0,0.68) 96%, rgba(0,0,0,0.28) 99%, rgba(0,0,0,0) 100%)",
                    }}
                />
                <F3ReskinnedMailContent
                    annotationsActive={
                        phase === "remediation" ||
                        phase === "remediationSettled" ||
                        phase === "sequenceComplete"
                    }
                    visibleAnnotationKeys={visibleAnnotationKeys}
                    animatedAnnotationKey={animatedAnnotationKey}
                    onAnimatedAnnotationComplete={onAnimatedAnnotationComplete}
                    forensicLayouts={forensicLayouts}
                    forensicEditor={forensicEditor}
                />
            </div>
            <div
                ref={sourcePulseRef}
                className="absolute h-24 w-24 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(222,214,249,0.22) 0%, rgba(164,145,218,0.14) 24%, rgba(88,75,122,0.08) 46%, rgba(255,255,255,0) 74%)",
                    filter: "blur(12px)",
                }}
            />
            <div
                ref={sweepRef}
                className="absolute overflow-hidden rounded-[999px]"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(84,76,110,0.03) 12%, rgba(48,41,65,0.11) 32%, rgba(27,22,37,0.2) 50%, rgba(73,65,98,0.08) 70%, rgba(255,255,255,0) 90%), radial-gradient(circle at 18% 52%, rgba(190,176,227,0.07) 0%, rgba(145,132,183,0.032) 13%, rgba(255,255,255,0) 32%), radial-gradient(circle at 42% 44%, rgba(183,170,221,0.06) 0%, rgba(132,119,170,0.03) 12%, rgba(255,255,255,0) 30%), radial-gradient(circle at 68% 56%, rgba(178,165,216,0.06) 0%, rgba(120,108,158,0.028) 12%, rgba(255,255,255,0) 30%)",
                    boxShadow:
                        "inset 0 0 20px rgba(255,255,255,0.012), inset 0 -14px 22px rgba(10,8,16,0.16)",
                    filter: "blur(26px) saturate(104%)",
                    mixBlendMode: "screen",
                    transformOrigin: "50% 50%",
                }}
            >
                <div
                    ref={sweepWakeRef}
                    className="absolute inset-y-[12%] left-[3%] right-[24%] rounded-[inherit]"
                    style={{
                        background:
                            "radial-gradient(circle at 18% 50%, rgba(188,176,224,0.08) 0%, rgba(144,132,181,0.035) 12%, rgba(255,255,255,0) 32%), radial-gradient(circle at 42% 60%, rgba(176,164,214,0.07) 0%, rgba(128,117,164,0.032) 12%, rgba(255,255,255,0) 30%), radial-gradient(circle at 68% 40%, rgba(182,170,219,0.07) 0%, rgba(129,118,166,0.03) 12%, rgba(255,255,255,0) 30%), linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(102,92,132,0.05) 24%, rgba(24,20,33,0.12) 60%, rgba(255,255,255,0) 100%)",
                        filter: "blur(26px)",
                        opacity: 0.9,
                        mixBlendMode: "screen",
                    }}
                />
                <div
                    ref={sweepBodyRef}
                    className="absolute inset-y-[20%] left-[18%] right-[10%] rounded-[inherit]"
                    style={{
                        background:
                            "radial-gradient(circle at 14% 54%, rgba(174,162,212,0.07) 0%, rgba(255,255,255,0) 20%), radial-gradient(circle at 34% 42%, rgba(167,154,205,0.06) 0%, rgba(255,255,255,0) 18%), radial-gradient(circle at 58% 60%, rgba(159,147,197,0.058) 0%, rgba(255,255,255,0) 18%), radial-gradient(circle at 82% 46%, rgba(153,141,191,0.052) 0%, rgba(255,255,255,0) 16%)",
                        filter: "blur(14px)",
                        opacity: 0.56,
                        mixBlendMode: "soft-light",
                    }}
                />
                <div
                    ref={sweepLipRef}
                    className="absolute inset-y-[24%] right-[2%] w-[34%] rounded-[999px]"
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(198,187,232,0.04) 24%, rgba(223,215,247,0.1) 56%, rgba(255,255,255,0.018) 80%, rgba(255,255,255,0) 100%), radial-gradient(circle at 58% 50%, rgba(222,214,247,0.09) 0%, rgba(196,186,228,0.03) 18%, rgba(255,255,255,0) 48%)",
                        filter: "blur(14px)",
                        opacity: 0.78,
                        mixBlendMode: "screen",
                    }}
                />
                <div
                    ref={sweepGrainRef}
                    className="absolute inset-0 rounded-[inherit]"
                    style={{
                        background:
                            "radial-gradient(circle at 16% 52%, rgba(210,200,243,0.08) 0%, rgba(255,255,255,0) 20%), radial-gradient(circle at 32% 44%, rgba(196,186,231,0.07) 0%, rgba(255,255,255,0) 18%), radial-gradient(circle at 50% 60%, rgba(191,180,226,0.064) 0%, rgba(255,255,255,0) 18%), radial-gradient(circle at 72% 48%, rgba(184,173,220,0.06) 0%, rgba(255,255,255,0) 18%), repeating-linear-gradient(96deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0) 8px, rgba(255,255,255,0) 18px)",
                        mixBlendMode: "soft-light",
                        opacity: 0.34,
                        filter: "blur(8px)",
                    }}
                />
            </div>
        </div>
    );
}

export default function F3PhishingEmail({
    isSceneActive = false,
    hasReleased = false,
    onSequenceRelease,
    onReviewActivity,
    labRange,
    debugOverrides,
    forensicLayouts = F3_FORENSIC_LAYOUTS,
    forensicEditor,
}: F3PhishingEmailProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const ctaAnchorRef = useRef<HTMLDivElement>(null);
    const ctaButtonRef = useRef<HTMLButtonElement>(null);
    const clientSurfaceBoundsRef = useRef<HTMLDivElement>(null);
    const clientSurfaceRightEdgeRef = useRef<HTMLElement>(null);
    const hasStartedRef = useRef(false);
    const labStartAppliedRef = useRef(false);
    const releaseNotifiedRef = useRef(false);
    const touchStartYRef = useRef<number | null>(null);
    const touchNudgedThisGestureRef = useRef(false);
    const nudgeCooldownRef = useRef(0);
    const scheduledTimeoutsRef = useRef<number[]>([]);
    /** Full-viewport mail surface — transform this (not inner elastic) so State 2 never reads as a “card in a box”. */
    const mailStageRef = useRef<HTMLDivElement>(null);
    const elasticLayerRef = useRef<HTMLDivElement>(null);
    const elasticGlowRef = useRef<HTMLDivElement>(null);
    const elasticAnimRef = useRef<Animation | null>(null);
    const elasticGlowAnimRef = useRef<Animation | null>(null);
    const wheelNudgeRafRef = useRef<number | null>(null);
    const wheelNudgedThisGestureRef = useRef(false);
    const wheelGestureIdleTimerRef = useRef<number | null>(null);
    const lastWheelNudgeAtRef = useRef(0);
    const consequenceBackdropRef = useRef<HTMLDivElement>(null);
    const consequenceCopyRef = useRef<HTMLDivElement>(null);
    const consequenceAtmosphereRef = useRef<HTMLDivElement>(null);
    const consequenceDustParticleRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const consequenceHeadlineLineARef = useRef<HTMLSpanElement>(null);
    const consequenceHeadlineLineBRef = useRef<HTMLSpanElement>(null);
    const consequenceSubRef = useRef<HTMLParagraphElement>(null);
    const whatNowButtonRef = useRef<HTMLButtonElement>(null);
    const consequenceEnterTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
    const consequenceAutoAdvanceRef = useRef<number | null>(null);
    const exitConsequenceLockedRef = useRef(false);

    const [phase, setPhase] = useState<F3Phase>("idle");
    const [takeoverVisible, setTakeoverVisible] = useState(false);
    const [shellVisible, setShellVisible] = useState(false);
    const [selectedActive, setSelectedActive] = useState(false);
    const [metaVisible, setMetaVisible] = useState(false);
    const [subjectActive, setSubjectActive] = useState(false);
    const [eventActive, setEventActive] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [actionActive, setActionActive] = useState(false);
    const [ctaVisible, setCtaVisible] = useState(false);
    const [arrowVisible, setArrowVisible] = useState(false);
    const [arrowCycle, setArrowCycle] = useState(0);
    const [breatheCta, setBreatheCta] = useState(false);
    const [showConsequenceLayer, setShowConsequenceLayer] = useState(false);
    const [overscrollGlowPortalReady, setOverscrollGlowPortalReady] = useState(false);
    const [slabPortalReady, setSlabPortalReady] = useState(false);
    const [visibleAnnotationKeys, setVisibleAnnotationKeys] = useState<
        readonly F3ForensicTargetKey[]
    >([]);
    const [animatedAnnotationKey, setAnimatedAnnotationKey] = useState<
        F3ForensicTargetKey | undefined
    >(undefined);
    const [clientSurfaceRightInset, setClientSurfaceRightInset] = useState(0);
    const [clientSurfaceSourceOrigin, setClientSurfaceSourceOrigin] = useState<{
        x: number;
        y: number;
    }>({ x: 34, y: 34 });
    const manualMode = debugOverrides?.manualMode ?? false;
    const hasLabRange = labRange !== undefined;
    const resolvedPhase: F3Phase =
        manualMode && debugOverrides?.phase !== undefined ? debugOverrides.phase : phase;
    const transitionCheckpoint = manualMode ? debugOverrides?.transitionCheckpoint : undefined;
    const manualSlabStage: F3RemediationSlabDebugStage | undefined =
        transitionCheckpoint === "seam"
            ? "seam"
            : transitionCheckpoint === "slab-formed"
              ? "grow"
              : transitionCheckpoint === "headline"
                ? "headline"
                : transitionCheckpoint === "hold"
                  ? "hold"
                  : undefined;
    const labSlabStage: F3RemediationSlabDebugStage | undefined =
        hasLabRange && resolvedPhase === "remediationSlab"
            ? labRange.start === "end-slab-entrance" && labRange.end === "end-slab-entrance"
                ? "hold"
                : undefined
            : hasLabRange &&
                labRange.start === "end-docking" &&
                resolvedPhase === "remediationDocked"
              ? "docked"
              : undefined;
    const shouldSkipTypingAnimation =
        prefersReducedMotion || (hasLabRange && labRange.start !== "absolute-beginning") || manualMode;
    const selectedRowStartMs = SHELL_START_MS + SHELL_DURATION_MS;
    const metaStartMs = selectedRowStartMs + SELECTED_ROW_DURATION_MS;
    const subjectStartMs = metaStartMs + META_DURATION_MS;
    const eventStartMs = subjectStartMs + SUBJECT_DURATION_MS + POST_SUBJECT_PAUSE_MS;
    const detailsStartMs = eventStartMs + EVENT_DURATION_MS + POST_EVENT_PAUSE_MS;
    const actionStartMs = detailsStartMs + DETAILS_DURATION_MS + POST_DETAILS_PAUSE_MS;
    const ctaStartMs = actionStartMs + ACTION_DURATION_MS;
    const readyStartMs = ctaStartMs + CTA_DURATION_MS;

    const isStepEnabled = useCallback(
        (key: F3DebugStepKey) => {
            if (!manualMode) return true;
            return debugOverrides?.[key] === true;
        },
        [debugOverrides, manualMode]
    );

    const clearScheduledTimeouts = useCallback(() => {
        scheduledTimeoutsRef.current.forEach((timeoutId) =>
            globalThis.window.clearTimeout(timeoutId)
        );
        scheduledTimeoutsRef.current = [];
    }, []);

    const schedule = useCallback(
        (delay: number, callback: () => void) => {
            const timeoutId = globalThis.window.setTimeout(callback, delay);
            scheduledTimeoutsRef.current.push(timeoutId);
        },
        []
    );

    const runCtaBreathe = useCallback(() => {
        setBreatheCta(false);
        globalThis.window.requestAnimationFrame(() => setBreatheCta(true));
        schedule(980, () => setBreatheCta(false));
    }, [schedule]);

    const playElasticNudge = useCallback(() => {
        if (!isStepEnabled("isNudging") || prefersReducedMotion) return;
        const el = elasticLayerRef.current;
        if (!el || typeof el.animate !== "function") return;

        elasticAnimRef.current?.cancel();
        elasticGlowAnimRef.current?.cancel();

        try {
            const anim = el.animate(
                [
                    {
                        transform: "translateY(0px)",
                        easing: "cubic-bezier(0.33, 0, 0.2, 1)",
                    },
                    {
                        transform: "translateY(-14px)",
                        offset: 0.52,
                        easing: "cubic-bezier(0.22, 1, 0.32, 1)",
                    },
                    { transform: "translateY(0px)" },
                ],
                {
                    duration: ELASTIC_NUDGE_DURATION_MS,
                    fill: "none",
                }
            );
            elasticAnimRef.current = anim;
            anim.onfinish = () => {
                if (elasticAnimRef.current === anim) {
                    elasticAnimRef.current = null;
                }
            };

            const glowEl = elasticGlowRef.current;
            if (glowEl && typeof glowEl.animate === "function") {
                const glowAnim = glowEl.animate(
                    [
                        {
                            opacity: 0,
                            easing: "cubic-bezier(0.33, 0, 0.2, 1)",
                        },
                        {
                            opacity: ELASTIC_OVERSCROLL_GLOW_PEAK,
                            offset: 0.52,
                            easing: "cubic-bezier(0.22, 1, 0.32, 1)",
                        },
                        { opacity: 0 },
                    ],
                    {
                        duration: ELASTIC_NUDGE_DURATION_MS,
                        fill: "none",
                    }
                );
                elasticGlowAnimRef.current = glowAnim;
                glowAnim.onfinish = () => {
                    if (elasticGlowAnimRef.current === glowAnim) {
                        elasticGlowAnimRef.current = null;
                    }
                };
            }
        } catch {
            elasticAnimRef.current = null;
            elasticGlowAnimRef.current = null;
        }
    }, [isStepEnabled, prefersReducedMotion]);

    const triggerNudge = useCallback(() => {
        const now = Date.now();
        if (now - nudgeCooldownRef.current < NUDGE_MIN_INTERVAL_MS) return;
        nudgeCooldownRef.current = now;

        playElasticNudge();

        if (isStepEnabled("arrowVisible")) {
            setArrowCycle((current) => current + 1);
            setArrowVisible(true);
        }

        if (isStepEnabled("breatheCta")) {
            runCtaBreathe();
        }
    }, [isStepEnabled, playElasticNudge, runCtaBreathe]);

    const dismissNudgeArrow = useCallback(() => setArrowVisible(false), []);

    const handleArrowDrawEraseEnd = useCallback(
        (event: AnimationEvent<HTMLDivElement>) => {
            if (!event.animationName.includes("f3ArrowFadeInOut")) return;
            dismissNudgeArrow();
        },
        [dismissNudgeArrow]
    );

    useEffect(() => {
        return () => clearScheduledTimeouts();
    }, [clearScheduledTimeouts]);

    useEffect(() => {
        return () => {
            elasticAnimRef.current?.cancel();
            elasticAnimRef.current = null;
            elasticGlowAnimRef.current?.cancel();
            elasticGlowAnimRef.current = null;
        };
    }, []);

    useEffect(() => {
        setOverscrollGlowPortalReady(true);
        setSlabPortalReady(true);
    }, []);

    useLayoutEffect(() => {
        const boundsEl = clientSurfaceBoundsRef.current;
        const rightEdgeEl = clientSurfaceRightEdgeRef.current;
        if (!boundsEl || !rightEdgeEl) return;

        const updateBounds = () => {
            const boundsRect = boundsEl.getBoundingClientRect();
            const rightRect = rightEdgeEl.getBoundingClientRect();
            const nextInset = Math.max(0, boundsRect.right - rightRect.right);
            const dockTarget = REMEDIATION_DOCK_TARGET_SELECTORS.map((selector) =>
                globalThis.document.querySelector<HTMLElement>(selector)
            ).find((element) => {
                if (!element) return false;
                const rect = element.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });
            const dockRect = dockTarget?.getBoundingClientRect();
            setClientSurfaceRightInset(nextInset);
            if (dockRect != null) {
                setClientSurfaceSourceOrigin({
                    x: clampNumber(
                        dockRect.left + dockRect.width / 2 - boundsRect.left,
                        0,
                        Math.max(boundsRect.width - nextInset, 0)
                    ),
                    y: clampNumber(
                        dockRect.top + dockRect.height / 2 - boundsRect.top,
                        0,
                        boundsRect.height
                    ),
                });
            }
        };

        updateBounds();

        const resizeObserver =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(() => {
                      updateBounds();
                  })
                : null;

        resizeObserver?.observe(boundsEl);
        resizeObserver?.observe(rightEdgeEl);
        REMEDIATION_DOCK_TARGET_SELECTORS.forEach((selector) => {
            const element = globalThis.document.querySelector<HTMLElement>(selector);
            if (element) {
                resizeObserver?.observe(element);
            }
        });
        globalThis.window.addEventListener("resize", updateBounds);

        return () => {
            resizeObserver?.disconnect();
            globalThis.window.removeEventListener("resize", updateBounds);
        };
    }, []);

    useEffect(() => {
        if (!hasLabRange || labStartAppliedRef.current) return;

        if (labRange.start === "absolute-beginning") {
            labStartAppliedRef.current = true;
            return;
        }

        hasStartedRef.current = true;
        setTakeoverVisible(true);
        setShellVisible(true);
        setSelectedActive(true);
        setMetaVisible(true);
        setSubjectActive(true);
        setEventActive(true);
        setDetailsVisible(true);
        setActionActive(true);
        setCtaVisible(true);

        if (labRange.start === "end-state1") {
            setPhase("ready");
        } else if (labRange.start === "end-state2") {
            setShowConsequenceLayer(true);
            setPhase("consequence");
        } else if (labRange.start === "end-slab-entrance") {
            setPhase("remediationSlab");
        } else if (labRange.start === "end-docking") {
            setPhase("remediationDocked");
        } else if (labRange.start === "end-surface") {
            setPhase("remediationTransformed");
        } else if (labRange.start === "absolute-end") {
            setPhase("remediationSettled");
        }

        labStartAppliedRef.current = true;
    }, [hasLabRange, labRange]);

    useEffect(() => {
        if (!isSceneActive || hasReleased || hasStartedRef.current) return;

        hasStartedRef.current = true;
        setTakeoverVisible(isStepEnabled("takeoverVisible"));

        if (prefersReducedMotion) {
            setPhase("ready");
            setShellVisible(isStepEnabled("shellVisible"));
            setSelectedActive(isStepEnabled("selectedActive"));
            setMetaVisible(isStepEnabled("metaVisible"));
            setSubjectActive(isStepEnabled("subjectActive"));
            setEventActive(isStepEnabled("eventActive"));
            setDetailsVisible(isStepEnabled("detailsVisible"));
            setActionActive(isStepEnabled("actionActive"));
            setCtaVisible(isStepEnabled("ctaVisible"));
            return;
        }

        setPhase("entering");

        schedule(SHELL_START_MS, () => {
            setPhase("composing");
            setShellVisible(isStepEnabled("shellVisible"));
        });
        schedule(selectedRowStartMs, () => setSelectedActive(isStepEnabled("selectedActive")));
        schedule(metaStartMs, () => setMetaVisible(isStepEnabled("metaVisible")));
        schedule(subjectStartMs, () => setSubjectActive(isStepEnabled("subjectActive")));
        schedule(eventStartMs, () => setEventActive(isStepEnabled("eventActive")));
        schedule(detailsStartMs, () => setDetailsVisible(isStepEnabled("detailsVisible")));
        schedule(actionStartMs, () => setActionActive(isStepEnabled("actionActive")));
        schedule(ctaStartMs, () => setCtaVisible(isStepEnabled("ctaVisible")));
        schedule(readyStartMs, () => {
            setPhase("ready");
            if (isStepEnabled("breatheCta")) {
                schedule(2300, runCtaBreathe);
            }
        });
    }, [
        hasReleased,
        isSceneActive,
        isStepEnabled,
        prefersReducedMotion,
        readyStartMs,
        runCtaBreathe,
        schedule,
        selectedRowStartMs,
        metaStartMs,
        subjectStartMs,
        eventStartMs,
        detailsStartMs,
        actionStartMs,
        ctaStartMs,
    ]);

    const clearConsequenceAutoAdvance = useCallback(() => {
        if (consequenceAutoAdvanceRef.current != null) {
            globalThis.window.clearTimeout(consequenceAutoAdvanceRef.current);
            consequenceAutoAdvanceRef.current = null;
        }
    }, []);

    const exitConsequence = useCallback(() => {
        if (exitConsequenceLockedRef.current) return;
        exitConsequenceLockedRef.current = true;
        clearConsequenceAutoAdvance();
        consequenceEnterTimelineRef.current?.kill();
        consequenceEnterTimelineRef.current = null;

        const handoffToRemediationSlab = () => {
            setPhase("remediationSlab");
        };

        const mailStage = mailStageRef.current;
        const backdrop = consequenceBackdropRef.current;
        const copy = consequenceCopyRef.current;
        const atmosphere = consequenceAtmosphereRef.current;
        const dustParticles = consequenceDustParticleRefs.current.filter(
            (particle): particle is HTMLSpanElement => particle !== null
        );
        const lineA = consequenceHeadlineLineARef.current;
        const lineB = consequenceHeadlineLineBRef.current;
        const sub = consequenceSubRef.current;
        const btn = whatNowButtonRef.current;

        if (!mailStage || !backdrop || !copy || !atmosphere || !lineA || !lineB || !sub || !btn) {
            setShowConsequenceLayer(false);
            handoffToRemediationSlab();
            return;
        }

        if (prefersReducedMotion) {
            setShowConsequenceLayer(false);
            handoffToRemediationSlab();
            return;
        }

        const verdictGroup = [lineA, lineB, sub, btn];
        gsap.set(atmosphere, {
            opacity: 0,
            scale: 0.94,
            y: 6,
            filter: "blur(24px)",
            transformOrigin: "50% 40%",
            force3D: true,
        });
        if (dustParticles.length > 0) {
            gsap.set(dustParticles, {
                opacity: 0,
                scale: 0.35,
                x: 0,
                y: 0,
                filter: "blur(4px)",
                force3D: true,
            });
        }
        const tl = gsap.timeline({
                defaults: { ease: CONSEQUENCE_EXIT_EASE },
                onComplete: () => {
                    gsap.set(verdictGroup, {
                        clearProps: "opacity,filter,transform,scale,y,z,transformOrigin,force3D",
                    });
                    gsap.set(copy, {
                        clearProps: "opacity,filter,transform,scale,y,z,transformOrigin,force3D",
                    });
                    gsap.set(atmosphere, {
                        clearProps: "opacity,filter,transform,scale,y,transformOrigin,force3D",
                    });
                    if (dustParticles.length > 0) {
                        gsap.set(dustParticles, {
                            clearProps: "opacity,filter,transform,scale,x,y,force3D",
                        });
                    }
                    gsap.set(backdrop, { clearProps: "opacity" });
                    setShowConsequenceLayer(false);
                },
            })
        tl
            .to(
                {},
                {
                    duration: CONSEQUENCE_EXIT_HOLD_MS / 1000,
                    onComplete: () => {
                        handoffToRemediationSlab();
                    },
                },
                0
            )
            .to(
                backdrop,
                {
                    opacity: 0,
                    duration:
                        (CONSEQUENCE_MAIL_STAGE_DURATION_MS *
                            CONSEQUENCE_MAIL_STAGE_BACKDROP_RATIO) /
                        1000,
                    ease: CONSEQUENCE_MAIL_STAGE_EASE,
                },
                ">"
            )
            .to(
                mailStage,
                {
                    scale: 1,
                    z: 0,
                    filter: "blur(0px)",
                    force3D: true,
                    duration: CONSEQUENCE_MAIL_STAGE_DURATION_MS / 1000,
                    ease: CONSEQUENCE_MAIL_STAGE_EASE,
                },
                "<"
            )
            .to(
                verdictGroup,
                {
                    opacity: 0,
                    scale: 0.978,
                    y: -10,
                    z: 18,
                    filter: "blur(18px)",
                    transformOrigin: "50% 55%",
                    force3D: true,
                    duration: (CONSEQUENCE_EXIT_REVEAL_MS * 1.22) / 1000,
                    stagger: 0.08,
                },
                "<"
            )
            .to(
                copy,
                {
                    opacity: 0,
                    scale: 0.988,
                    z: 22,
                    filter: "blur(22px)",
                    transformOrigin: "50% 55%",
                    force3D: true,
                    duration: (CONSEQUENCE_EXIT_REVEAL_MS * 1.28) / 1000,
                },
                "<"
            )
            .to(
                atmosphere,
                {
                    opacity: 0.84,
                    scale: 1.06,
                    y: -12,
                    filter: "blur(36px)",
                    force3D: true,
                    duration: (CONSEQUENCE_EXIT_REVEAL_MS * 1.28) / 1000,
                },
                "<"
            );

        if (dustParticles.length > 0) {
            dustParticles.forEach((particle, index) => {
                const particleMotion = CONSEQUENCE_DUST_PARTICLES[index];
                if (!particleMotion) return;

                gsap.timeline({ defaults: { ease: "power2.out" } })
                    .to(
                        particle,
                        {
                            opacity: 0.88,
                            scale: 1,
                            filter: "blur(1.6px)",
                            duration: 0.12,
                        },
                        CONSEQUENCE_EXIT_HOLD_MS / 1000 + particleMotion.delay
                    )
                    .to(
                        particle,
                        {
                            opacity: 0,
                            x: particleMotion.x,
                            y: particleMotion.y,
                            scale: 1.72,
                            filter: "blur(10px)",
                            duration: (CONSEQUENCE_EXIT_REVEAL_MS * 1.08) / 1000,
                            ease: "power1.out",
                        },
                        `>+=0.02`
                    );
            });
        }
    }, [clearConsequenceAutoAdvance, prefersReducedMotion]);

    const handleRemediationDockComplete = useCallback(() => {
        setPhase((current) => (current === "remediationSlab" ? "remediationDocked" : current));
    }, []);

    const handleReskinTransformComplete = useCallback(() => {
        setPhase((current) =>
            current === "remediationTransforming" ? "remediationTransformed" : current
        );
    }, []);

    useEffect(() => {
        if (resolvedPhase !== "remediationDocked") return;
        if (manualMode || (hasLabRange && labRange.end === "end-docking")) return;

        const timeoutId = globalThis.window.setTimeout(() => {
            setPhase((current) =>
                current === "remediationDocked" ? "remediationTransforming" : current
            );
        }, REMEDIATION_RESKIN_START_DELAY_MS);

        return () => globalThis.window.clearTimeout(timeoutId);
    }, [hasLabRange, labRange, manualMode, resolvedPhase]);

    useEffect(() => {
        if (resolvedPhase !== "remediationTransformed") return;
        if (manualMode || (hasLabRange && labRange.end === "end-surface")) return;

        const timeoutId = globalThis.window.setTimeout(() => {
            setPhase((current) =>
                current === "remediationTransformed" ? "remediation" : current
            );
        }, REMEDIATION_POST_TRANSFORM_SETTLE_MS);

        return () => globalThis.window.clearTimeout(timeoutId);
    }, [hasLabRange, labRange, manualMode, resolvedPhase]);

    useEffect(() => {
        if (resolvedPhase === "remediationTransforming" || resolvedPhase === "remediationTransformed") {
            setVisibleAnnotationKeys([]);
            setAnimatedAnnotationKey(undefined);
            return;
        }

        if (resolvedPhase === "remediation") {
            setVisibleAnnotationKeys(["sender-domain"]);
            setAnimatedAnnotationKey("sender-domain");
            return;
        }

        if (resolvedPhase === "remediationSettled" || resolvedPhase === "sequenceComplete") {
            setVisibleAnnotationKeys(["sender-domain", "pressure", "cta"]);
            setAnimatedAnnotationKey(undefined);
            return;
        }
    }, [resolvedPhase]);

    const requestSequenceRelease = useCallback(() => {
        if (releaseNotifiedRef.current) return;
        releaseNotifiedRef.current = true;
        onSequenceRelease?.();
        setPhase("sequenceComplete");
    }, [onSequenceRelease]);

    const handleAnimatedAnnotationComplete = useCallback((key: F3ForensicTargetKey) => {
        if (key === "sender-domain") {
            setAnimatedAnnotationKey(undefined);
            schedule(REMEDIATION_ANNOTATION_PAIR_PAUSE_MS, () => {
                setVisibleAnnotationKeys(["sender-domain", "pressure"]);
                setAnimatedAnnotationKey("pressure");
            });
            return;
        }

        if (key === "pressure") {
            setAnimatedAnnotationKey(undefined);
            schedule(REMEDIATION_ANNOTATION_PAIR_PAUSE_MS, () => {
                setVisibleAnnotationKeys(["sender-domain", "pressure", "cta"]);
                setAnimatedAnnotationKey("cta");
            });
            return;
        }

        if (key === "cta") {
            setAnimatedAnnotationKey(undefined);
            schedule(REMEDIATION_ANNOTATION_PAIR_PAUSE_MS, () => {
                setPhase((current) => (current === "remediation" ? "remediationSettled" : current));
            });
        }
    }, [schedule]);

    useLayoutEffect(() => {
        if (resolvedPhase !== "remediation") return;
        const mailStage = mailStageRef.current;
        if (mailStage) {
            gsap.to(mailStage, {
                scale: 1,
                z: 0,
                filter: "blur(0px)",
                duration: 0.28,
                ease: "power2.out",
                force3D: true,
            });
        }
    }, [resolvedPhase]);

    useLayoutEffect(() => {
        if (resolvedPhase !== "consequence") return;

        exitConsequenceLockedRef.current = false;
        setShowConsequenceLayer(true);

        const mailStage = mailStageRef.current;
        const backdrop = consequenceBackdropRef.current;
        const copy = consequenceCopyRef.current;
        const atmosphere = consequenceAtmosphereRef.current;
        const lineA = consequenceHeadlineLineARef.current;
        const lineB = consequenceHeadlineLineBRef.current;
        const sub = consequenceSubRef.current;
        const btn = whatNowButtonRef.current;
        if (!mailStage || !backdrop || !copy || !lineA || !lineB || !sub || !btn) return;
        const verdictGroup = [lineA, lineB, sub, btn];

        clearConsequenceAutoAdvance();
        consequenceEnterTimelineRef.current?.kill();

        if (atmosphere) {
            gsap.set(atmosphere, {
                opacity: 0,
                scale: 0.94,
                y: 6,
                filter: "blur(24px)",
                transformOrigin: "50% 40%",
                force3D: true,
            });
        }

        const scheduleAutoAdvance = () => {
            if (
                manualMode ||
                (hasLabRange &&
                    (labRange.end === "end-state2" || labRange.start === "end-state2"))
            ) {
                return;
            }
            clearConsequenceAutoAdvance();
            consequenceAutoAdvanceRef.current = globalThis.window.setTimeout(() => {
                consequenceAutoAdvanceRef.current = null;
                exitConsequence();
            }, CONSEQUENCE_AUTO_ADVANCE_MS);
        };

        /* Blur + Z + scale only — never brightness/opacity on this layer: filtered pixels read
         * darker than the unfiltered `var(--background)` revealed at scaled letterbox edges. */
        const mailStageEnd = {
            scale: 0.92,
            z: -190,
            transformOrigin: "50% 45%" as const,
            filter: "blur(9px)",
            force3D: true,
        };

        if (manualMode || (hasLabRange && labRange.start === "end-state2")) {
            const isStartCheckpoint =
                transitionCheckpoint === undefined || transitionCheckpoint === "consequence-start";
            const isRecedeCheckpoint = transitionCheckpoint === "verdict-recede";

            gsap.set(mailStage, mailStageEnd);
            gsap.set(backdrop, { opacity: 0.52 });
            gsap.set(copy, {
                opacity: isStartCheckpoint ? 1 : isRecedeCheckpoint ? 0.42 : 0,
                scale: isStartCheckpoint ? 1 : 0.965,
                y: isStartCheckpoint ? 0 : 10,
                z: isStartCheckpoint ? 72 : 28,
                filter: isStartCheckpoint ? "blur(0px)" : "blur(8px)",
                transformOrigin: "50% 55%",
                force3D: true,
            });
            gsap.set(verdictGroup, {
                opacity: isStartCheckpoint ? 1 : isRecedeCheckpoint ? 0.34 : 0,
                scale: isStartCheckpoint ? 1 : 0.96,
                y: isStartCheckpoint ? 0 : 10,
                z: isStartCheckpoint ? 0 : 24,
                filter: isStartCheckpoint ? "blur(0px)" : "blur(8px)",
                transformOrigin: "50% 55%",
                force3D: true,
            });
            return undefined;
        }

        if (prefersReducedMotion) {
            gsap.set(mailStage, mailStageEnd);
            gsap.set(backdrop, { opacity: 0.52 });
            gsap.set(copy, { scale: 1, z: 72, transformOrigin: "50% 55%", force3D: true });
            gsap.set([lineA, lineB, sub, btn], { opacity: 1, scale: 1 });
            scheduleAutoAdvance();
            globalThis.window.requestAnimationFrame(() => whatNowButtonRef.current?.focus());
            return () => {
                clearConsequenceAutoAdvance();
            };
        }

        const easeUnified = CONSEQUENCE_MAIL_STAGE_EASE;

        gsap.set(backdrop, { opacity: 0 });
        gsap.set(copy, {
            scale: 0.86,
            z: -40,
            transformOrigin: "50% 55%",
            force3D: true,
        });
        gsap.set([lineA, lineB, sub, btn], { opacity: 0, scale: 0.972 });

        let postSettleTimeoutId = 0;
        const tl = gsap.timeline({
            onComplete: () => {
                consequenceEnterTimelineRef.current = null;
                postSettleTimeoutId = globalThis.window.setTimeout(() => {
                    whatNowButtonRef.current?.focus();
                    scheduleAutoAdvance();
                    postSettleTimeoutId = 0;
                }, CONSEQUENCE_POST_SETTLE_MS);
            },
        });
        consequenceEnterTimelineRef.current = tl;

        const pushDuration = CONSEQUENCE_MAIL_STAGE_DURATION_MS / 1000;
        tl.to(mailStage, { ...mailStageEnd, duration: pushDuration, ease: easeUnified }, 0);
        tl.to(
            backdrop,
            {
                opacity: 0.52,
                duration: pushDuration * CONSEQUENCE_MAIL_STAGE_BACKDROP_RATIO,
                ease: easeUnified,
            },
            0
        );
        tl.to(
            copy,
            {
                scale: 1,
                z: 78,
                duration: pushDuration,
                ease: easeUnified,
                force3D: true,
            },
            0
        );

        const easeLineSoft = "sine.inOut";
        const easeLineCommand = "power2.inOut";
        const easeSub = "sine.inOut";
        const easeBtn = "power2.inOut";
        const lineToA = { opacity: 1, scale: 1, duration: 0.84, ease: easeLineSoft };
        const lineToB = { opacity: 1, scale: 1, duration: 1.48, ease: easeLineCommand };
        const lineToSub = { opacity: 1, scale: 1, duration: 0.95, ease: easeSub };
        const lineToBtn = { opacity: 1, scale: 1, duration: 1.28, ease: easeBtn };
        tl.fromTo(lineA, { opacity: 0, scale: 0.985 }, lineToA, 0.22);
        tl.fromTo(
            lineB,
            { opacity: 0, scale: 0.965 },
            lineToB,
            `>+=${CONSEQUENCE_LINE1_LAND_PAUSE_SEC}`
        );
        tl.fromTo(
            sub,
            { opacity: 0, scale: 0.995 },
            lineToSub,
            `>+=${CONSEQUENCE_LINE2_TO_SUBLINE_PAUSE_SEC}`
        );
        tl.fromTo(
            btn,
            { opacity: 0, scale: 0.995 },
            lineToBtn,
            `>+=${CONSEQUENCE_SUBLINE_TO_CTA_PAUSE_SEC}`
        );

        return () => {
            if (postSettleTimeoutId !== 0) {
                globalThis.window.clearTimeout(postSettleTimeoutId);
            }
            tl.kill();
            if (consequenceEnterTimelineRef.current === tl) {
                consequenceEnterTimelineRef.current = null;
            }
            clearConsequenceAutoAdvance();
        };
    }, [
        clearConsequenceAutoAdvance,
        exitConsequence,
        hasLabRange,
        labRange,
        manualMode,
        prefersReducedMotion,
        resolvedPhase,
        transitionCheckpoint,
    ]);

    useEffect(() => {
        const shouldTrapScroll = isSceneActive && !hasReleased;

        if (!shouldTrapScroll) return;

        const clearWheelGestureTimer = () => {
            if (wheelGestureIdleTimerRef.current != null) {
                globalThis.window.clearTimeout(wheelGestureIdleTimerRef.current);
                wheelGestureIdleTimerRef.current = null;
            }
        };

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();

            const forward = event.deltaY > 0;
            const canReleaseFromDock =
                resolvedPhase === "remediationTransformed" ||
                resolvedPhase === "remediationSettled";

            if (canReleaseFromDock && forward) {
                clearWheelGestureTimer();
                wheelGestureIdleTimerRef.current = globalThis.window.setTimeout(() => {
                    wheelNudgedThisGestureRef.current = false;
                    wheelGestureIdleTimerRef.current = null;
                }, WHEEL_GESTURE_IDLE_MS);

                if (wheelNudgedThisGestureRef.current) return;

                if (wheelNudgeRafRef.current != null) return;
                wheelNudgeRafRef.current = globalThis.window.requestAnimationFrame(() => {
                    wheelNudgeRafRef.current = null;
                    if (wheelNudgedThisGestureRef.current) return;

                    const now = globalThis.window.performance.now();
                    if (now - lastWheelNudgeAtRef.current < MIN_MS_BETWEEN_WHEEL_NUDGES) {
                        wheelNudgedThisGestureRef.current = true;
                        return;
                    }

                    wheelNudgedThisGestureRef.current = true;
                    lastWheelNudgeAtRef.current = now;
                    requestSequenceRelease();
                });
                return;
            }

            if (resolvedPhase !== "ready" || !forward) return;

            clearWheelGestureTimer();
            wheelGestureIdleTimerRef.current = globalThis.window.setTimeout(() => {
                wheelNudgedThisGestureRef.current = false;
                wheelGestureIdleTimerRef.current = null;
            }, WHEEL_GESTURE_IDLE_MS);

            if (wheelNudgedThisGestureRef.current) return;

            if (wheelNudgeRafRef.current != null) return;
            wheelNudgeRafRef.current = globalThis.window.requestAnimationFrame(() => {
                wheelNudgeRafRef.current = null;
                if (wheelNudgedThisGestureRef.current) return;

                const now = globalThis.window.performance.now();
                if (now - lastWheelNudgeAtRef.current < MIN_MS_BETWEEN_WHEEL_NUDGES) {
                    wheelNudgedThisGestureRef.current = true;
                    return;
                }

                wheelNudgedThisGestureRef.current = true;
                lastWheelNudgeAtRef.current = now;
                triggerNudge();
            });
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            const scrollKeys = new Set([
                "ArrowDown",
                "ArrowUp",
                "PageDown",
                "PageUp",
                "Home",
                "End",
                " ",
            ]);

            if (!scrollKeys.has(event.key)) return;

            event.preventDefault();

            if (event.repeat) return;

            const isForwardKey =
                event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ";
            const canReleaseFromDock =
                resolvedPhase === "remediationTransformed" ||
                resolvedPhase === "remediationSettled";

            if (canReleaseFromDock && isForwardKey) {
                requestSequenceRelease();
                return;
            }

            if (resolvedPhase === "ready" && isForwardKey) {
                triggerNudge();
            }
        };

        const handleTouchStart = (event: TouchEvent) => {
            touchStartYRef.current = event.touches[0]?.clientY ?? null;
            touchNudgedThisGestureRef.current = false;
        };

        const handleTouchMove = (event: TouchEvent) => {
            event.preventDefault();
            const canReleaseFromDock =
                resolvedPhase === "remediationTransformed" ||
                resolvedPhase === "remediationSettled";

            if (canReleaseFromDock) {
                const currentY = event.touches[0]?.clientY;
                if (currentY == null || touchStartYRef.current == null) return;

                if (touchNudgedThisGestureRef.current) return;

                if (touchStartYRef.current - currentY > 8) {
                    touchNudgedThisGestureRef.current = true;
                    requestSequenceRelease();
                }
                return;
            }

            if (resolvedPhase !== "ready") return;

            const currentY = event.touches[0]?.clientY;
            if (currentY == null || touchStartYRef.current == null) return;

            if (touchNudgedThisGestureRef.current) return;

            if (touchStartYRef.current - currentY > 8) {
                touchNudgedThisGestureRef.current = true;
                triggerNudge();
            }
        };

        const handleTouchEnd = () => {
            touchNudgedThisGestureRef.current = false;
        };

        globalThis.window.addEventListener("wheel", handleWheel, { passive: false });
        globalThis.window.addEventListener("keydown", handleKeyDown);
        globalThis.window.addEventListener("touchstart", handleTouchStart, {
            passive: false,
        });
        globalThis.window.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        globalThis.window.addEventListener("touchend", handleTouchEnd);
        globalThis.window.addEventListener("touchcancel", handleTouchEnd);

        return () => {
            clearWheelGestureTimer();
            if (wheelNudgeRafRef.current != null) {
                globalThis.window.cancelAnimationFrame(wheelNudgeRafRef.current);
                wheelNudgeRafRef.current = null;
            }
            wheelNudgedThisGestureRef.current = false;
            lastWheelNudgeAtRef.current = 0;
            globalThis.window.removeEventListener("wheel", handleWheel);
            globalThis.window.removeEventListener("keydown", handleKeyDown);
            globalThis.window.removeEventListener("touchstart", handleTouchStart);
            globalThis.window.removeEventListener("touchmove", handleTouchMove);
            globalThis.window.removeEventListener("touchend", handleTouchEnd);
            globalThis.window.removeEventListener("touchcancel", handleTouchEnd);
        };
    }, [hasReleased, isSceneActive, requestSequenceRelease, resolvedPhase, triggerNudge]);

    const handleReviewActivity = () => {
        if (manualMode) return;
        setShowConsequenceLayer(true);
        setPhase("consequence");
        elasticAnimRef.current?.cancel();
        elasticAnimRef.current = null;
        elasticGlowAnimRef.current?.cancel();
        elasticGlowAnimRef.current = null;
        setArrowVisible(false);
        setBreatheCta(false);
        onReviewActivity?.();
    };
    const resolvedTakeoverVisible = manualMode
        ? debugOverrides?.takeoverVisible ?? takeoverVisible
        : takeoverVisible;
    const resolvedShellVisible = manualMode
        ? debugOverrides?.shellVisible ?? shellVisible
        : shellVisible;
    const resolvedSelectedActive = manualMode
        ? debugOverrides?.selectedActive ?? selectedActive
        : selectedActive;
    const resolvedMetaVisible = manualMode
        ? debugOverrides?.metaVisible ?? metaVisible
        : metaVisible;
    const resolvedSubjectActive = manualMode
        ? debugOverrides?.subjectActive ?? subjectActive
        : subjectActive;
    const resolvedEventActive = manualMode
        ? debugOverrides?.eventActive ?? eventActive
        : eventActive;
    const resolvedDetailsVisible = manualMode
        ? debugOverrides?.detailsVisible ?? detailsVisible
        : detailsVisible;
    const resolvedActionActive = manualMode
        ? debugOverrides?.actionActive ?? actionActive
        : actionActive;
    const resolvedCtaVisible = manualMode
        ? debugOverrides?.ctaVisible ?? ctaVisible
        : ctaVisible;
    const resolvedArrowVisible = manualMode
        ? debugOverrides?.arrowVisible ?? arrowVisible
        : arrowVisible;
    const resolvedBreatheCta = manualMode
        ? debugOverrides?.breatheCta ?? breatheCta
        : breatheCta;

    const showTransformedSurface =
        resolvedPhase === "remediationTransforming" ||
        resolvedPhase === "remediationTransformed" ||
        resolvedPhase === "remediation" ||
        resolvedPhase === "remediationSettled" ||
        resolvedPhase === "sequenceComplete";
    const showRemediationUi = false;

    return (
        <div
            className={`relative flex h-full min-h-0 w-full min-w-0 flex-col bg-[var(--background)] ${
                showRemediationUi ? "overflow-x-visible overflow-y-visible" : "overflow-x-clip"
            }`}
            style={{ minHeight: "min(91vh, 940px)" }}
        >
            <div
                className="f3-sequence-frame relative isolate flex h-full min-h-0 flex-1 flex-col bg-[var(--background)]"
                data-phase={resolvedPhase}
                data-takeover-visible={resolvedTakeoverVisible}
            >
                <div
                    ref={mailStageRef}
                    className="f3-mail-stage absolute inset-0 z-[1] flex min-h-0 flex-col bg-[var(--background)]"
                >
                    <div ref={elasticLayerRef} className="f3-elastic-layer flex min-h-0 flex-1 flex-col">
                    {/* Symmetric horizontal inset; inner cluster centered so the reading pane isn’t one-sided on wide viewports */}
                    <div className="flex h-full min-h-[inherit] w-full flex-col px-5 pb-12 pt-12 sm:px-6 sm:pb-12 sm:pt-14 md:px-10 md:pb-10 md:pt-[4.35rem] lg:px-14 lg:pb-11 lg:pt-[4.75rem] xl:px-16">
                        <div
                            ref={clientSurfaceBoundsRef}
                            className="relative mx-auto flex min-h-0 w-full max-w-[min(100%,72rem)] flex-1 flex-col"
                        >
                        {/* Mobile: hint of a list above the reading pane */}
                        <div className="f3-divider relative mb-6 border-b pb-2 md:mb-0 md:hidden">
                            <F3GhostInboxMobileStrip
                                shellVisible={resolvedShellVisible}
                                selectedActive={resolvedSelectedActive}
                                dockTargetId="f3-remediation-dock-target-mobile"
                            />
                        </div>

                        <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row md:items-stretch">
                        {/* Ghost inbox — narrow pane, recedes vs reading area (directions.md) */}
                        <aside
                            className="f3-shell-surface f3-divider relative z-0 hidden min-h-0 shrink-0 flex-col border-r md:flex md:w-[248px] md:min-w-[220px] md:max-w-[260px]"
                            data-shell-visible={resolvedShellVisible}
                            aria-hidden
                        >
                            <F3GhostInboxSidebar
                                shellVisible={resolvedShellVisible}
                                selectedActive={resolvedSelectedActive}
                                dockTargetId="f3-remediation-dock-target-desktop"
                            />
                        </aside>

                        {/* Reading pane: continuous with app chrome; message left-anchored like a real reader */}
                        <article
                            ref={clientSurfaceRightEdgeRef}
                            className="f3-shell-surface f3-divider relative z-[5] flex min-w-0 flex-1 flex-col overflow-visible border-l bg-[var(--background)] md:border-l-0"
                            data-shell-visible={resolvedShellVisible}
                            data-f3-remediation={showTransformedSurface || showRemediationUi ? "true" : "false"}
                            aria-label="Demonstration: simulated security alert email, as in a phishing attempt"
                        >
                            <div className="shrink-0 px-3 pt-0.5 pb-0 md:px-5 lg:px-6">
                                <F3MailReaderChrome />
                            </div>

                            <div className="relative min-h-0 min-w-0 flex-1 overflow-visible px-3 pb-8 pt-5 md:px-5 md:pt-6 md:pb-10 lg:px-6">
                                {showTransformedSurface ? null : showRemediationUi ? (
                                    <F3RemediationReaderPanel
                                        visibleAnnotationKeys={
                                            resolvedPhase === "remediation"
                                                ? (["sender-domain"] as const)
                                                : ["sender-domain", "pressure", "cta"]
                                        }
                                        animatedAnnotationKey={
                                            resolvedPhase === "remediation"
                                                ? ("sender-domain" as F3ForensicTargetKey)
                                                : undefined
                                        }
                                        forensicLayouts={forensicLayouts}
                                        forensicEditor={forensicEditor}
                                    />
                                ) : (
                                    <>
                                {/* em-based type/grid inside; size knob: --f3-message-scale on :root */}
                                <div className="f3-message-scale-root grid w-full max-w-[44rem] grid-cols-[2.5em_minmax(0,1fr)] gap-x-3 md:grid-cols-[2.75em_minmax(0,1fr)] md:gap-x-4">
                                    <TypedLine
                                        as="h2"
                                        text={SUBJECT_LINE}
                                        active={resolvedSubjectActive}
                                        duration={900}
                                        skipAnimation={shouldSkipTypingAnimation}
                                        className="f3-email-subject col-span-2 row-start-1 mb-7 text-left text-[1.52em] leading-[1.06] md:mb-6 md:text-[1.67em] lg:text-[1.78em]"
                                        reserveSpaceText={SUBJECT_LINE}
                                    />

                                    <div
                                        className="f3-meta-item col-start-1 row-start-2 flex items-center justify-center self-center"
                                        data-visible={resolvedMetaVisible}
                                        aria-hidden
                                    >
                                        <div className="f3-avatar-placeholder flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-full text-[0.68em] font-medium tracking-tight text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] md:h-[2.75em] md:w-[2.75em] md:text-[0.7em]">
                                            SO
                                        </div>
                                    </div>

                                    <div
                                        className="f3-meta-item col-start-2 row-start-2 min-w-0 self-center"
                                        data-visible={resolvedMetaVisible}
                                    >
                                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                                            <p className="text-[0.93em] font-normal leading-none text-white/[0.72] md:text-[0.95em]">
                                                {F3_SENDER_DISPLAY}
                                            </p>
                                            <span
                                                className="select-none text-[0.65em] text-white/18"
                                                aria-hidden
                                            >
                                                ·
                                            </span>
                                            <time
                                                className="text-[0.65em] tabular-nums text-white/28"
                                                dateTime="2025-03-22T09:14"
                                            >
                                                9:14 AM
                                            </time>
                                        </div>
                                        <p
                                            className="mt-1 max-w-full truncate font-mono text-[0.64em] leading-none text-white/24 md:text-[0.65em]"
                                            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                                        >
                                            {F3_SENDER_EMAIL}
                                        </p>
                                    </div>

                                    <div className="col-start-2 row-start-3 mt-5 min-w-0 space-y-3 text-[1.02em] font-normal leading-[1.66] tracking-[-0.008em] text-white/[0.64] [text-wrap:pretty] md:mt-6 md:space-y-3.5 md:text-[1.06em] md:leading-[1.64]">
                                        <TypedLine
                                            text={EVENT_SENTENCE}
                                            active={resolvedEventActive}
                                            duration={EVENT_DURATION_MS}
                                            skipAnimation={shouldSkipTypingAnimation}
                                            className="f3-body-line"
                                        />
                                        <ul className="f3-detail-list list-disc space-y-1.5 pl-[1.15em] marker:text-white/35" data-visible={resolvedDetailsVisible}>
                                            <li>
                                                <TypedLine
                                                    as="span"
                                                    text={F3_DETAIL_LOCATION}
                                                    active={resolvedDetailsVisible}
                                                    duration={DETAILS_DURATION_MS}
                                                    skipAnimation={shouldSkipTypingAnimation}
                                                    className="f3-detail-line"
                                                    reserveSpaceText={F3_DETAIL_LOCATION}
                                                    reserveSpaceContent={
                                                        <>
                                                            <strong className="font-semibold text-white/[0.8]">
                                                                Location:
                                                            </strong>{" "}
                                                            Soroca, Moldavia
                                                        </>
                                                    }
                                                    completeContent={
                                                        <>
                                                            <strong className="font-semibold text-white/[0.8]">
                                                                Location:
                                                            </strong>{" "}
                                                            Soroca, Moldavia
                                                        </>
                                                    }
                                                />
                                            </li>
                                            <li>
                                                <TypedLine
                                                    as="span"
                                                    text={F3_DETAIL_DEVICE}
                                                    active={resolvedDetailsVisible}
                                                    duration={DETAILS_DURATION_MS}
                                                    skipAnimation={shouldSkipTypingAnimation}
                                                    className="f3-detail-line"
                                                    reserveSpaceText={F3_DETAIL_DEVICE}
                                                    reserveSpaceContent={
                                                        <>
                                                            <strong className="font-semibold text-white/[0.8]">
                                                                Device:
                                                            </strong>{" "}
                                                            Windows 11 · Chrome
                                                        </>
                                                    }
                                                    completeContent={
                                                        <>
                                                            <strong className="font-semibold text-white/[0.8]">
                                                                Device:
                                                            </strong>{" "}
                                                            Windows 11 · Chrome
                                                        </>
                                                    }
                                                />
                                            </li>
                                            <li>
                                                <TypedLine
                                                    as="span"
                                                    text={F3_DETAIL_TIME}
                                                    active={resolvedDetailsVisible}
                                                    duration={DETAILS_DURATION_MS}
                                                    skipAnimation={shouldSkipTypingAnimation}
                                                    className="f3-detail-line"
                                                    reserveSpaceText={F3_DETAIL_TIME}
                                                    reserveSpaceContent={
                                                        <>
                                                            <strong className="font-semibold text-white/[0.8]">
                                                                Time:
                                                            </strong>{" "}
                                                            Today, 9:14 AM
                                                        </>
                                                    }
                                                    completeContent={
                                                        <>
                                                            <strong className="font-semibold text-white/[0.8]">
                                                                Time:
                                                            </strong>{" "}
                                                            Today, 9:14 AM
                                                        </>
                                                    }
                                                />
                                            </li>
                                        </ul>
                                        <TypedLine
                                            text={ACTION_SENTENCE}
                                            active={resolvedActionActive}
                                            duration={560}
                                            skipAnimation={shouldSkipTypingAnimation}
                                            className="f3-body-line"
                                            completeContent={
                                                <>
                                                    If you don&apos;t recognize this activity, secure your
                                                    account{" "}
                                                    <strong className="font-bold text-white/[0.88]">
                                                        now
                                                    </strong>!
                                                </>
                                            }
                                        />
                                    </div>

                                    {/* CTA + nudge arrow share one positioning anchor (button-relative arrow) */}
                                    <div
                                        ref={ctaAnchorRef}
                                        className="relative col-start-2 row-start-4 mt-5 min-h-0 min-w-0 overflow-visible md:mt-6"
                                    >
                                        <div
                                            className="f3-cta-wrap"
                                            data-visible={resolvedCtaVisible}
                                            style={{
                                                fontSize:
                                                    "calc(1rem / var(--f3-message-scale, 1))",
                                            }}
                                        >
                                            <button
                                                ref={ctaButtonRef}
                                                type="button"
                                                className={`f3-email-cta inline-flex min-h-[42px] min-w-[12.5rem] cursor-pointer items-center justify-center rounded-lg px-7 py-2.5 text-[0.875rem] font-semibold leading-none tracking-[-0.01em] sm:min-h-[44px] sm:min-w-[13rem] sm:px-8 sm:py-3 sm:text-[0.9375rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-secondary)_50%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${resolvedBreatheCta ? "f3-email-cta-breathe" : ""}`}
                                                onClick={handleReviewActivity}
                                            >
                                                {F3_CTA_LABEL}
                                            </button>
                                        </div>
                                        {resolvedArrowVisible && resolvedPhase === "ready" ? (
                                            <F3NudgeArrow
                                                key={arrowCycle}
                                                anchorRef={ctaAnchorRef}
                                                ctaRef={ctaButtonRef}
                                                prefersReducedMotion={prefersReducedMotion}
                                                onArrowDone={dismissNudgeArrow}
                                                onDrawEraseAnimationEnd={handleArrowDrawEraseEnd}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                                    </>
                                )}
                            </div>
                        </article>
                    </div>
                        {(resolvedPhase === "remediationTransforming" ||
                            resolvedPhase === "remediationTransformed" ||
                            resolvedPhase === "remediation" ||
                            resolvedPhase === "remediationSettled" ||
                            resolvedPhase === "sequenceComplete") ? (
                            <F3ClientReskinOverlay
                                phase={resolvedPhase}
                                prefersReducedMotion={prefersReducedMotion}
                                onComplete={handleReskinTransformComplete}
                                visibleAnnotationKeys={visibleAnnotationKeys}
                                animatedAnnotationKey={animatedAnnotationKey}
                                onAnimatedAnnotationComplete={handleAnimatedAnnotationComplete}
                                rightInset={clientSurfaceRightInset}
                                sourceOrigin={clientSurfaceSourceOrigin}
                                forensicLayouts={forensicLayouts}
                                forensicEditor={forensicEditor}
                            />
                        ) : null}
                        </div>
                </div>
                </div>
                </div>

                {showConsequenceLayer ? (
                    <section
                        className="f3-consequence-layer pointer-events-auto absolute inset-0 z-[40] flex items-center justify-center px-6"
                        aria-labelledby="f3-consequence-headline"
                        aria-describedby="f3-consequence-sub"
                    >
                        <div
                            ref={consequenceBackdropRef}
                            className="f3-consequence-backdrop absolute inset-0"
                            aria-hidden
                        />
                        {/* Optical lift: GSAP targets inner copy only so this offset stays static. */}
                        <div className="relative z-[1] -translate-y-[min(3vh,1.75rem)] pointer-events-none">
                            <div
                                ref={consequenceAtmosphereRef}
                                className="pointer-events-none absolute inset-x-[-10%] top-[-14%] bottom-[-18%] rounded-[42px]"
                                style={{
                                    opacity: 0,
                                    background:
                                        "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.085) 0%, rgba(167,139,250,0.09) 18%, rgba(92,63,166,0.055) 38%, rgba(10,8,16,0) 74%)",
                                    mixBlendMode: "screen",
                                }}
                                aria-hidden
                            />
                            <div
                                ref={consequenceCopyRef}
                                className="f3-consequence-copy-3d flex max-w-[min(100%,32rem)] flex-col items-center text-center md:max-w-[38rem] pointer-events-none will-change-transform"
                            >
                            <p id="f3-consequence-announcer" className="sr-only" aria-live="polite">
                                {CONSEQUENCE_HEADLINE} {CONSEQUENCE_SUBLINE}
                            </p>
                            <h2
                                id="f3-consequence-headline"
                                className="flex w-full flex-col items-center gap-4 text-balance md:gap-5"
                            >
                                <span
                                    ref={consequenceHeadlineLineARef}
                                    className="block text-[1.48rem] font-semibold leading-[1.22] tracking-[-0.022em] text-white/58 opacity-0 will-change-transform md:text-[1.58rem] lg:text-[1.68rem]"
                                >
                                    {CONSEQUENCE_HEADLINE_LINE_A}
                                </span>
                                <span
                                    ref={consequenceHeadlineLineBRef}
                                    className="block max-w-[min(100%,22ch)] text-[2.05rem] font-extrabold leading-[1.02] tracking-[-0.042em] text-white opacity-0 will-change-transform md:text-[2.45rem] lg:text-[2.85rem]"
                                >
                                    {CONSEQUENCE_HEADLINE_LINE_B}
                                </span>
                            </h2>
                            <p
                                id="f3-consequence-sub"
                                ref={consequenceSubRef}
                                className="mt-6 max-w-[40ch] text-pretty text-[0.98rem] font-normal leading-[1.58] tracking-[-0.012em] text-white/44 opacity-0 md:mt-7 md:max-w-[44ch] md:text-[1.03rem] md:leading-[1.62] will-change-transform"
                            >
                                {CONSEQUENCE_SUBLINE}
                            </p>
                            <button
                                ref={whatNowButtonRef}
                                type="button"
                                className="pointer-events-auto cursor-pointer mt-8 inline-flex min-h-12 min-w-[10.5rem] items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.045] px-9 py-3 text-[0.93rem] font-medium tracking-[-0.015em] text-white/86 opacity-0 backdrop-blur-sm transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-secondary)_45%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] md:mt-9 md:min-h-[3.05rem] md:px-10 md:text-[0.97rem] will-change-transform"
                                onClick={() => exitConsequence()}
                            >
                                {CONSEQUENCE_CTA_LABEL}
                            </button>
                            </div>
                        </div>
                    </section>
                ) : null}

            </div>
            {overscrollGlowPortalReady
                ? createPortal(
                      <div
                          ref={elasticGlowRef}
                          className="f3-elastic-overscroll-glow"
                          aria-hidden
                      />,
                      globalThis.document.body
                  )
                : null}
            {slabPortalReady &&
            (
                resolvedPhase === "remediationSlab" ||
                resolvedPhase === "remediationDocked" ||
                resolvedPhase === "remediationTransforming" ||
                manualSlabStage !== undefined
            ) ? (
                <F3RemediationSlab
                    prefersReducedMotion={prefersReducedMotion}
                    debugStage={manualSlabStage ?? labSlabStage}
                    handoffActive={resolvedPhase === "remediationTransforming"}
                    enableDocking={!manualMode && !(hasLabRange && labRange.end === "end-slab-entrance")}
                    dockTargetSelectors={REMEDIATION_DOCK_TARGET_SELECTORS}
                    onDockComplete={handleRemediationDockComplete}
                />
            ) : null}
        </div>
    );
}
