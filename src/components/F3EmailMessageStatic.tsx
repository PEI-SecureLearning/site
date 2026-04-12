"use client";

import type { Ref } from "react";
import type { F3ForensicTargetKey } from "./F3ForensicOverlay";
import {
    F3_CTA_LABEL,
    F3_DETAIL_DEVICE,
    F3_DETAIL_LOCATION,
    F3_DETAIL_TIME,
    F3_EVENT_SENTENCE,
    F3_SENDER_DISPLAY,
    F3_SENDER_EMAIL,
    F3_SUBJECT_LINE,
} from "./f3PhishingCopy";

export type F3EmailMessageStaticForensicRefs = Readonly<{
    senderDomainRef?: Ref<HTMLSpanElement>;
    pressureRef?: Ref<HTMLElement>;
    ctaRef?: Ref<HTMLSpanElement>;
    visibleHighlightKeys?: readonly F3ForensicTargetKey[];
    animatedHighlightKey?: F3ForensicTargetKey;
    denseMobile?: boolean;
    mobileHighlightBadges?: readonly F3ForensicTargetKey[];
    tightMobileFit?: boolean;
}>;

const MOBILE_HIGHLIGHT_BADGE_LABELS: Record<F3ForensicTargetKey, string> = {
    "sender-domain": "01",
    pressure: "02",
    cta: "03",
};

