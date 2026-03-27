"use client";

/**
 * Forensic leaders + labels
 * -------------------------
 * Tweak geometry: `F3_LEADER` below (gaps, start position along highlight width, V depth).
 * Tweak copy: `src/components/f3PhishingCopy.ts` → `F3_FORENSIC_LABELS`.
 * Tweak label look: `globals.css` → `.f3-forensic-overlay-label`.
 * If leaders clip horizontally: `F3PhishingEmail.tsx` outer wrapper uses `overflow-x-visible` while remediation is on.
 */

import { useCallback, useLayoutEffect, useMemo, useState, type RefObject } from "react";
import { F3_FORENSIC_LABELS } from "./f3PhishingCopy";

const TARGET_KEYS = ["sender-domain", "pressure", "cta"] as const;

type TargetKey = (typeof TARGET_KEYS)[number];

/** Editable layout knobs (px, or 0–1 for `startAlong`). */
const F3_LEADER = {
    /** Horizontal: line starts under this fraction of highlight width (1 = right edge). */
    startAlong: 0.78,
    /** Vertical gap between highlight bottom and line start. */
    gapBelow: 10,
    /** Vertex drop — keep small to *open* the V (wide angle, not a sharp notch). */
    vertexDown: 8,
    /** Minimum horizontal run from start toward the label before the vertex. */
    stubMin: 20,
    /** Space between line end and annotation text. */
    margin: 8,
    /** Horizontal offset from highlight to label column (side layout). */
    sideLabelGap: 40,
    belowLabelGap: 18,
    /**
     * Used to decide side vs below layout. Set ≥ widest label line so we don’t place
     * long copy off-screen; raise if you shorten the viewport test.
     */
    labelWidthEstimate: 420,
} as const;

type MeasuredBox = Readonly<{
    key: TargetKey;
    label: string;
    top: number;
    left: number;
    width: number;
    height: number;
    labelLeft: number;
    labelTop: number;
    placement: "side" | "below";
}>;

/** Two straight segments (miter join): start below highlight → vertex → label anchor. */
function leaderPolyline(b: MeasuredBox): Readonly<{
    points: string;
    tipX: number;
    tipY: number;
    gx1: number;
    gy1: number;
    gx2: number;
    gy2: number;
}> {
    const { startAlong, gapBelow, vertexDown, stubMin, margin } = F3_LEADER;
    const yBottom = b.top + b.height;
    const p1x = b.left + b.width * startAlong;
    const p1y = yBottom + gapBelow;

    if (b.placement === "side") {
        const p3x = b.labelLeft - margin;
        const p3y = b.labelTop;
        const span = Math.max(4, p3x - p1x);
        const vSpread = Math.min(64, Math.max(stubMin, span * 0.58));
        const p2x = Math.min(p1x + vSpread, p3x - 6);
        const p2y = p1y + vertexDown;
        const points = `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`;
        return {
            points,
            tipX: p2x,
            tipY: p2y,
            gx1: p1x,
            gy1: p1y,
            gx2: p3x,
            gy2: p3y,
        };
    }

    const p3x = b.labelLeft;
    const p3y = b.labelTop - margin;
    const horiz = p3x - p1x;
    const toward = horiz >= 0 ? 1 : -1;
    const vSpread = toward * Math.min(52, Math.max(stubMin, Math.abs(horiz) * 0.55));
    const p2x = p1x + vSpread;
    const p2y = p1y + vertexDown;
    const points = `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`;
    return {
        points,
        tipX: p2x,
        tipY: p2y,
        gx1: p1x,
        gy1: p1y,
        gx2: p3x,
        gy2: p3y,
    };
}

const ACCENT_STOPS = [
    { offset: "0%", color: "#7c3aed" },
    { offset: "50%", color: "#9b6bff" },
    { offset: "100%", color: "#a78bfa" },
] as const;

export function F3ForensicOverlay({
    rootRef,
    active,
}: Readonly<{
    rootRef: RefObject<HTMLElement | null>;
    active: boolean;
}>) {
    const [boxes, setBoxes] = useState<MeasuredBox[]>([]);

    const measure = useCallback(() => {
        const root = rootRef.current;
        if (!root || !active) {
            setBoxes([]);
            return;
        }

        const rootRect = root.getBoundingClientRect();
        const rootWidth = root.clientWidth;
        const next: MeasuredBox[] = [];
        const { sideLabelGap, belowLabelGap, labelWidthEstimate } = F3_LEADER;

        TARGET_KEYS.forEach((key, index) => {
            const el = root.querySelector(`[data-f3-forensic-target="${key}"]`);
            if (!el) return;

            const r = el.getBoundingClientRect();
            const top = r.top - rootRect.top + root.scrollTop;
            const left = r.left - rootRect.left + root.scrollLeft;
            const width = r.width;
            const height = r.height;

            let placement: "side" | "below" = "side";
            let labelLeft = left + width + sideLabelGap;
            let labelTop = top + height * 0.5;

            if (labelLeft + labelWidthEstimate > rootWidth - 8) {
                placement = "below";
                labelLeft = Math.max(8, left);
                labelTop = top + height + belowLabelGap + 4;
            }

            next.push({
                key,
                label: F3_FORENSIC_LABELS[index] ?? "",
                top,
                left,
                width,
                height,
                labelLeft,
                labelTop,
                placement,
            });
        });

        setBoxes(next);
    }, [active, rootRef]);

    useLayoutEffect(() => {
        measure();
        const root = rootRef.current;
        if (!root) return;

        const ro = new ResizeObserver(() => measure());
        ro.observe(root);

        globalThis.window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            globalThis.window.removeEventListener("resize", measure);
        };
    }, [measure, rootRef]);

    const leaders = useMemo(() => boxes.map((b) => ({ b, ...leaderPolyline(b) })), [boxes]);

    if (!active || boxes.length === 0) return null;

    return (
        <div className="f3-forensic-overlay pointer-events-none absolute inset-0 z-[35]" aria-hidden>
            <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                <defs>
                    {leaders.map(({ b, gx1, gy1, gx2, gy2 }) => (
                        <linearGradient
                            key={`g-${b.key}`}
                            id={`f3-forensic-accent-leader-${b.key}`}
                            gradientUnits="userSpaceOnUse"
                            x1={gx1}
                            y1={gy1}
                            x2={gx2}
                            y2={gy2}
                        >
                            {ACCENT_STOPS.map((s) => (
                                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
                            ))}
                        </linearGradient>
                    ))}
                </defs>
                {leaders.map(({ b, points, tipX, tipY }) => (
                    <g key={`g-${b.key}`}>
                        <polyline
                            points={points}
                            fill="none"
                            stroke={`url(#f3-forensic-accent-leader-${b.key})`}
                            strokeWidth={0.9}
                            strokeLinecap="butt"
                            strokeLinejoin="miter"
                            strokeMiterlimit={4}
                        />
                        <circle
                            cx={tipX}
                            cy={tipY}
                            r={5.5}
                            fill="none"
                            stroke={`url(#f3-forensic-accent-leader-${b.key})`}
                            strokeWidth={1.65}
                        />
                    </g>
                ))}
            </svg>
            {boxes.map((b) => (
                <div
                    key={b.key}
                    className="f3-forensic-overlay-label"
                    style={{
                        top: b.labelTop,
                        left: b.labelLeft,
                        transform: b.placement === "side" ? "translateY(-50%)" : "none",
                    }}
                >
                    {b.label}
                </div>
            ))}
        </div>
    );
}
