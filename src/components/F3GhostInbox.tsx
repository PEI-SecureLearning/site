"use client";

/**
 * Ghost inbox — muted context only; must not compete with the reading pane.
 */

type Row = Readonly<{
    sender: string;
    subject: string;
    time: string;
    preview: string;
    initials: string;
    selected?: boolean;
}>;

const SIDEBAR_ROWS: Row[] = [
    {
        sender: "People Ops",
        subject: "Q4 enrollment window closes Friday",
        time: "Mon",
        preview: "Please confirm your benefit elections before…",
        initials: "PO",
    },
    {
        sender: "Finance",
        subject: "Invoice #4482 — payment received",
        time: "10:14",
        preview: "Thank you — we’ve applied your wire to acco…",
        initials: "FN",
    },
    {
        sender: "Security Operations",
        subject: "Unusual sign-in attempt detected",
        time: "9:14",
        preview: "We detected a sign-in from an unrecognized d…",
        initials: "SO",
        selected: true,
    },
    {
        sender: "IT Support",
        subject: "Ticket UPD-9921 — status update",
        time: "Tue",
        preview: "Your request has been assigned to the networ…",
        initials: "IT",
    },
    {
        sender: "HR",
        subject: "Annual policy acknowledgment",
        time: "—",
        preview: "Action required: review and acknowledge the u…",
        initials: "HR",
    },
];

/** Muted avatar surfaces — grayscale only, slight variation between rows */
const AVATAR_BG: readonly string[] = [
    "color-mix(in srgb, var(--foreground) 5.2%, transparent)",
    "color-mix(in srgb, var(--foreground) 4.4%, transparent)",
    "color-mix(in srgb, var(--foreground) 5.8%, transparent)",
    "color-mix(in srgb, var(--foreground) 4.9%, transparent)",
    "color-mix(in srgb, var(--foreground) 5.5%, transparent)",
];

const ghostPreviewMask = {
    maskImage:
        "linear-gradient(90deg, black 0%, black 22%, rgba(0,0,0,0.25) 55%, transparent 88%)",
    WebkitMaskImage:
        "linear-gradient(90deg, black 0%, black 22%, rgba(0,0,0,0.25) 55%, transparent 88%)",
} as const;

