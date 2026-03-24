"use client";

import { gsap } from "gsap";
import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type AnimationEvent,
    type RefObject,
} from "react";

/** Fine-tune aim after layout (degrees). */
const ARROW_ART_ROTATION_OFFSET_DEG = -20;

/**
 * Horizontal gap from the CTA’s **right edge** to the arrow box’s **left edge**.
 * (Positioning is anchored to the button, not the reading pane.)
 */
const ARROW_CTA_GAP_X_PX = -95;

/** Added to vertical centering vs the CTA. Positive → arrow moves DOWN. */
const ARROW_VERTICAL_OFFSET_PX = 45;

/** Must match `.f3-cta-arrow-fade` animation duration in globals.css */
const FADE_TOTAL_S = 3;

/** Chalk stroke starts after fade begins lifting (seconds). */
const CHALK_DRAW_START_S = 0.3;

/** In-place mask wipe duration (seconds). */
const CHALK_DRAW_DURATION_S = 0.42;

/** Mask rect width in SVG user units (viewBox-wide + margin for stroke / diagonal). */
const MASK_RECT_MAX_W = 240;

export type F3NudgeArrowProps = Readonly<{
    /** `position: relative` wrapper that contains the CTA (and this arrow). */
    anchorRef: RefObject<HTMLElement | null>;
    ctaRef: RefObject<HTMLButtonElement | null>;
    prefersReducedMotion?: boolean;
    /** Called when the fade-in/out CSS animation completes (full motion only). */
    onDrawEraseAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void;
    /** Called after static reduced-motion display (~match full sequence length). */
    onArrowDone: () => void;
}>;

/** Graphic width; smaller = tinier arrow. */
const ARROW_WIDTH_PX = 108;

/** Match SVG viewBox so the host has real height. */
const ARROW_VIEWBOX_W = 189.39224;
const ARROW_VIEWBOX_H = 54.984902;
const ARROW_HEIGHT_PX = Math.max(
    32,
    Math.ceil(((ARROW_WIDTH_PX * ARROW_VIEWBOX_H) / ARROW_VIEWBOX_W) * 1.2)
);

/** `scale(-1,-1)` on the art reverses its heading vs the atan2 math — add 180° if you re-enable flip. */
const FLIP_XY_CORRECTION_DEG = 0;

const REDUCED_MOTION_ARROW_MS = Math.round(FADE_TOTAL_S * 1000) + 100;

/**
 * Hand-drawn chalk arrow. Placed relative to the CTA button inside `anchorRef`;
 * rotation aims the pivot at the button center using viewport geometry.
 */
