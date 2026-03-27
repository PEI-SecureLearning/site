"use client";

/** Toolbar chrome for the F3 simulated mail reader — shared by State 1 and State 3 replica. */
export default function F3MailReaderChrome() {
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
                            strokeLinejoin="round"
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
