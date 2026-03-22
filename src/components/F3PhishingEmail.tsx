"use client";

import { F3GhostInboxMobileStrip, F3GhostInboxSidebar } from "./F3GhostInbox";

export type F3PhishingEmailProps = Readonly<{
    /** Wired in phase 2 when the consequence beat exists. */
    onReviewActivity?: () => void;
}>;

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

export default function F3PhishingEmail({ onReviewActivity }: F3PhishingEmailProps) {
    return (
        <div
            className="relative w-full overflow-x-clip bg-[var(--background)]"
            style={{ minHeight: "min(91vh, 940px)" }}
        >
            {/* Symmetric horizontal inset; inner cluster centered so the reading pane isn’t one-sided on wide viewports */}
            <div className="flex h-full min-h-[inherit] w-full flex-col px-5 pb-12 pt-12 sm:px-6 sm:pb-12 sm:pt-14 md:px-10 md:pb-10 md:pt-[4.35rem] lg:px-14 lg:pb-11 lg:pt-[4.75rem] xl:px-16">
                {/* Mobile: hint of a list above the reading pane */}
                <div className="f3-divider mb-6 border-b pb-2 md:mb-0 md:hidden">
                    <F3GhostInboxMobileStrip />
                </div>

                <div className="mx-auto flex min-h-0 w-full max-w-[min(100%,72rem)] flex-1 flex-col md:flex-row md:items-stretch">
                    {/* Ghost inbox — narrow pane, recedes vs reading area (directions.md) */}
                    <aside
                        className="f3-divider relative hidden min-h-0 shrink-0 flex-col border-r md:flex md:w-[248px] md:min-w-[220px] md:max-w-[260px]"
                        aria-hidden
                    >
                        <F3GhostInboxSidebar />
                    </aside>

                    {/* Reading pane: continuous with app chrome; message left-anchored like a real reader */}
                    <article
                        className="f3-divider flex min-w-0 flex-1 flex-col border-l bg-[var(--background)] md:border-l-0"
                        aria-label="Demonstration: simulated security alert email, as in a phishing attempt"
                    >
                        <div className="shrink-0 px-3 pt-0.5 pb-0 md:px-5 lg:px-6">
                            <MailReaderChrome />
                        </div>

                        <div className="min-h-0 min-w-0 flex-1 px-3 pb-8 pt-5 md:px-5 md:pt-6 md:pb-10 lg:px-6">
                            {/* em-based type/grid inside; size knob: --f3-message-scale on :root */}
                            <div className="f3-message-scale-root grid w-full max-w-[44rem] grid-cols-[2.5em_minmax(0,1fr)] gap-x-3 md:grid-cols-[2.75em_minmax(0,1fr)] md:gap-x-4">
                                <h2 className="f3-email-subject col-span-2 row-start-1 mb-7 text-left text-[1.52em] leading-[1.06] md:mb-6 md:text-[1.67em] lg:text-[1.78em]">
                                    Unusual sign-in attempt detected
                                </h2>

                                <div
                                    className="col-start-1 row-start-2 flex items-center justify-center self-center"
                                    aria-hidden
                                >
                                    <div className="f3-avatar-placeholder flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-full text-[0.68em] font-medium tracking-tight text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] md:h-[2.75em] md:w-[2.75em] md:text-[0.7em]">
                                        SO
                                    </div>
                                </div>

                                <div className="col-start-2 row-start-2 min-w-0 self-center">
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
                                    <p>
                                        We detected a sign-in attempt from a new device on your
                                        account.
                                    </p>
                                    <ul className="list-disc space-y-1.5 pl-[1.15em] marker:text-white/35">
                                        <li>
                                            <strong className="font-semibold text-white/[0.8]">
                                                Location:
                                            </strong>{" "}
                                            Soroca, Moldavia
                                        </li>
                                        <li>
                                            <strong className="font-semibold text-white/[0.8]">
                                                Device:
                                            </strong>{" "}
                                            Windows 11 · Chrome
                                        </li>
                                        <li>
                                            <strong className="font-semibold text-white/[0.8]">
                                                Time:
                                            </strong>{" "}
                                            Today, 9:14 AM
                                        </li>
                                    </ul>
                                    <p>
                                        If you don&apos;t recognize this activity, secure your account{" "}
                                        <strong className="font-bold text-white/[0.88]">now</strong>!
                                    </p>
                                </div>

                                {/* Reset font size so CTA stays same px as before (rem-based) */}
                                <div
                                    className="col-start-2 row-start-4 mt-5 md:mt-6"
                                    style={{
                                        fontSize:
                                            "calc(1rem / var(--f3-message-scale, 1))",
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="f3-email-cta inline-flex min-h-[42px] min-w-[12.5rem] cursor-pointer items-center justify-center rounded-lg px-7 py-2.5 text-[0.875rem] font-semibold leading-none tracking-[-0.01em] sm:min-h-[44px] sm:min-w-[13rem] sm:px-8 sm:py-3 sm:text-[0.9375rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-secondary)_50%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                                        onClick={() => onReviewActivity?.()}
                                    >
                                        Secure account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