function F3InlineMobileBadge({
    value,
    className,
}: Readonly<{
    value: string;
    className: string;
}>) {
    return (
        <span
            className={`pointer-events-none absolute inline-flex h-[1.02rem] w-[1.02rem] items-center justify-center rounded-full border text-[0.5rem] font-semibold tracking-[-0.01em] text-[var(--accent-secondary)]/84 ${className}`}
            style={{
                borderColor:
                    "color-mix(in srgb, var(--accent-secondary) 62%, rgba(255,255,255,0.18))",
                background: "rgba(17, 14, 24, 0.78)",
                boxShadow:
                    "0 0 12px -8px rgba(167,139,250,0.34), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            aria-hidden
        >
            {value}
        </span>
    );
}

function splitSenderEmail(email: string): { localWithAt: string; domain: string } {
    const i = email.indexOf("@");
    if (i < 0) return { localWithAt: email, domain: "" };
    return { localWithAt: email.slice(0, i + 1), domain: email.slice(i + 1) };
}

/**
 * Final-frame phishing email — same DOM structure/classes as State 1 when fully composed.
 * `data-f3-forensic-target` marks regions for `F3ForensicOverlay` only.
 */
export default function F3EmailMessageStatic({
    senderDomainRef,
    pressureRef,
    ctaRef,
    visibleHighlightKeys = ["sender-domain", "pressure", "cta"],
    animatedHighlightKey,
    denseMobile = false,
    mobileHighlightBadges = [],
    tightMobileFit = false,
}: F3EmailMessageStaticForensicRefs) {
    const { localWithAt, domain } = splitSenderEmail(F3_SENDER_EMAIL);
    const senderHighlightVisible = visibleHighlightKeys.includes("sender-domain");
    const pressureHighlightVisible = visibleHighlightKeys.includes("pressure");
    const ctaHighlightVisible = visibleHighlightKeys.includes("cta");
    const showSenderBadge = denseMobile && mobileHighlightBadges.includes("sender-domain");
    const showPressureBadge = denseMobile && mobileHighlightBadges.includes("pressure");
    const showCtaBadge = denseMobile && mobileHighlightBadges.includes("cta");

    return (
        <div
            className={`f3-message-scale-root grid w-full max-w-[44rem] ${
                denseMobile
                    ? "grid-cols-[2.25em_minmax(0,1fr)] gap-x-2.5 md:grid-cols-[2.75em_minmax(0,1fr)] md:gap-x-4"
                    : "grid-cols-[2.5em_minmax(0,1fr)] gap-x-3 md:grid-cols-[2.75em_minmax(0,1fr)] md:gap-x-4"
            }`}
            style={
                denseMobile
                    ? {
                          fontSize: `calc(${tightMobileFit ? "0.84rem" : "0.88rem"} * var(--f3-message-scale, 1))`,
                      }
                    : undefined
            }
        >
            <h2
                className={`f3-email-subject relative col-span-2 row-start-1 text-left leading-[1.06] md:mb-6 md:text-[1.67em] lg:text-[1.78em] ${
                    denseMobile
                        ? tightMobileFit
                            ? "mb-4 text-[1.27em]"
                            : "mb-5 text-[1.34em]"
                        : "mb-7 text-[1.52em]"
                }`}
            >
                {F3_SUBJECT_LINE}
            </h2>

            <div
                className="f3-meta-item col-start-1 row-start-2 flex items-center justify-center self-center"
                data-visible="true"
                aria-hidden
            >
                <div
                    className={`f3-avatar-placeholder flex shrink-0 items-center justify-center rounded-full font-medium tracking-tight text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] md:h-[2.75em] md:w-[2.75em] md:text-[0.7em] ${
                        denseMobile
                            ? tightMobileFit
                                ? "h-[2.05em] w-[2.05em] text-[0.61em]"
                                : "h-[2.2em] w-[2.2em] text-[0.64em]"
                            : "h-[2.5em] w-[2.5em] text-[0.68em]"
                    }`}
                >
                    SO
                </div>
            </div>

            <div className="f3-meta-item col-start-2 row-start-2 min-w-0 self-center" data-visible="true">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <p className="text-[0.93em] font-normal leading-none text-white/[0.72] md:text-[0.95em]">
                        {F3_SENDER_DISPLAY}
                    </p>
                    <span className="select-none text-[0.65em] text-white/18" aria-hidden>
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
                    className={`mt-1 max-w-full font-mono text-[0.64em] leading-none text-white/24 md:text-[0.65em] ${
                        denseMobile
                            ? "overflow-visible whitespace-nowrap pr-[1.3rem]"
                            : "truncate"
                    }`}
                    style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                >
                    {localWithAt}
                    {domain ? (
                        <span
                            ref={senderDomainRef}
                            data-f3-forensic-target="sender-domain"
                            data-reveal={
                                !senderHighlightVisible
                                    ? "hidden"
                                    : animatedHighlightKey === "sender-domain"
                                      ? "animating"
                                      : "visible"
                            }
                            className="f3-forensic-highlight f3-forensic-highlight--inline shrink-0"
                        >
                            {domain}
                            {showSenderBadge ? (
                                <F3InlineMobileBadge
                                    value={MOBILE_HIGHLIGHT_BADGE_LABELS["sender-domain"]}
                                    className="left-[calc(100%+0.16rem)] top-1/2 -translate-y-1/2"
                                />
                            ) : null}
                        </span>
                    ) : null}
                </p>
            </div>

            <div
                className={`col-start-2 row-start-3 min-w-0 font-normal tracking-[-0.008em] text-white/[0.64] [text-wrap:pretty] md:mt-6 md:space-y-3.5 md:text-[1.06em] md:leading-[1.64] ${
                    denseMobile
                        ? tightMobileFit
                            ? "mt-3.5 space-y-2 text-[0.94em] leading-[1.5]"
                            : "mt-4 space-y-2.5 text-[0.97em] leading-[1.58]"
                        : "mt-5 space-y-3 text-[1.02em] leading-[1.66]"
                }`}
            >
                <p className="f3-body-line">{F3_EVENT_SENTENCE}</p>
                <ul className="f3-detail-list list-disc space-y-1.5 pl-[1.15em] marker:text-white/35" data-visible="true">
                    <li>
                        <span className="f3-detail-line relative">
                            <strong className="font-semibold text-white/[0.8]">Location:</strong>{" "}
                            {F3_DETAIL_LOCATION.replace(/^Location:\s*/i, "")}
                        </span>
                    </li>
                    <li>
                        <span className="f3-detail-line relative">
                            <strong className="font-semibold text-white/[0.8]">Device:</strong>{" "}
                            {F3_DETAIL_DEVICE.replace(/^Device:\s*/i, "")}
                        </span>
                    </li>
                    <li>
                        <span className="f3-detail-line relative">
                            <strong className="font-semibold text-white/[0.8]">Time:</strong>{" "}
                            {F3_DETAIL_TIME.replace(/^Time:\s*/i, "")}
                        </span>
                    </li>
                </ul>
                <p className="f3-body-line">
                    If you don&apos;t recognize this activity, secure your
                    account{" "}
                    <strong
                        ref={pressureRef}
                        data-reveal={
                            !pressureHighlightVisible
                                ? "hidden"
                                : animatedHighlightKey === "pressure"
                                  ? "animating"
                                  : "visible"
                        }
                        className="f3-forensic-highlight f3-forensic-highlight--inline font-bold text-white/[0.88]"
                        data-f3-forensic-target="pressure"
                    >
                        now!
                        {showPressureBadge ? (
                            <F3InlineMobileBadge
                                value={MOBILE_HIGHLIGHT_BADGE_LABELS.pressure}
                                className="left-[calc(100%+0.16rem)] top-1/2 -translate-y-1/2"
                            />
                        ) : null}
                    </strong>
                </p>
            </div>

            <div
                className={`relative col-start-2 row-start-4 min-h-0 min-w-0 overflow-visible md:mt-6 ${
                    denseMobile ? (tightMobileFit ? "mt-3.5" : "mt-4") : "mt-5"
                }`}
            >
                <div
                    className="f3-cta-wrap"
                    data-visible="true"
                    style={{
                        fontSize: "calc(1rem / var(--f3-message-scale, 1))",
                    }}
                >
                    <span
                        ref={ctaRef}
                        data-reveal={
                            !ctaHighlightVisible
                                ? "hidden"
                                : animatedHighlightKey === "cta"
                                  ? "animating"
                                  : "visible"
                        }
                        className="f3-forensic-highlight--cta-ring pointer-events-none inline-flex rounded-[10px]"
                        data-f3-forensic-target="cta"
                    >
                        {showCtaBadge ? (
                            <F3InlineMobileBadge
                                value={MOBILE_HIGHLIGHT_BADGE_LABELS.cta}
                                className="left-[calc(100%+0.16rem)] top-1/2 -translate-y-1/2"
                            />
                        ) : null}
                        <button
                            type="button"
                            tabIndex={-1}
                            aria-hidden
                            className={`f3-email-cta f3-email-cta--inert inline-flex cursor-default items-center justify-center rounded-lg font-semibold leading-none tracking-[-0.01em] ${
                                denseMobile
                                    ? tightMobileFit
                                        ? "min-h-[36px] min-w-[10.7rem] px-5 py-1.9 text-[0.76rem] sm:min-h-[38px] sm:min-w-[11rem] sm:px-5.5 sm:py-2.1 sm:text-[0.8rem]"
                                        : "min-h-[38px] min-w-[11.1rem] px-5.5 py-2 text-[0.8rem] sm:min-h-[40px] sm:min-w-[11.4rem] sm:px-6 sm:py-2.25 sm:text-[0.84rem]"
                                    : "min-h-[42px] min-w-[12.5rem] px-7 py-2.5 text-[0.875rem] sm:min-h-[44px] sm:min-w-[13rem] sm:px-8 sm:py-3 sm:text-[0.9375rem]"
                            }`}
                        >
                            {F3_CTA_LABEL}
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
}
