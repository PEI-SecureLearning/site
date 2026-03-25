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
import F3NudgeArrow from "./F3NudgeArrow";

export type F3PhishingEmailProps = Readonly<{
    isSceneActive?: boolean;
    hasReleased?: boolean;
    onSequenceRelease?: () => void;
    onReviewActivity?: () => void;
    debugOverrides?: Partial<{
        manualMode: boolean;
        phase: F3Phase;
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
}>;

type F3Phase =
    | "idle"
    | "entering"
    | "composing"
    | "ready"
    | "consequence"
    | "sequenceComplete";
type F3DebugStepKey = Exclude<
    NonNullable<F3PhishingEmailProps["debugOverrides"]> extends infer T
        ? T extends object
            ? keyof T
            : never
        : never,
    "manualMode" | "phase"
>;

const SUBJECT_LINE = "Unusual sign-in attempt detected";
const EVENT_SENTENCE = "We detected a sign-in attempt from a new device on your account.";
const ACTION_SENTENCE = "If you don't recognize this activity, secure your account now!";
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

/** Auto-advance if “What now?” is untouched (~2.85s after focus + timer start). */
const CONSEQUENCE_AUTO_ADVANCE_MS = 2850;

const CONSEQUENCE_EXIT_FADE_MS = 480;

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

function MailReaderChrome() {
    return (
        <header className="f3-divider border-b pb-3.5 pt-0.5">
            <div
                className="flex min-h-9 items-center gap-1 sm:gap-1.5"
                role="toolbar"
                aria-label="Message toolbar"
            >
                <div className="flex shrink-0 items-center gap-0.5">
                    <button type="button" className="f3-mail-icon-btn" aria-label="Back to inbox">
                        <svg
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.65}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button type="button" className="f3-mail-icon-btn" aria-label="Archive">
                        <svg
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.65}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                        >
                            <path d="M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                            <path d="M3 8l1.5-3h15L21 8" />
                            <path d="M10 13h4" />
                        </svg>
                    </button>
                    <button type="button" className="f3-mail-icon-btn" aria-label="More">
                        <svg
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            aria-hidden
                        >
                            <circle cx="12" cy="6" r="1.1" fill="currentColor" stroke="none" />
                            <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
                            <circle cx="12" cy="18" r="1.1" fill="currentColor" stroke="none" />
                        </svg>
                    </button>
                </div>

                <div
                    className="f3-mail-search-field flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border px-2 sm:px-2.5"
                    aria-hidden
                >
                    <svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        className="f3-mail-search-icon shrink-0"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-4-4" />
                    </svg>
                    <span
                        className="f3-mail-search-placeholder min-w-0 flex-1 truncate text-left text-[0.7rem] tracking-wide sm:text-[0.72rem]"
                        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                    >
                        Search mail
                    </span>
                </div>

                <button type="button" className="f3-mail-icon-btn" aria-label="Star">
                    <svg
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.65}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                    >
                        <path d="M12 3.5l2.2 5.5 5.8.4-4.5 3.6 1.6 5.6L12 15.9 6.9 18.6l1.6-5.6L4 9.4l5.8-.4L12 3.5z" />
                    </svg>
                </button>
            </div>
        </header>
    );
}

