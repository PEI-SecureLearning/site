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
            {/* Full-bleed width, asymmetric inset: reads like a cropped desktop frame, not a centered card */}
            <div className="flex h-full min-h-[inherit] w-full flex-col pl-3 pr-1.5 pb-12 pt-12 sm:pl-4 sm:pr-2 sm:pb-12 sm:pt-14 md:pl-6 md:pr-3.5 md:pb-10 md:pt-[4.35rem] lg:pl-9 lg:pr-5 lg:pb-11 lg:pt-[4.75rem]">
                {/* Mobile: hint of a list above the reading pane */}
                <div className="f3-divider mb-6 border-b pb-2 md:mb-0 md:hidden">
                    <F3GhostInboxMobileStrip />
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col md:-ml-2 md:flex-row md:items-stretch lg:-ml-4">
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
                            <div className="grid w-full max-w-[44rem] grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 md:grid-cols-[2.75rem_minmax(0,1fr)]">
                                <h2 className="col-span-2 row-start-1 mb-4 text-left text-[1.44rem] font-bold leading-[1.07] tracking-[-0.032em] text-white/[0.94] md:mb-5 md:text-[1.58rem] lg:text-[1.68rem]">
                                    Unusual sign-in attempt detected
                                </h2>

                                <div
                                    className="col-start-1 row-start-2 flex items-center justify-center self-center"
                                    aria-hidden
                                >
                                    <div className="f3-avatar-placeholder flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold tracking-tight text-[color-mix(in_srgb,var(--foreground)_78%,transparent)] md:h-11 md:w-11 md:text-[0.7rem]">
                                        SO
                                    </div>
                                </div>

                                <div className="col-start-2 row-start-2 min-w-0 self-center">
                                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                                        <p className="text-[0.93rem] font-medium leading-none text-white/[0.88] md:text-[0.95rem]">
                                            Security Operations
                                        </p>
                                        <span
                                            className="select-none text-[0.65rem] text-white/18"
                                            aria-hidden
                                        >
                                            ·
                                        </span>
                                        <time
                                            className="text-[0.65rem] tabular-nums text-white/28"
                                            dateTime="2025-03-22T09:14"
                                        >
                                            9:14 AM
                                        </time>
                                    </div>
                                    <p
                                        className="mt-1 max-w-full truncate font-mono text-[0.64rem] leading-none text-white/24 md:text-[0.65rem]"
                                        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                                    >
                                        noreply@secure-yourorg.com
                                    </p>
                                </div>

                                <div className="col-start-2 row-start-3 mt-5 min-w-0 space-y-2.5 text-[1.02rem] font-normal leading-[1.66] tracking-[-0.008em] text-white/[0.72] [text-wrap:pretty] md:mt-6 md:space-y-2.5 md:text-[1.06rem] md:leading-[1.64]">
                                    <p>
                                        We detected a sign-in attempt from an unrecognized device in a
                                        new location.
                                    </p>
                                    <p>
                                        To keep your account protected, review this activity now.
                                    </p>
                                    <p>
                                        If this wasn&apos;t you, we recommend securing your account
                                        immediately.
                                    </p>
                                </div>

                                <div className="col-start-2 row-start-4 mt-5 md:mt-6">
                                    <button
                                        type="button"
                                        className="f3-email-cta inline-flex min-h-[34px] items-center justify-center rounded px-3.5 py-1.5 text-[0.78rem] font-medium leading-none tracking-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/18 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                                        onClick={() => onReviewActivity?.()}
                                    >
                                        Review activity
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