function InboxRowAvatar({
    initials,
    bgStyle,
    selected,
    ghost,
}: Readonly<{
    initials: string;
    bgStyle: string;
    selected: boolean;
    ghost: boolean;
}>) {
    let tone = "text-white/[0.4] ring-white/[0.06]";
    if (selected) {
        tone = "text-white/[0.52] ring-white/[0.1]";
    } else if (ghost) {
        tone = "text-white/[0.22] ring-white/[0.04]";
    }
    return (
        <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-semibold tracking-tight ring-1 ring-inset ${tone}`}
            style={{ backgroundColor: bgStyle, fontFamily: "var(--font-geist-mono), monospace" }}
            aria-hidden
        >
            {initials}
        </div>
    );
}

function GhostRowSidebar({ row, index }: Readonly<{ row: Row; index: number }>) {
    const { sender, subject, time, preview, initials, selected } = row;
    const bgStyle = AVATAR_BG[index % AVATAR_BG.length] ?? AVATAR_BG[0];

    if (selected) {
        return (
            <div className="relative min-h-[4.25rem] border-b border-white/[0.045] bg-white/[0.022] py-3 pl-2 pr-2">
                <div
                    className="absolute bottom-0 left-0 top-0 w-px bg-white/[0.2]"
                    aria-hidden
                />
                <div className="flex gap-2.5 pl-2">
                    <InboxRowAvatar
                        initials={initials}
                        bgStyle={bgStyle}
                        selected
                        ghost={false}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <p className="min-w-0 truncate text-[0.7rem] font-medium leading-tight text-white/[0.66]">
                                {sender}
                            </p>
                            <span
                                className="shrink-0 font-mono text-[0.56rem] tabular-nums leading-none text-white/[0.3]"
                                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                            >
                                {time}
                            </span>
                        </div>
                        <p className="mt-1 truncate text-[0.64rem] leading-snug text-white/[0.44]">
                            {subject}
                        </p>
                        <p className="mt-1 truncate text-[0.58rem] leading-snug text-white/[0.28]">
                            {preview}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[4.25rem] border-b border-white/[0.034] py-3 pl-2 pr-2">
            <div className="flex gap-2.5">
                <InboxRowAvatar initials={initials} bgStyle={bgStyle} selected={false} ghost />
                <div className="min-w-0 flex-1" style={ghostPreviewMask}>
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="min-w-0 truncate text-[0.68rem] font-medium leading-tight text-white/[0.26]">
                            {sender}
                        </p>
                        <span
                            className="shrink-0 font-mono text-[0.52rem] tabular-nums leading-none text-white/[0.18]"
                            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                        >
                            {time}
                        </span>
                    </div>
                    <p className="mt-1 truncate text-[0.6rem] leading-snug text-white/[0.2]">
                        {subject}
                    </p>
                    <p className="mt-1 truncate text-[0.54rem] leading-snug text-white/[0.14]">
                        {preview}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function F3GhostInboxSidebar() {
    return (
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden" aria-hidden>
            <div
                className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[color-mix(in_srgb,var(--surface-subtle)_94%,var(--background))]"
                style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.018)" }}
            >
                {SIDEBAR_ROWS.map((row, index) => (
                    <GhostRowSidebar
                        key={`${row.sender}-${row.time}-${row.subject}`}
                        row={row}
                        index={index}
                    />
                ))}
            </div>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[var(--background)] via-[color-mix(in_srgb,var(--background)_55%,transparent)] to-transparent"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-[var(--background)] via-[color-mix(in_srgb,var(--background)_50%,transparent)] to-transparent"
                aria-hidden
            />
        </div>
    );
}

const MOBILE_STRIP: Row[] = [
    {
        sender: "People Ops",
        subject: "Benefits enrollment",
        time: "Mon",
        preview: "Confirm elections…",
        initials: "PO",
    },
    {
        sender: "Finance",
        subject: "Invoice #4482",
        time: "10:14",
        preview: "Payment applied…",
        initials: "FN",
    },
    {
        sender: "Security Ops",
        subject: "Sign-in attempt",
        time: "9:14",
        preview: "Unrecognized device…",
        initials: "SO",
        selected: true,
    },
    {
        sender: "IT Support",
        subject: "Ticket update",
        time: "—",
        preview: "Assigned to team…",
        initials: "IT",
    },
];

export function F3GhostInboxMobileStrip() {
    return (
        <div
            className="flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-hidden
        >
            {MOBILE_STRIP.map((row, index) => {
                const bgStyle = AVATAR_BG[index % AVATAR_BG.length] ?? AVATAR_BG[0];
                if (row.selected) {
                    return (
                        <div
                            key={`m-${row.sender}-${row.time}`}
                            className="relative flex min-h-[3.5rem] w-[118px] shrink-0 flex-col justify-center border-b border-white/[0.05] bg-white/[0.022] py-2 pl-2.5 pr-2"
                        >
                            <div
                                className="absolute bottom-1 left-0 top-1 w-px bg-white/[0.2]"
                                aria-hidden
                            />
                            <div className="flex items-start gap-2">
                                <InboxRowAvatar
                                    initials={row.initials}
                                    bgStyle={bgStyle}
                                    selected
                                    ghost={false}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[0.58rem] font-medium leading-tight text-white/[0.62]">
                                        {row.sender}
                                    </p>
                                    <p className="mt-0.5 truncate text-[0.52rem] leading-snug text-white/[0.38]">
                                        {row.subject}
                                    </p>
                                    <p className="mt-0.5 truncate text-[0.48rem] leading-snug text-white/[0.26]">
                                        {row.preview}
                                    </p>
                                    <p
                                        className="mt-0.5 font-mono text-[0.46rem] text-white/[0.28]"
                                        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                                    >
                                        {row.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }
                return (
                    <div
                        key={`m-${row.sender}-${row.subject}`}
                        className="flex min-h-[3.5rem] w-[88px] shrink-0 flex-col justify-center border border-white/[0.03] bg-[color-mix(in_srgb,var(--surface-subtle)_88%,var(--background))] px-2 py-2"
                        style={{
                            maskImage:
                                "linear-gradient(90deg, black 0%, black 38%, transparent 96%)",
                            WebkitMaskImage:
                                "linear-gradient(90deg, black 0%, black 38%, transparent 96%)",
                        }}
                    >
                        <div className="flex items-start gap-1.5 opacity-[0.35]">
                            <InboxRowAvatar
                                initials={row.initials}
                                bgStyle={bgStyle}
                                selected={false}
                                ghost
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[0.5rem] font-medium leading-tight text-white/[0.42]">
                                    {row.sender}
                                </p>
                                <p className="mt-0.5 truncate text-[0.46rem] text-white/[0.3]">
                                    {row.subject}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