export default function F3PhishingEmail({
    isSceneActive = false,
    hasReleased = false,
    onSequenceRelease,
    onReviewActivity,
    debugOverrides,
}: F3PhishingEmailProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const ctaAnchorRef = useRef<HTMLDivElement>(null);
    const ctaButtonRef = useRef<HTMLButtonElement>(null);
    const hasStartedRef = useRef(false);
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
    const [overscrollGlowPortalReady, setOverscrollGlowPortalReady] = useState(false);
    const manualMode = debugOverrides?.manualMode ?? false;
    const resolvedPhase: F3Phase =
        manualMode && debugOverrides?.phase !== undefined ? debugOverrides.phase : phase;
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
    }, []);

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

        const notifyRelease = () => {
            if (!releaseNotifiedRef.current) {
                releaseNotifiedRef.current = true;
                onSequenceRelease?.();
            }
            setPhase("sequenceComplete");
        };

        const mailStage = mailStageRef.current;
        const backdrop = consequenceBackdropRef.current;
        const copy = consequenceCopyRef.current;

        if (!mailStage || !backdrop || !copy) {
            notifyRelease();
            return;
        }

        if (prefersReducedMotion) {
            gsap.set(mailStage, { clearProps: "scale,filter,opacity,transform" });
            gsap.set(copy, { clearProps: "scale,opacity,transform,z" });
            gsap.set(backdrop, { opacity: 0 });
            notifyRelease();
            return;
        }

        const exitDur = CONSEQUENCE_EXIT_FADE_MS / 1000;
        gsap
            .timeline({
                defaults: { duration: exitDur, ease: "power2.inOut" },
                onComplete: () => {
                    gsap.set(mailStage, { clearProps: "scale,filter,opacity,transform" });
                    gsap.set(copy, { clearProps: "scale,opacity,transform,z" });
                    notifyRelease();
                },
            })
            .to(backdrop, { opacity: 0 }, 0)
            .to(
                copy,
                {
                    opacity: 0,
                    scale: 0.97,
                    z: -20,
                    transformOrigin: "50% 55%",
                    force3D: true,
                },
                0
            )
            .to(
                mailStage,
                {
                    scale: 1,
                    z: 0,
                    filter: "blur(0px)",
                    force3D: true,
                },
                0
            );
    }, [clearConsequenceAutoAdvance, onSequenceRelease, prefersReducedMotion]);

    useLayoutEffect(() => {
        if (resolvedPhase !== "consequence") return;

        exitConsequenceLockedRef.current = false;

        const mailStage = mailStageRef.current;
        const backdrop = consequenceBackdropRef.current;
        const copy = consequenceCopyRef.current;
        const lineA = consequenceHeadlineLineARef.current;
        const lineB = consequenceHeadlineLineBRef.current;
        const sub = consequenceSubRef.current;
        const btn = whatNowButtonRef.current;
        if (!mailStage || !backdrop || !copy || !lineA || !lineB || !sub || !btn) return;

        clearConsequenceAutoAdvance();
        consequenceEnterTimelineRef.current?.kill();

        const scheduleAutoAdvance = () => {
            if (manualMode) return;
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

        if (manualMode) {
            gsap.set(mailStage, mailStageEnd);
            gsap.set(backdrop, { opacity: 0.52 });
            gsap.set(copy, { scale: 1, z: 72, transformOrigin: "50% 55%", force3D: true });
            gsap.set([lineA, lineB, sub, btn], { opacity: 1, scale: 1 });
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

        const easeUnified = "sine.inOut";

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

        const pushDuration = 2.5;
        tl.to(mailStage, { ...mailStageEnd, duration: pushDuration, ease: easeUnified }, 0);
        tl.to(backdrop, { opacity: 0.52, duration: pushDuration * 0.92, ease: easeUnified }, 0);
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
        manualMode,
        prefersReducedMotion,
        resolvedPhase,
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

            if (resolvedPhase !== "ready" || event.deltaY <= 0) return;

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
    }, [hasReleased, isSceneActive, resolvedPhase, triggerNudge]);

    const handleReviewActivity = () => {
        if (manualMode) return;
        setPhase("consequence");
        elasticAnimRef.current?.cancel();
        elasticAnimRef.current = null;
        elasticGlowAnimRef.current?.cancel();
        elasticGlowAnimRef.current = null;
        setArrowVisible(false);
        setBreatheCta(false);
        onReviewActivity?.();
    };
    const resolvedTakeoverVisible = takeoverVisible;
    const resolvedShellVisible = shellVisible;
    const resolvedSelectedActive = selectedActive;
    const resolvedMetaVisible = metaVisible;
    const resolvedSubjectActive = subjectActive;
    const resolvedEventActive = eventActive;
    const resolvedDetailsVisible = detailsVisible;
    const resolvedActionActive = actionActive;
    const resolvedCtaVisible = ctaVisible;
    const resolvedArrowVisible = arrowVisible;
    const resolvedBreatheCta = breatheCta;

    return (
        <div
            className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-clip bg-[var(--background)]"
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
                        {/* Mobile: hint of a list above the reading pane */}
                        <div className="f3-divider mb-6 border-b pb-2 md:mb-0 md:hidden">
                            <F3GhostInboxMobileStrip
                                shellVisible={resolvedShellVisible}
                                selectedActive={resolvedSelectedActive}
                            />
                        </div>

                        <div className="mx-auto flex min-h-0 w-full max-w-[min(100%,72rem)] flex-1 flex-col md:flex-row md:items-stretch">
                        {/* Ghost inbox — narrow pane, recedes vs reading area (directions.md) */}
                        <aside
                            className="f3-shell-surface f3-divider relative z-0 hidden min-h-0 shrink-0 flex-col border-r md:flex md:w-[248px] md:min-w-[220px] md:max-w-[260px]"
                            data-shell-visible={resolvedShellVisible}
                            aria-hidden
                        >
                            <F3GhostInboxSidebar
                                shellVisible={resolvedShellVisible}
                                selectedActive={resolvedSelectedActive}
                            />
                        </aside>

                        {/* Reading pane: continuous with app chrome; message left-anchored like a real reader */}
                        <article
                            className="f3-shell-surface f3-divider relative z-[5] flex min-w-0 flex-1 flex-col overflow-visible border-l bg-[var(--background)] md:border-l-0"
                            data-shell-visible={resolvedShellVisible}
                            aria-label="Demonstration: simulated security alert email, as in a phishing attempt"
                        >
                            <div className="shrink-0 px-3 pt-0.5 pb-0 md:px-5 lg:px-6">
                                <MailReaderChrome />
                            </div>

                            <div className="relative min-h-0 min-w-0 flex-1 overflow-visible px-3 pb-8 pt-5 md:px-5 md:pt-6 md:pb-10 lg:px-6">
                                {/* em-based type/grid inside; size knob: --f3-message-scale on :root */}
                                <div className="f3-message-scale-root grid w-full max-w-[44rem] grid-cols-[2.5em_minmax(0,1fr)] gap-x-3 md:grid-cols-[2.75em_minmax(0,1fr)] md:gap-x-4">
                                    <TypedLine
                                        as="h2"
                                        text={SUBJECT_LINE}
                                        active={resolvedSubjectActive}
                                        duration={900}
                                        skipAnimation={prefersReducedMotion}
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
                                                Security Operations
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
                                            noreply@secure-yourorg.com
                                        </p>
                                    </div>

                                    <div className="col-start-2 row-start-3 mt-5 min-w-0 space-y-3 text-[1.02em] font-normal leading-[1.66] tracking-[-0.008em] text-white/[0.64] [text-wrap:pretty] md:mt-6 md:space-y-3.5 md:text-[1.06em] md:leading-[1.64]">
                                        <TypedLine
                                            text={EVENT_SENTENCE}
                                            active={resolvedEventActive}
                                            duration={EVENT_DURATION_MS}
                                            skipAnimation={prefersReducedMotion}
                                            className="f3-body-line"
                                        />
                                        <ul className="f3-detail-list list-disc space-y-1.5 pl-[1.15em] marker:text-white/35" data-visible={resolvedDetailsVisible}>
                                            <li>
                                                <TypedLine
                                                    as="span"
                                                    text="Location: Soroca, Moldavia"
                                                    active={resolvedDetailsVisible}
                                                    duration={DETAILS_DURATION_MS}
                                                    skipAnimation={prefersReducedMotion}
                                                    className="f3-detail-line"
                                                    reserveSpaceText="Location: Soroca, Moldavia"
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
                                                    text="Device: Windows 11 · Chrome"
                                                    active={resolvedDetailsVisible}
                                                    duration={DETAILS_DURATION_MS}
                                                    skipAnimation={prefersReducedMotion}
                                                    className="f3-detail-line"
                                                    reserveSpaceText="Device: Windows 11 · Chrome"
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
                                                    text="Time: Today, 9:14 AM"
                                                    active={resolvedDetailsVisible}
                                                    duration={DETAILS_DURATION_MS}
                                                    skipAnimation={prefersReducedMotion}
                                                    className="f3-detail-line"
                                                    reserveSpaceText="Time: Today, 9:14 AM"
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
                                            skipAnimation={prefersReducedMotion}
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
                                                Secure account
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
                            </div>
                        </article>
                    </div>
                </div>
                </div>
                </div>

                {resolvedPhase === "consequence" ? (
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
        </div>
    );
}
