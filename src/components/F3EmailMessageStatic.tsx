"use client";

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

function splitSenderEmail(email: string): { localWithAt: string; domain: string } {
    const i = email.indexOf("@");
    if (i < 0) return { localWithAt: email, domain: "" };
    return { localWithAt: email.slice(0, i + 1), domain: email.slice(i + 1) };
}

/**
 * Final-frame phishing email — same DOM structure/classes as State 1 when fully composed.
 * `data-f3-forensic-target` marks regions for `F3ForensicOverlay` only.
 */
export default function F3EmailMessageStatic() {
    const { localWithAt, domain } = splitSenderEmail(F3_SENDER_EMAIL);

    return (
        <div className="f3-message-scale-root grid w-full max-w-[44rem] grid-cols-[2.5em_minmax(0,1fr)] gap-x-3 md:grid-cols-[2.75em_minmax(0,1fr)] md:gap-x-4">
            <h2 className="f3-email-subject relative col-span-2 row-start-1 mb-7 text-left text-[1.52em] leading-[1.06] md:mb-6 md:text-[1.67em] lg:text-[1.78em]">
                {F3_SUBJECT_LINE}
            </h2>

            <div
                className="f3-meta-item col-start-1 row-start-2 flex items-center justify-center self-center"
                data-visible="true"
                aria-hidden
            >
                <div className="f3-avatar-placeholder flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-full text-[0.68em] font-medium tracking-tight text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] md:h-[2.75em] md:w-[2.75em] md:text-[0.7em]">
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
                    className="mt-1 max-w-full truncate font-mono text-[0.64em] leading-none text-white/24 md:text-[0.65em]"
                    style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                >
                    {localWithAt}
                    {domain ? (
                        <span
                            data-f3-forensic-target="sender-domain"
                            className="f3-forensic-highlight f3-forensic-highlight--inline shrink-0"
                        >
                            {domain}
                        </span>
                    ) : null}
                </p>
            </div>

            <div className="col-start-2 row-start-3 mt-5 min-w-0 space-y-3 text-[1.02em] font-normal leading-[1.66] tracking-[-0.008em] text-white/[0.64] [text-wrap:pretty] md:mt-6 md:space-y-3.5 md:text-[1.06em] md:leading-[1.64]">
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
                        className="f3-forensic-highlight f3-forensic-highlight--inline font-bold text-white/[0.88]"
                        data-f3-forensic-target="pressure"
                    >
                        now!
                    </strong>
                </p>
            </div>

            <div className="relative col-start-2 row-start-4 mt-5 min-h-0 min-w-0 overflow-visible md:mt-6">
                <div
                    className="f3-cta-wrap"
                    data-visible="true"
                    style={{
                        fontSize: "calc(1rem / var(--f3-message-scale, 1))",
                    }}
                >
                    <span
                        className="f3-forensic-highlight--cta-ring pointer-events-none inline-flex rounded-[10px]"
                        data-f3-forensic-target="cta"
                    >
                        <button
                            type="button"
                            tabIndex={-1}
                            aria-hidden
                            className="f3-email-cta f3-email-cta--inert inline-flex min-h-[42px] min-w-[12.5rem] cursor-default items-center justify-center rounded-lg px-7 py-2.5 text-[0.875rem] font-semibold leading-none tracking-[-0.01em] sm:min-h-[44px] sm:min-w-[13rem] sm:px-8 sm:py-3 sm:text-[0.9375rem]"
                        >
                            {F3_CTA_LABEL}
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
}
