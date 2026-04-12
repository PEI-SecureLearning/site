"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import F3EmailMessageStatic from "./F3EmailMessageStatic";
import {
    F3ForensicOverlay,
    type F3ForensicLayoutSet,
    type F3ForensicOverlayEditor,
    type F3ForensicTargetKey,
} from "./F3ForensicOverlay";
import {
    F3_FORENSIC_LABELS,
    F3_INTERVENTION_SLAB_REVIEW_LINE,
    F3_INTERVENTION_SLAB_SIMULATION_LINE,
    F3_REFRESHER_CTA,
    F3_REFRESHER_EYEBROW,
    F3_REFRESHER_META,
    F3_REFRESHER_TITLE,
} from "./f3PhishingCopy";

const MOBILE_CALLOUT_COMPLETE_MS = 2200;

const MOBILE_FORENSIC_STEP_NUMBERS: Record<F3ForensicTargetKey, string> = {
    "sender-domain": "01",
    pressure: "02",
    cta: "03",
};

const MOBILE_FORENSIC_ORDER: readonly F3ForensicTargetKey[] = [
    "sender-domain",
    "pressure",
    "cta",
] as const;

const MOBILE_NOTE_REVEAL_DELAY_MS = 460;

function F3MobileForensicNote({
    label,
    active,
    compact = false,
    tight = false,
}: Readonly<{
    label: string;
    active: boolean;
    compact?: boolean;
    tight?: boolean;
}>) {
    const id = useId().replace(/:/g, "");
    const gradientId = `f3-mobile-forensic-gradient-${id}`;
    const glowId = `f3-mobile-forensic-glow-${id}`;

    return (
        <div className="relative min-w-0 flex-1">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
                aria-hidden
            >
                <defs>
                    <filter id={glowId} x="-30%" y="-40%" width="160%" height="180%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feColorMatrix
                            in="blur"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.28 0"
                        />
                    </filter>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="52%" stopColor="#9b6bff" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <g className="f3-forensic-note-shell" data-reveal="visible">
                    <rect
                        className="f3-forensic-note-glow"
                        x="0"
                        y="0"
                        width="1000"
                        height="100"
                        rx="22"
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="2.2"
                        opacity={active ? 0.16 : 0.12}
                        filter={`url(#${glowId})`}
                        pathLength="1"
                    />
                    <rect
                        className="f3-forensic-note-frame"
                        x="0"
                        y="0"
                        width="1000"
                        height="100"
                        rx="22"
                        fill="rgba(17, 14, 24, 0.22)"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="1.45"
                        pathLength="1"
                    />
                    <rect
                        className="f3-forensic-note-inner"
                        x="1"
                        y="1"
                        width="998"
                        height="98"
                        rx="21"
                        fill="none"
                        stroke="rgba(255,255,255,0.045)"
                        strokeWidth="0.8"
                        pathLength="1"
                    />
                </g>
            </svg>
            <div
                className={`relative flex items-center px-[0.52rem] ${
                    compact
                        ? tight
                            ? "min-h-[1.5rem] py-[0.1rem]"
                            : "min-h-[1.64rem] py-[0.14rem]"
                        : tight
                          ? "min-h-[1.86rem] py-[0.16rem]"
                          : "min-h-[2.02rem] py-[0.22rem]"
                }`}
            >
                <p
                    className={`font-medium leading-[1.05] tracking-[-0.01em] text-white/70 ${
                        tight ? "text-[0.72rem]" : "text-[0.76rem]"
                    }`}
                >
                    {label}
                </p>
            </div>
        </div>
    );
}

function F3MobileForensicIndex({
    value,
}: Readonly<{
    value: string;
}>) {
    const id = useId().replace(/:/g, "");
    const gradientId = `f3-mobile-forensic-index-gradient-${id}`;
    const glowId = `f3-mobile-forensic-index-glow-${id}`;

    return (
        <div className="relative h-[1.06rem] w-[1.06rem] shrink-0">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
            >
                <defs>
                    <filter id={glowId} x="-30%" y="-40%" width="160%" height="180%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feColorMatrix
                            in="blur"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.28 0"
                        />
                    </filter>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="52%" stopColor="#9b6bff" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <g className="f3-forensic-note-shell" data-reveal="visible">
                    <rect
                        className="f3-forensic-note-glow"
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        rx="50"
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="2.2"
                        opacity="0.12"
                        filter={`url(#${glowId})`}
                        pathLength="1"
                    />
                    <rect
                        className="f3-forensic-note-frame"
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        rx="50"
                        fill="rgba(17, 14, 24, 0.22)"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="1.45"
                        pathLength="1"
                    />
                    <rect
                        className="f3-forensic-note-inner"
                        x="1"
                        y="1"
                        width="98"
                        height="98"
                        rx="49"
                        fill="none"
                        stroke="rgba(255,255,255,0.045)"
                        strokeWidth="0.8"
                        pathLength="1"
                    />
                </g>
            </svg>
            <div className="relative flex h-full w-full items-center justify-center">
                <span className="font-mono text-[0.52rem] font-semibold tracking-[-0.01em] text-[var(--accent-secondary)]/84">
                    {value}
                </span>
            </div>
        </div>
    );
}