export default function F3NudgeArrow({
    anchorRef,
    ctaRef,
    prefersReducedMotion = false,
    onDrawEraseAnimationEnd,
    onArrowDone,
}: F3NudgeArrowProps) {
    const reactId = useId();
    const maskId = `f3-arrow-mask-${reactId.replace(/:/g, "")}`;
    const hostRef = useRef<HTMLDivElement>(null);
    const fadeRef = useRef<HTMLDivElement>(null);
    const maskRectRef = useRef<SVGRectElement>(null);
    const [rotateDeg, setRotateDeg] = useState(0);
    const [leftPx, setLeftPx] = useState(0);
    const [topPx, setTopPx] = useState(0);

    useEffect(() => {
        if (!prefersReducedMotion) return;
        const id = globalThis.window.setTimeout(() => onArrowDone(), REDUCED_MOTION_ARROW_MS);
        return () => globalThis.window.clearTimeout(id);
    }, [onArrowDone, prefersReducedMotion]);

    useLayoutEffect(() => {
        if (!prefersReducedMotion) return;
        const rect = maskRectRef.current;
        if (rect) rect.setAttribute("width", String(MASK_RECT_MAX_W));
    }, [prefersReducedMotion]);

    useEffect(() => {
        if (prefersReducedMotion) return;
        const rect = maskRectRef.current;
        const scope = fadeRef.current;
        if (!rect || !scope) return;

        const ctx = gsap.context(() => {
            gsap.set(rect, { attr: { width: 0 } });
            gsap.to(rect, {
                attr: { width: MASK_RECT_MAX_W },
                duration: CHALK_DRAW_DURATION_S,
                ease: "power2.out",
                delay: CHALK_DRAW_START_S,
            });
        }, scope);

        return () => {
            ctx.revert();
        };
    }, [prefersReducedMotion]);

    useLayoutEffect(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;

        const update = () => {
            const btn = ctaRef.current;
            const host = hostRef.current;
            if (!btn || !host) return;

            const ar = anchor.getBoundingClientRect();
            const br = btn.getBoundingClientRect();
            const hr = host.getBoundingClientRect();

            const hh = hr.height > 0 ? hr.height : 32;
            const pad = 6;

            /* Position from CTA: to the right of the button, vertically centered on it */
            const rawLeft = br.right - ar.left + ARROW_CTA_GAP_X_PX;
            const maxLeft = Math.max(0, ar.width - ARROW_WIDTH_PX - pad);
            const clampedLeft = Math.min(Math.max(0, rawLeft), maxLeft);

            const rawTop =
                br.top - ar.top + br.height / 2 - hh / 2 + ARROW_VERTICAL_OFFSET_PX;
            /*
             * Do not clamp `top` to `ar.height`: the anchor only wraps in-flow content (the button).
             * The arrow is `position:absolute`, so it does not grow `ar.height`; an upper clamp would
             * almost always pin `top` and swallow `ARROW_VERTICAL_OFFSET_PX`.
             */
            const clampedTop = Math.max(-120, rawTop);

            setLeftPx(clampedLeft);
            setTopPx(clampedTop);

            const btnCx = br.left + br.width / 2;
            const btnCy = br.top + br.height / 2;
            const ox = hr.right;
            const oy = hr.top + hr.height * 0.5;

            const rad = Math.atan2(btnCy - oy, btnCx - ox);
            const deg =
                rad * (180 / Math.PI) +
                ARROW_ART_ROTATION_OFFSET_DEG +
                FLIP_XY_CORRECTION_DEG;
            setRotateDeg(deg);
        };

        update();
        const rafId = requestAnimationFrame(update);
        const tId = globalThis.window.setTimeout(update, 0);

        const ro = new ResizeObserver(() => update());
        ro.observe(anchor);

        globalThis.window.addEventListener("scroll", update, { passive: true });
        globalThis.window.addEventListener("resize", update);

        return () => {
            cancelAnimationFrame(rafId);
            globalThis.window.clearTimeout(tId);
            ro.disconnect();
            globalThis.window.removeEventListener("scroll", update);
            globalThis.window.removeEventListener("resize", update);
        };
    }, [anchorRef, ctaRef]);

    const fadeClassName = prefersReducedMotion
        ? "f3-cta-arrow-fade f3-cta-arrow-fade--reduced"
        : "f3-cta-arrow-fade";

    return (
        <div
            ref={hostRef}
            className="f3-cta-arrow pointer-events-none absolute z-[80]"
            style={{
                left: `${leftPx}px`,
                top: `${topPx}px`,
                width: `${ARROW_WIDTH_PX}px`,
                height: `${ARROW_HEIGHT_PX}px`,
            }}
            aria-hidden
        >
            <div
                ref={fadeRef}
                className={fadeClassName}
                onAnimationEnd={prefersReducedMotion ? undefined : onDrawEraseAnimationEnd}
            >
                <div
                    style={{
                        width: ARROW_WIDTH_PX,
                        minWidth: ARROW_WIDTH_PX,
                        transform: `rotate(${rotateDeg}deg)`,
                        transformOrigin: "right center",
                    }}
                >
                    <div
                        className="h-auto w-full"
                        style={{
                            transform: "scale(-1, -1)",
                            transformOrigin: "center center",
                        }}
                    >
                        <svg
                            className="f3-cta-arrow-svg h-auto w-full"
                            viewBox={`0 0 ${ARROW_VIEWBOX_W} ${ARROW_VIEWBOX_H}`}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <mask
                                    id={maskId}
                                    maskUnits="userSpaceOnUse"
                                    maskContentUnits="userSpaceOnUse"
                                    x="-40"
                                    y="-100"
                                    width="320"
                                    height="280"
                                >
                                    <rect
                                        ref={maskRectRef}
                                        x="-24"
                                        y="-80"
                                        width="0"
                                        height="220"
                                        fill="white"
                                    />
                                </mask>
                            </defs>
                            <g mask={`url(#${maskId})`}>
                                <g transform="translate(-19.90747,-126.90293)">
                                    <path
                                        className="f3-cta-arrow-ink-path"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        d="m 43.505124,138.0035 c -0.141961,0.32389 -0.288078,0.64675 -0.433176,0.97167 l 2.862335,0.83524 c 0.05873,-0.1899 0.117427,-0.38086 0.177181,-0.57075 -0.869465,-0.41106 -1.734794,-0.82515 -2.60634,-1.23616 m -6.0966,0.65541 c 0.288673,4.17158 3.814996,3.25273 5.778712,4.90466 0.162329,-0.24838 0.327774,-0.50192 0.490121,-0.75441 -2.089954,-1.38583 -4.17889,-2.76752 -6.268829,-4.15025 M 19.90747,133.5024 c 1.748134,-2.22065 3.108598,-3.94486 4.643673,-5.89563 14.39095,-0.22842 29.113718,-0.46261 44.111397,-0.70384 -2.548691,0.94691 -4.738204,1.75691 -7.215471,2.6752 1.682296,2.89922 5.111637,0.52781 7.077072,2.97041 -2.210718,0.46367 -4.237249,0.88371 -6.267954,1.3089 -0.02788,0.22414 -0.05777,0.44932 -0.08766,0.67658 2.582527,0.53533 5.165041,1.07269 8.572624,1.78422 -5.631162,0.80321 -10.343956,1.47815 -16.04129,2.29446 11.792019,6.05032 23.008156,10.96021 35.041775,15.17706 -0.521954,0.71498 -0.871342,1.19716 -1.538914,2.12028 1.24865,0.67519 2.430074,1.59817 3.766801,1.98746 12.755247,3.69395 25.558837,7.21135 38.293087,10.98169 3.37426,0.9987 7.10254,0.92307 9.78384,4.39303 1.23532,1.60015 4.7064,1.72698 7.22377,2.04187 15.4171,1.93309 30.84008,3.70187 46.43814,3.48496 5.18973,-0.0724 10.39264,0.85273 15.59135,1.3199 -0.005,0.32555 -0.006,0.64491 -0.009,0.97046 -3.2796,0.27917 -6.56033,0.8105 -9.8366,0.79821 -15.69404,-0.0553 -31.39564,-0.0311 -47.08163,-0.51013 -6.745,-0.20738 -13.43952,-2.02777 -20.18844,-2.28473 -10.19003,-0.38883 -20.02865,-2.42666 -29.81871,-4.93039 -2.922694,-0.7456 -5.829046,-1.67921 -8.602031,-2.8603 -2.371698,-1.00773 -4.430001,-2.77378 -6.825885,-3.68448 -2.351525,-0.88882 -5.122161,-0.72008 -7.40916,-1.71198 -8.687982,-3.76396 -17.269438,-7.77757 -25.856169,-11.76538 -3.36663,-1.56094 -6.645669,-3.30027 -10.606832,-4.32842 2.753947,3.63461 5.402093,7.35867 8.294014,10.87916 2.714055,3.30684 5.058468,6.76705 6.300266,10.89426 0.416592,1.394 0.788689,2.80536 1.208955,4.30997 -4.872455,2.67515 -5.548517,-2.48413 -8.534846,-3.79948 0.607215,2.00049 1.133967,3.73605 1.692296,5.572 -2.708521,1.08883 -4.40863,0.13157 -5.971078,-1.81521 -8.049728,-10.0203 -15.624632,-20.3775 -21.758723,-31.69165 -1.847516,-3.40844 -2.984316,-7.19927 -4.388213,-10.65847"
                                    />
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