/**
 * Same reading column as State 1, now with the slim intervention rail anchored in the top-left gutter.
 * The email remains the dominant object; the rail should frame the state, not compete with it.
 */
export default function F3RemediationReaderPanel({
    annotationsActive = true,
    visibleAnnotationKeys = ["sender-domain", "pressure", "cta"],
    animatedAnnotationKey,
    onAnimatedAnnotationComplete,
    forensicLayouts,
    forensicEditor,
    phase = "remediation",
    guidedMobile = false,
}: Readonly<{
    annotationsActive?: boolean;
    visibleAnnotationKeys?: readonly F3ForensicTargetKey[];
    animatedAnnotationKey?: F3ForensicTargetKey;
    onAnimatedAnnotationComplete?: (key: F3ForensicTargetKey) => void;
    forensicLayouts?: F3ForensicLayoutSet;
    forensicEditor?: F3ForensicOverlayEditor;
    phase?:
        | "remediationTransforming"
        | "remediationTransformed"
        | "remediation"
        | "remediationSettled"
        | "sequenceComplete";
    guidedMobile?: boolean;
}>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const forensicStageRef = useRef<HTMLDivElement>(null);
    const mobileBottomSlotRef = useRef<HTMLDivElement>(null);
    const mobileBottomContentRef = useRef<HTMLDivElement>(null);
    const senderDomainRef = useRef<HTMLSpanElement>(null);
    const pressureRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLSpanElement>(null);
    const [tightMobileFit, setTightMobileFit] = useState(false);
    const [mobileBottomScale, setMobileBottomScale] = useState(1);
    const [mobileVisibleNoteKeys, setMobileVisibleNoteKeys] = useState<
        readonly F3ForensicTargetKey[]
    >([]);
    const activeMobileKey = useMemo(() => {
        if (!guidedMobile || phase !== "remediation") return undefined;
        return (
            animatedAnnotationKey ??
            visibleAnnotationKeys[visibleAnnotationKeys.length - 1]
        );
    }, [animatedAnnotationKey, guidedMobile, phase, visibleAnnotationKeys]);
    const showMobileTrainingCard =
        guidedMobile &&
        (phase === "remediationSettled" || phase === "sequenceComplete");
    const stackedMobileKeys = useMemo(
        () =>
            MOBILE_FORENSIC_ORDER.filter((key) =>
                visibleAnnotationKeys.includes(key)
            ),
        [visibleAnnotationKeys]
    );
    const visibleMobileNoteStack = useMemo(
        () =>
            MOBILE_FORENSIC_ORDER.filter((key) =>
                mobileVisibleNoteKeys.includes(key)
            ),
        [mobileVisibleNoteKeys]
    );
    const resolvedHighlightKeys = guidedMobile
        ? stackedMobileKeys
        : visibleAnnotationKeys;

    useEffect(() => {
        if (!guidedMobile) {
            setMobileVisibleNoteKeys([]);
            return;
        }

        if (stackedMobileKeys.length === 0) {
            setMobileVisibleNoteKeys([]);
            return;
        }

        setMobileVisibleNoteKeys((current) => {
            const nextOrdered = MOBILE_FORENSIC_ORDER.filter((key) =>
                stackedMobileKeys.includes(key)
            );
            const currentOrdered = MOBILE_FORENSIC_ORDER.filter((key) =>
                current.includes(key)
            );

            const isReset =
                currentOrdered.length > nextOrdered.length ||
                currentOrdered.some((key) => !nextOrdered.includes(key));

            if (isReset) {
                return nextOrdered;
            }

            return current;
        });
    }, [guidedMobile, stackedMobileKeys]);

    useEffect(() => {
        if (!guidedMobile) return;

        const nextKey = stackedMobileKeys.find(
            (key) => !mobileVisibleNoteKeys.includes(key)
        );

        if (nextKey == null) return;

        const timeoutId = globalThis.window.setTimeout(() => {
            setMobileVisibleNoteKeys((current) => {
                if (current.includes(nextKey)) return current;
                return MOBILE_FORENSIC_ORDER.filter(
                    (key) => key === nextKey || current.includes(key)
                );
            });
        }, MOBILE_NOTE_REVEAL_DELAY_MS);

        return () => globalThis.window.clearTimeout(timeoutId);
    }, [guidedMobile, mobileVisibleNoteKeys, stackedMobileKeys]);

    useEffect(() => {
        if (!guidedMobile || phase !== "remediation") return;
        if (animatedAnnotationKey == null) return;
        if (onAnimatedAnnotationComplete == null) return;

        const timeoutId = globalThis.window.setTimeout(() => {
            onAnimatedAnnotationComplete(animatedAnnotationKey);
        }, MOBILE_CALLOUT_COMPLETE_MS);

        return () => globalThis.window.clearTimeout(timeoutId);
    }, [animatedAnnotationKey, guidedMobile, onAnimatedAnnotationComplete, phase]);

    useEffect(() => {
        if (!guidedMobile) {
            setTightMobileFit(false);
            return;
        }

        const root = rootRef.current;
        const stage = forensicStageRef.current;
        const parent = root?.parentElement;
        if (!root || !stage || !parent) return;

        let frameId = 0;
        const measure = () => {
            frameId = 0;

            const parentRect = parent.getBoundingClientRect();
            const rootRect = root.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            const stageBottom = stageRect.bottom - rootRect.top;
            const remainingHeight = Math.max(0, parentRect.height - stageBottom);

            setTightMobileFit(remainingHeight < 245);
        };

        const scheduleMeasure = () => {
            if (frameId !== 0) return;
            frameId = globalThis.window.requestAnimationFrame(measure);
        };

        scheduleMeasure();

        const resizeObserver = new ResizeObserver(scheduleMeasure);
        resizeObserver.observe(parent);
        resizeObserver.observe(stage);

        const visualViewport = globalThis.window.visualViewport;
        visualViewport?.addEventListener("resize", scheduleMeasure);
        globalThis.window.addEventListener("resize", scheduleMeasure);

        return () => {
            if (frameId !== 0) {
                globalThis.window.cancelAnimationFrame(frameId);
            }
            resizeObserver.disconnect();
            visualViewport?.removeEventListener("resize", scheduleMeasure);
            globalThis.window.removeEventListener("resize", scheduleMeasure);
        };
    }, [guidedMobile, phase, mobileVisibleNoteKeys, showMobileTrainingCard]);

    useEffect(() => {
        if (!guidedMobile) {
            setMobileBottomScale(1);
            return;
        }

        const slot = mobileBottomSlotRef.current;
        const content = mobileBottomContentRef.current;
        if (!slot || !content) return;

        let frameId = 0;
        const measure = () => {
            frameId = 0;

            const slotHeight = slot.getBoundingClientRect().height;
            const contentHeight = content.scrollHeight;

            if (slotHeight <= 0 || contentHeight <= 0) {
                setMobileBottomScale(1);
                return;
            }

            const scale = contentHeight > slotHeight
                ? Math.max(0.82, slotHeight / contentHeight)
                : 1;

            setMobileBottomScale((current) => (Math.abs(current - scale) < 0.01 ? current : scale));
        };

        const scheduleMeasure = () => {
            if (frameId !== 0) return;
            frameId = globalThis.window.requestAnimationFrame(measure);
        };

        scheduleMeasure();

        const resizeObserver = new ResizeObserver(scheduleMeasure);
        resizeObserver.observe(slot);
        resizeObserver.observe(content);

        const visualViewport = globalThis.window.visualViewport;
        visualViewport?.addEventListener("resize", scheduleMeasure);
        globalThis.window.addEventListener("resize", scheduleMeasure);

        return () => {
            if (frameId !== 0) {
                globalThis.window.cancelAnimationFrame(frameId);
            }
            resizeObserver.disconnect();
            visualViewport?.removeEventListener("resize", scheduleMeasure);
            globalThis.window.removeEventListener("resize", scheduleMeasure);
        };
    }, [guidedMobile, showMobileTrainingCard, tightMobileFit, visibleMobileNoteStack]);

    return (
        <>
            <p className="sr-only" aria-live="polite">
                Simulation complete. Review the highlighted areas in the email body.
            </p>
            <div
                ref={rootRef}
                className={`relative min-w-0 w-full overflow-visible ${
                    guidedMobile ? "flex h-full min-h-0 flex-col" : "h-full min-h-full"
                }`}
                style={
                    guidedMobile
                        ? {
                              WebkitTextSizeAdjust: "none",
                              textSizeAdjust: "none",
                          }
                        : undefined
                }
            >
                <div className="pointer-events-none absolute left-0 top-[-3.75rem] z-[2] flex max-w-[20rem] items-start gap-2.5 md:top-[-3.5rem] md:max-w-[30.5rem] md:gap-3.25">
                    <Image
                        src="/assets/branding/logo-icon.png"
                        alt=""
                        width={55}
                        height={55}
                        className="-mt-2.95 h-[2.55rem] w-[2.55rem] shrink-0 object-contain opacity-[0.85] md:-mt-3.25 md:h-[3.65rem] md:w-[3.65rem]"
                        aria-hidden
                    />
                    <div className="pt-0 md:pt-0.5">
                        <p className="text-[0.7rem] font-semibold leading-none tracking-[-0.011em] text-white/[0.63] md:text-[0.82rem]">
                            {F3_INTERVENTION_SLAB_SIMULATION_LINE}
                        </p>
                        <p className="mt-1 max-w-[16rem] text-[0.62rem] leading-[1.4] tracking-[-0.005em] text-white/[0.41] md:mt-1.5 md:max-w-[24.5rem] md:text-[0.73rem] md:leading-[1.48]">
                            {F3_INTERVENTION_SLAB_REVIEW_LINE}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="group absolute bottom-[-6.1rem] right-[-0.85rem] z-[3] hidden w-[min(15.8rem,41vw)] min-w-[13.5rem] max-w-[16.4rem] flex-col rounded-[20px] border border-white/[0.08] px-4 py-4 text-left transition duration-300 hover:-translate-y-[1px] hover:border-white/[0.14] hover:bg-white/[0.04] md:flex md:bottom-[-6.6rem] md:right-[-1rem] md:px-4.5 md:py-4.5"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(25,22,31,0.88) 0%, rgba(14,12,18,0.94) 100%)",
                        boxShadow:
                            "0 20px 40px -24px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.045)",
                    }}
                    aria-label={`${F3_REFRESHER_CTA}: ${F3_REFRESHER_TITLE}`}
                >
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                        {F3_REFRESHER_EYEBROW}
                    </span>
                    <span className="mt-2 text-[0.94rem] font-semibold leading-[1.16] tracking-[-0.02em] text-white/[0.84]">
                        {F3_REFRESHER_TITLE}
                    </span>
                    <span className="mt-2 text-[0.7rem] font-medium leading-none tracking-[0.01em] text-white/[0.42]">
                        {F3_REFRESHER_META}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.76rem] font-semibold tracking-[-0.01em] text-white/[0.72] transition group-hover:text-white/[0.92]">
                        {F3_REFRESHER_CTA}
                        <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" strokeWidth={1.9} />
                    </span>
                </button>
                <div
                    ref={forensicStageRef}
                    className={`relative min-w-0 w-full overflow-visible md:translate-y-[1.4rem] ${
                        guidedMobile
                            ? tightMobileFit
                                ? "translate-y-[0.42rem]"
                                : "translate-y-[0.55rem]"
                            : "translate-y-[1.2rem]"
                    }`}
                >
                    <div className="relative min-w-0 w-full max-w-[44rem] overflow-visible">
                        <F3EmailMessageStatic
                            senderDomainRef={senderDomainRef}
                            pressureRef={pressureRef}
                            ctaRef={ctaRef}
                            visibleHighlightKeys={resolvedHighlightKeys}
                            animatedHighlightKey={animatedAnnotationKey}
                            denseMobile={guidedMobile}
                            mobileHighlightBadges={resolvedHighlightKeys}
                            tightMobileFit={tightMobileFit}
                        />
                    </div>
                    {annotationsActive && !guidedMobile ? (
                        <F3ForensicOverlay
                            overlayRootRef={forensicStageRef}
                            targetRefs={{ senderDomainRef, pressureRef, ctaRef }}
                            active
                            visibleKeys={visibleAnnotationKeys}
                            animatedKey={animatedAnnotationKey}
                            onAnimatedKeyComplete={onAnimatedAnnotationComplete}
                            layouts={forensicLayouts}
                            editor={forensicEditor}
                        />
                    ) : null}
                </div>
                {guidedMobile ? (
                    <div
                        ref={mobileBottomSlotRef}
                        className="pointer-events-none z-[70] flex min-h-0 flex-1 flex-col md:hidden"
                    >
                        <div
                            ref={mobileBottomContentRef}
                            className="flex h-full flex-col"
                            style={{
                                paddingTop: tightMobileFit ? "0.35rem" : "0.65rem",
                                paddingBottom: tightMobileFit ? "0.15rem" : "0.3rem",
                                transform:
                                    mobileBottomScale < 0.999
                                        ? `scale(${mobileBottomScale})`
                                        : undefined,
                                transformOrigin: "top center",
                                width:
                                    mobileBottomScale < 0.999
                                        ? `${100 / mobileBottomScale}%`
                                        : undefined,
                                height:
                                    mobileBottomScale < 0.999
                                        ? `${100 / mobileBottomScale}%`
                                        : undefined,
                            }}
                        >
                            <div className={`min-h-0 ${tightMobileFit ? "flex-[2]" : "flex-[3]"}`} />
                            <div className={`flex flex-col ${tightMobileFit ? "gap-[0.28rem]" : "flex-[1.5] gap-[0.42rem] justify-between"}`}>
                                {MOBILE_FORENSIC_ORDER.map((key) => {
                                    const isVisible = visibleMobileNoteStack.includes(key);
                                    const label =
                                        F3_FORENSIC_LABELS[
                                            key === "sender-domain"
                                                ? 0
                                                : key === "pressure"
                                                  ? 1
                                                  : 2
                                        ];
                                    const isActive = key === activeMobileKey && !showMobileTrainingCard;

                                    return (
                                        <div
                                            key={key}
                                            className={`flex items-center gap-[0.24rem] ${isVisible ? "f3-mobile-forensic-row-enter" : ""}`}
                                            style={isVisible ? undefined : { visibility: "hidden" }}
                                        >
                                            <div
                                                className="flex w-full items-center gap-[0.24rem]"
                                            >
                                                <F3MobileForensicIndex
                                                    value={MOBILE_FORENSIC_STEP_NUMBERS[key]}
                                                />
                                                <F3MobileForensicNote
                                                    label={label}
                                                    active={isActive}
                                                    compact={key === "pressure"}
                                                    tight={tightMobileFit}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className={`min-h-0 ${tightMobileFit ? "flex-[1.5]" : "flex-[2]"}`} />
                            <div
                                className="flex"
                                style={showMobileTrainingCard ? undefined : { visibility: "hidden" }}
                            >
                                <button
                                    type="button"
                                    className={`group ${showMobileTrainingCard ? "f3-mobile-forensic-row-enter" : ""} pointer-events-auto flex w-full flex-col rounded-[17px] border border-white/[0.07] text-left active:scale-[0.995] ${
                                            tightMobileFit
                                                ? "min-h-[5rem] px-3 py-2.35"
                                                : "min-h-[5.4rem] px-3 py-2.75"
                                        }`}
                                        style={{
                                            background:
                                                "linear-gradient(180deg, rgba(22,19,29,0.78) 0%, rgba(11,10,17,0.9) 100%)",
                                            boxShadow:
                                                "0 14px 28px -28px rgba(0,0,0,0.56), inset 0 1px 0 rgba(255,255,255,0.045)",
                                        }}
                                        aria-label={`${F3_REFRESHER_CTA}: ${F3_REFRESHER_TITLE}`}
                                    >
                                        <div className="flex items-center justify-between gap-2.5">
                                            <span
                                                className={`font-semibold uppercase tracking-[0.16em] text-white/[0.38] ${
                                                    tightMobileFit ? "text-[0.47rem]" : "text-[0.5rem]"
                                                }`}
                                            >
                                                {F3_REFRESHER_EYEBROW}
                                            </span>
                                            <span
                                                className={`font-medium leading-none tracking-[0.01em] text-white/[0.38] ${
                                                    tightMobileFit ? "text-[0.55rem]" : "text-[0.58rem]"
                                                }`}
                                            >
                                                {F3_REFRESHER_META}
                                            </span>
                                        </div>
                                        <div
                                            className={`flex min-h-0 flex-1 flex-col justify-between ${
                                                tightMobileFit ? "mt-[0.58rem]" : "mt-[0.72rem]"
                                            }`}
                                        >
                                            <span
                                                className={`font-semibold leading-[1.08] tracking-[-0.022em] text-white/[0.86] ${
                                                    tightMobileFit ? "text-[0.84rem]" : "text-[0.88rem]"
                                                }`}
                                            >
                                                {F3_REFRESHER_TITLE}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1.75 font-semibold tracking-[-0.01em] text-white/[0.7] transition group-active:text-white ${
                                                    tightMobileFit
                                                        ? "mt-[0.7rem] text-[0.68rem]"
                                                        : "mt-[0.9rem] text-[0.71rem]"
                                                }`}
                                            >
                                                {F3_REFRESHER_CTA}
                                                <ArrowUpRight className="h-[0.72rem] w-[0.72rem]" strokeWidth={1.9} />
                                            </span>
                                        </div>
                                    </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
}
