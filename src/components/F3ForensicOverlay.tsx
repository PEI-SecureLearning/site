"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type AnimationEvent as ReactAnimationEvent,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";
import { F3_FORENSIC_LABELS } from "./f3PhishingCopy";

type TargetKey = "sender-domain" | "pressure" | "cta";

type MeasuredBox = Readonly<{
    key: TargetKey;
    targetLeft: number;
    targetTop: number;
    targetWidth: number;
    targetHeight: number;
    targetAnchorX: number;
    targetAnchorY: number;
    boxLeft: number;
    boxTop: number;
    boxWidth: number;
    boxHeight: number;
    boxAnchorX: number;
    boxAnchorY: number;
    elbowX: number;
    elbowY: number;
    linePoints: string;
}>;

type TargetRefs = Readonly<{
    senderDomainRef: RefObject<HTMLSpanElement | null>;
    pressureRef: RefObject<HTMLElement | null>;
    ctaRef: RefObject<HTMLSpanElement | null>;
}>;

type DragMode =
    | "move-box"
    | "resize-box"
    | "move-elbow"
    | "move-target-anchor"
    | "move-box-anchor";

type DragState = Readonly<{
    key: TargetKey;
    mode: DragMode;
    startClientX: number;
    startClientY: number;
    baseLayout: F3ForensicCalloutLayout;
    baseBox: MeasuredBox;
}>;

const BOX_LAYOUT = {
    "sender-domain": {
        width: 0.32,
        minWidth: 250,
        maxWidth: 430,
        height: 60,
        offsetX: 112,
        offsetY: -4,
    },
    pressure: {
        width: 0.31,
        minWidth: 250,
        maxWidth: 420,
        height: 66,
        offsetX: 88,
        offsetY: -92,
    },
    cta: {
        width: 0.34,
        minWidth: 280,
        maxWidth: 460,
        height: 60,
        offsetX: 108,
        offsetY: 10,
    },
} as const satisfies Record<
    TargetKey,
    Readonly<{
        width: number;
        minWidth: number;
        maxWidth: number;
        height: number;
        offsetX: number;
        offsetY: number;
    }>
>;

const TARGET_ANCHORS = {
    "sender-domain": { x: 1, y: 0.55 },
    pressure: { x: 0.88, y: 1 },
    cta: { x: 1, y: 0.62 },
} as const satisfies Record<TargetKey, Readonly<{ x: number; y: number }>>;

const BOX_ANCHORS = {
    "sender-domain": { x: 0, y: 0.5 },
    pressure: { x: 0.14, y: 1 },
    cta: { x: 0, y: 0.5 },
} as const satisfies Record<TargetKey, Readonly<{ x: number; y: number }>>;

const LEGACY_ELBOW_OFFSETS = {
    "sender-domain": { x: 30, y: 7 },
    pressure: { x: 34, y: -12 },
    cta: { x: 26, y: 16 },
} as const satisfies Record<TargetKey, Readonly<{ x: number; y: number }>>;

const F3_FORENSIC_COPY_INSET_X = 16;
const F3_FORENSIC_COPY_INSET_Y = 10;
const F3_FORENSIC_COPY_FONT_SIZE_REM = 1;
const F3_FORENSIC_COPY_LINE_HEIGHT = 1.4;

export const F3_FORENSIC_BREAKPOINTS = ["desktop", "tablet", "mobile"] as const;

export type F3ForensicBreakpoint = (typeof F3_FORENSIC_BREAKPOINTS)[number];
export type F3ForensicTargetKey = TargetKey;

export type F3ForensicCalloutLayout = Readonly<{
    box: Readonly<{
        left: number;
        top: number;
        width: number;
        height: number;
    }>;
    elbow: Readonly<{
        x: number;
        y: number;
    }>;
    targetAnchor?: Readonly<{
        x: number;
        y: number;
    }>;
    boxAnchor?: Readonly<{
        x: number;
        y: number;
    }>;
}>;

export type F3ForensicLayoutSet = Record<
    F3ForensicBreakpoint,
    Partial<Record<F3ForensicTargetKey, F3ForensicCalloutLayout>>
>;

export type F3ForensicOverlayEditor = Readonly<{
    enabled: boolean;
    breakpointOverride?: F3ForensicBreakpoint;
    onLayoutsChange: (next: F3ForensicLayoutSet) => void;
}>;

export const F3_FORENSIC_EDITOR_LABELS = {
    "sender-domain": "01 Sender mismatch",
    pressure: "02 Pressure language",
    cta: "03 Hidden destination",
} as const satisfies Record<F3ForensicTargetKey, string>;

const F3_FORENSIC_COPY_BY_KEY = {
    "sender-domain": F3_FORENSIC_LABELS[0],
    pressure: F3_FORENSIC_LABELS[1],
    cta: F3_FORENSIC_LABELS[2],
} as const satisfies Record<F3ForensicTargetKey, string>;

export const F3_FORENSIC_LAYOUTS = {
    desktop: {
        pressure: {
            box: {
                left: 0.5065102943475696,
                top: 0.6084415346616274,
                width: 0.35505609307772873,
                height: 0.07272727272727272,
            },
            elbow: {
                x: 0.569949069645094,
                y: 0.7794259190035203,
            },
            targetAnchor: {
                x: 1,
                y: 0.5261112334716438,
            },
            boxAnchor: {
                x: 0.2511349431116171,
                y: 1,
            },
        },
        "sender-domain": {
            box: {
                left: 0.28414855625318447,
                top: 0.1868830613966112,
                width: 0.43614486119367085,
                height: 0.07272727272727272,
            },
            elbow: {
                x: 0.23903987718665085,
                y: 0.27336846686028815,
            },
            targetAnchor: {
                x: 0.9318094724148177,
                y: 1,
            },
        },
        cta: {
            box: {
                left: 0.32828352278557377,
                top: 0.8805194805194805,
                width: 0.3997718275871831,
                height: 0.07272727272727272,
            },
            elbow: {
                x: 0.27543025085891504,
                y: 0.9875323407061688,
            },
            targetAnchor: {
                x: 1,
                y: 0.62,
            },
            boxAnchor: {
                x: 0,
                y: 0.5,
            },
        },
    },
    tablet: {},
    mobile: {},
} as const satisfies F3ForensicLayoutSet;

export function cloneF3ForensicLayoutSet(
    layouts: F3ForensicLayoutSet = F3_FORENSIC_LAYOUTS
): F3ForensicLayoutSet {
    return {
        desktop: { ...layouts.desktop },
        tablet: { ...layouts.tablet },
        mobile: { ...layouts.mobile },
    };
}

export function createEmptyF3ForensicLayoutSet(): F3ForensicLayoutSet {
    return {
        desktop: {},
        tablet: {},
        mobile: {},
    };
}

function clampNumber(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function formatPoint(x: number, y: number) {
    return `${x.toFixed(2)},${y.toFixed(2)}`;
}

function resolveBreakpointForWidth(width: number): F3ForensicBreakpoint {
    if (width <= 0) return "desktop";
    if (width < 720) return "mobile";
    if (width < 1120) return "tablet";
    return "desktop";
}

function getAnchorPoint(
    rect: Readonly<{ left: number; top: number; width: number; height: number }>,
    anchor: Readonly<{ x: number; y: number }>
) {
    return {
        x: rect.left + rect.width * anchor.x,
        y: rect.top + rect.height * anchor.y,
    };
}

function resolveCalloutLayout(key: TargetKey, layout: F3ForensicCalloutLayout) {
    return {
        ...layout,
        targetAnchor: layout.targetAnchor ?? TARGET_ANCHORS[key],
        boxAnchor: layout.boxAnchor ?? BOX_ANCHORS[key],
    };
}

function withLinePoints(box: Omit<MeasuredBox, "linePoints">): MeasuredBox {
    return {
        ...box,
        linePoints: [
            formatPoint(box.targetAnchorX, box.targetAnchorY),
            formatPoint(box.elbowX, box.elbowY),
            formatPoint(box.boxAnchorX, box.boxAnchorY),
        ].join(" "),
    };
}

function buildLegacyMeasuredBox(
    key: TargetKey,
    overlayWidth: number,
    overlayHeight: number,
    targetLeft: number,
    targetTop: number,
    targetWidth: number,
    targetHeight: number
) {
    const cfg = BOX_LAYOUT[key];
    const scale = clampNumber(overlayWidth / 1280, 0.72, 1);
    const boxWidth = clampNumber(
        overlayWidth * cfg.width * scale,
        cfg.minWidth * scale,
        cfg.maxWidth * scale
    );
    const boxHeight = cfg.height * scale;
    const desiredLeft = targetLeft + targetWidth + cfg.offsetX * scale;
    const boxLeft = clampNumber(desiredLeft, 24, overlayWidth - boxWidth - 24);
    const boxTop = clampNumber(
        targetTop + cfg.offsetY * scale,
        18,
        overlayHeight - boxHeight - 18
    );
    const targetAnchor = getAnchorPoint(
        { left: targetLeft, top: targetTop, width: targetWidth, height: targetHeight },
        TARGET_ANCHORS[key]
    );
    const boxAnchor = getAnchorPoint(
        { left: boxLeft, top: boxTop, width: boxWidth, height: boxHeight },
        BOX_ANCHORS[key]
    );
    const elbowOffset = LEGACY_ELBOW_OFFSETS[key];

    return withLinePoints({
        key,
        targetLeft,
        targetTop,
        targetWidth,
        targetHeight,
        targetAnchorX: targetAnchor.x,
        targetAnchorY: targetAnchor.y,
        boxLeft,
        boxTop,
        boxWidth,
        boxHeight,
        boxAnchorX: boxAnchor.x,
        boxAnchorY: boxAnchor.y,
        elbowX: targetAnchor.x + elbowOffset.x,
        elbowY: targetAnchor.y + elbowOffset.y,
    });
}

function normalizeMeasuredBox(
    box: MeasuredBox,
    overlayWidth: number,
    overlayHeight: number
): F3ForensicCalloutLayout {
    return {
        box: {
            left: box.boxLeft / overlayWidth,
            top: box.boxTop / overlayHeight,
            width: box.boxWidth / overlayWidth,
            height: box.boxHeight / overlayHeight,
        },
        elbow: {
            x: box.elbowX / overlayWidth,
            y: box.elbowY / overlayHeight,
        },
        targetAnchor: TARGET_ANCHORS[box.key],
        boxAnchor: BOX_ANCHORS[box.key],
    };
}

function buildMeasuredBoxFromLayout(
    key: TargetKey,
    layout: F3ForensicCalloutLayout,
    overlayWidth: number,
    overlayHeight: number,
    targetLeft: number,
    targetTop: number,
    targetWidth: number,
    targetHeight: number
) {
    const resolvedLayout = resolveCalloutLayout(key, layout);
    const boxWidth = clampNumber(resolvedLayout.box.width * overlayWidth, 160, overlayWidth - 48);
    const boxHeight = clampNumber(resolvedLayout.box.height * overlayHeight, 28, overlayHeight - 36);
    const boxLeft = clampNumber(
        resolvedLayout.box.left * overlayWidth,
        24,
        overlayWidth - boxWidth - 24
    );
    const boxTop = clampNumber(
        resolvedLayout.box.top * overlayHeight,
        18,
        overlayHeight - boxHeight - 18
    );
    const targetAnchor = getAnchorPoint(
        { left: targetLeft, top: targetTop, width: targetWidth, height: targetHeight },
        resolvedLayout.targetAnchor
    );
    const boxAnchor = getAnchorPoint(
        { left: boxLeft, top: boxTop, width: boxWidth, height: boxHeight },
        resolvedLayout.boxAnchor
    );

    return withLinePoints({
        key,
        targetLeft,
        targetTop,
        targetWidth,
        targetHeight,
        targetAnchorX: targetAnchor.x,
        targetAnchorY: targetAnchor.y,
        boxLeft,
        boxTop,
        boxWidth,
        boxHeight,
        boxAnchorX: boxAnchor.x,
        boxAnchorY: boxAnchor.y,
        elbowX: clampNumber(resolvedLayout.elbow.x * overlayWidth, 0, overlayWidth),
        elbowY: clampNumber(resolvedLayout.elbow.y * overlayHeight, 0, overlayHeight),
    });
}

function updateLayoutSet(
    currentLayouts: F3ForensicLayoutSet,
    breakpoint: F3ForensicBreakpoint,
    key: TargetKey,
    value: F3ForensicCalloutLayout
) {
    return {
        ...currentLayouts,
        [breakpoint]: {
            ...currentLayouts[breakpoint],
            [key]: value,
        },
    };
}

function resolveLayoutForBreakpoint(
    layouts: F3ForensicLayoutSet,
    breakpoint: F3ForensicBreakpoint,
    key: TargetKey
) {
    return (
        layouts[breakpoint][key] ??
        layouts.desktop[key] ??
        layouts.tablet[key] ??
        layouts.mobile[key]
    );
}

export function F3ForensicOverlay({
    overlayRootRef,
    targetRefs,
    active,
    visibleKeys,
    animatedKey,
    onAnimatedKeyComplete,
    layouts,
    editor,
}: Readonly<{
    overlayRootRef: RefObject<HTMLElement | null>;
    targetRefs: TargetRefs;
    active: boolean;
    visibleKeys?: readonly F3ForensicTargetKey[];
    animatedKey?: F3ForensicTargetKey;
    onAnimatedKeyComplete?: (key: F3ForensicTargetKey) => void;
    layouts?: F3ForensicLayoutSet;
    editor?: F3ForensicOverlayEditor;
}>) {
    const [boxes, setBoxes] = useState<MeasuredBox[]>([]);
    const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
    const [selectedKey, setSelectedKey] = useState<TargetKey | null>(null);
    const overlaySizeRef = useRef(overlaySize);
    const boxesRef = useRef<MeasuredBox[]>([]);
    const layoutsRef = useRef<F3ForensicLayoutSet>(layouts ?? createEmptyF3ForensicLayoutSet());
    const dragStateRef = useRef<DragState | null>(null);

    overlaySizeRef.current = overlaySize;
    boxesRef.current = boxes;
    layoutsRef.current = layouts ?? createEmptyF3ForensicLayoutSet();

    const activeBreakpoint =
        editor?.breakpointOverride ?? resolveBreakpointForWidth(overlaySize.width);
    const currentLayouts = layoutsRef.current;
    const resolvedVisibleKeys =
        visibleKeys ?? (["sender-domain", "pressure", "cta"] as const satisfies readonly F3ForensicTargetKey[]);

    const measure = useCallback(() => {
        const overlayRoot = overlayRootRef.current;
        if (!overlayRoot || !active) {
            setBoxes([]);
            return;
        }

        const overlayRect = overlayRoot.getBoundingClientRect();
        const overlayWidth = overlayRoot.clientWidth;
        const overlayHeight = overlayRoot.clientHeight;
        const nextSize = { width: overlayWidth, height: overlayHeight };
        overlaySizeRef.current = nextSize;
        setOverlaySize(nextSize);
        const breakpoint =
            editor?.breakpointOverride ?? resolveBreakpointForWidth(overlayWidth);

        const targets: ReadonlyArray<readonly [TargetKey, HTMLElement | null]> = [
            ["sender-domain", targetRefs.senderDomainRef.current],
            ["pressure", targetRefs.pressureRef.current],
            ["cta", targetRefs.ctaRef.current],
        ];

        const next = targets.flatMap(([key, el]) => {
            if (!el) return [];

            const targetRect = el.getBoundingClientRect();
            const targetLeft = targetRect.left - overlayRect.left;
            const targetTop = targetRect.top - overlayRect.top;
            const targetWidth = targetRect.width;
            const targetHeight = targetRect.height;
            const layout = resolveLayoutForBreakpoint(currentLayouts, breakpoint, key);

            if (layout) {
                return [
                    buildMeasuredBoxFromLayout(
                        key,
                        layout,
                        overlayWidth,
                        overlayHeight,
                        targetLeft,
                        targetTop,
                        targetWidth,
                        targetHeight
                    ),
                ];
            }

            return [
                buildLegacyMeasuredBox(
                    key,
                    overlayWidth,
                    overlayHeight,
                    targetLeft,
                    targetTop,
                    targetWidth,
                    targetHeight
                ),
            ];
        });

        setBoxes(next);
    }, [active, currentLayouts, editor?.breakpointOverride, overlayRootRef, targetRefs]);

    useLayoutEffect(() => {
        measure();
        const overlayRoot = overlayRootRef.current;
        if (!overlayRoot) return;

        const ro = new ResizeObserver(() => measure());
        ro.observe(overlayRoot);
        if (targetRefs.senderDomainRef.current) ro.observe(targetRefs.senderDomainRef.current);
        if (targetRefs.pressureRef.current) ro.observe(targetRefs.pressureRef.current);
        if (targetRefs.ctaRef.current) ro.observe(targetRefs.ctaRef.current);

        globalThis.window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            globalThis.window.removeEventListener("resize", measure);
        };
    }, [measure, overlayRootRef, targetRefs]);

    useEffect(() => {
        if (!editor?.enabled) {
            dragStateRef.current = null;
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const drag = dragStateRef.current;
            if (!drag) return;

            event.preventDefault();

            const { width, height } = overlaySizeRef.current;
            if (width <= 0 || height <= 0) return;

            const deltaX = event.clientX - drag.startClientX;
            const deltaY = event.clientY - drag.startClientY;
            const deltaXNorm = deltaX / width;
            const deltaYNorm = deltaY / height;
            const minWidthNorm = 160 / width;
            const minHeightNorm = 28 / height;
            const nextLayout =
                drag.mode === "move-box"
                    ? {
                          ...drag.baseLayout,
                          box: {
                              ...drag.baseLayout.box,
                              left: clampNumber(
                                  drag.baseLayout.box.left + deltaXNorm,
                                  24 / width,
                                  1 - drag.baseLayout.box.width - 24 / width
                              ),
                              top: clampNumber(
                                  drag.baseLayout.box.top + deltaYNorm,
                                  18 / height,
                                  1 - drag.baseLayout.box.height - 18 / height
                              ),
                          },
                      }
                    : drag.mode === "resize-box"
                      ? {
                            ...drag.baseLayout,
                            box: {
                                ...drag.baseLayout.box,
                                width: clampNumber(
                                    drag.baseLayout.box.width + deltaXNorm,
                                    minWidthNorm,
                                    1 - drag.baseLayout.box.left - 24 / width
                                ),
                                height: clampNumber(
                                    drag.baseLayout.box.height + deltaYNorm,
                                    minHeightNorm,
                                    1 - drag.baseLayout.box.top - 18 / height
                                ),
                            },
                        }
                      : drag.mode === "move-elbow"
                        ? {
                              ...drag.baseLayout,
                              elbow: {
                                  x: clampNumber(drag.baseLayout.elbow.x + deltaXNorm, 0, 1),
                                  y: clampNumber(drag.baseLayout.elbow.y + deltaYNorm, 0, 1),
                              },
                          }
                        : drag.mode === "move-target-anchor"
                          ? {
                                ...drag.baseLayout,
                                targetAnchor: {
                                    x: clampNumber(
                                        (drag.baseLayout.targetAnchor ?? TARGET_ANCHORS[drag.key]).x +
                                            deltaX / drag.baseBox.targetWidth,
                                        0,
                                        1
                                    ),
                                    y: clampNumber(
                                        (drag.baseLayout.targetAnchor ?? TARGET_ANCHORS[drag.key]).y +
                                            deltaY / drag.baseBox.targetHeight,
                                        0,
                                        1
                                    ),
                                },
                            }
                          : {
                                ...drag.baseLayout,
                                boxAnchor: {
                                    x: clampNumber(
                                        (drag.baseLayout.boxAnchor ?? BOX_ANCHORS[drag.key]).x +
                                            deltaX / drag.baseBox.boxWidth,
                                        0,
                                        1
                                    ),
                                    y: clampNumber(
                                        (drag.baseLayout.boxAnchor ?? BOX_ANCHORS[drag.key]).y +
                                            deltaY / drag.baseBox.boxHeight,
                                        0,
                                        1
                                    ),
                                },
                            };

            editor.onLayoutsChange(
                updateLayoutSet(layoutsRef.current, activeBreakpoint, drag.key, nextLayout)
            );
        };

        const handlePointerUp = () => {
            dragStateRef.current = null;
        };

        globalThis.window.addEventListener("pointermove", handlePointerMove);
        globalThis.window.addEventListener("pointerup", handlePointerUp);

        return () => {
            globalThis.window.removeEventListener("pointermove", handlePointerMove);
            globalThis.window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [activeBreakpoint, editor]);

    const gradientIds = useMemo(
        () =>
            boxes.map((box) => ({
                key: box.key,
                id: `f3-forensic-gradient-${box.key}`,
            })),
        [boxes]
    );

    const startDrag = useCallback(
        (event: ReactPointerEvent<HTMLElement>, key: TargetKey, mode: DragMode) => {
            if (!editor?.enabled) return;

            const measured = boxesRef.current.find((box) => box.key === key);
            const { width, height } = overlaySizeRef.current;
            if (!measured || width <= 0 || height <= 0) return;

            event.preventDefault();
            event.stopPropagation();
            setSelectedKey(key);

            const baseLayout =
                layoutsRef.current[activeBreakpoint]?.[key] ??
                normalizeMeasuredBox(measured, width, height);

            dragStateRef.current = {
                key,
                mode,
                startClientX: event.clientX,
                startClientY: event.clientY,
                baseLayout,
                baseBox: measured,
            };

            event.currentTarget.setPointerCapture?.(event.pointerId);
        },
        [activeBreakpoint, editor?.enabled]
    );

    if (!active || boxes.length === 0) return null;

    return (
        <div className="f3-forensic-overlay pointer-events-none absolute inset-0 z-[60] overflow-visible" aria-hidden>
            <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                <defs>
                    <filter id="f3-forensic-box-glow" x="-30%" y="-40%" width="160%" height="180%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feColorMatrix
                            in="blur"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.28 0"
                        />
                    </filter>
                    {gradientIds.map(({ id }) => (
                        <linearGradient
                            key={id}
                            id={id}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="52%" stopColor="#9b6bff" />
                            <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                    ))}
                </defs>

                {boxes.map((box) => {
                    const gradientId = gradientIds.find((entry) => entry.key === box.key)?.id;
                    const stroke = gradientId ? `url(#${gradientId})` : "#9b6bff";
                    const radius = Math.min(14, Math.max(10, box.boxHeight * 0.34));
                    const isVisible = resolvedVisibleKeys.includes(box.key);
                    const revealState =
                        !isVisible ? "hidden" : animatedKey === box.key ? "animating" : "visible";

                    return (
                        <g key={`callout-${box.key}`}>
                            <polyline
                                className="f3-forensic-leader-path"
                                data-reveal={revealState}
                                points={box.linePoints}
                                pathLength={1}
                                fill="none"
                                stroke={stroke}
                                strokeWidth={1.55}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit={4}
                            />
                            <circle
                                className="f3-forensic-leader-dot"
                                data-reveal={revealState}
                                cx={box.targetAnchorX}
                                cy={box.targetAnchorY}
                                r={1.9}
                                fill="#120f18"
                                stroke={stroke}
                                strokeWidth={1.05}
                            />
                            <circle
                                className="f3-forensic-leader-dot"
                                data-reveal={revealState}
                                cx={box.elbowX}
                                cy={box.elbowY}
                                r={2.4}
                                fill="#120f18"
                                stroke={stroke}
                                strokeWidth={1.1}
                            />
                            <g className="f3-forensic-note-shell" data-reveal={revealState}>
                                <rect
                                    className="f3-forensic-note-glow"
                                    x={box.boxLeft}
                                    y={box.boxTop}
                                    width={box.boxWidth}
                                    height={box.boxHeight}
                                    rx={radius}
                                    fill="none"
                                    stroke={stroke}
                                    strokeWidth={2.2}
                                    opacity={0.16}
                                    filter="url(#f3-forensic-box-glow)"
                                    pathLength={1}
                                />
                                <rect
                                    className="f3-forensic-note-frame"
                                    x={box.boxLeft}
                                    y={box.boxTop}
                                    width={box.boxWidth}
                                    height={box.boxHeight}
                                    rx={radius}
                                    fill="rgba(17, 14, 24, 0.22)"
                                    stroke={stroke}
                                    strokeWidth={1.45}
                                    pathLength={1}
                                />
                                <rect
                                    className="f3-forensic-note-inner"
                                    x={box.boxLeft + 1}
                                    y={box.boxTop + 1}
                                    width={Math.max(0, box.boxWidth - 2)}
                                    height={Math.max(0, box.boxHeight - 2)}
                                    rx={Math.max(radius - 1, 8)}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.045)"
                                    strokeWidth={0.8}
                                    pathLength={1}
                                />
                            </g>
                        </g>
                    );
                })}
            </svg>

            {boxes.map((box) => (
                <div
                    key={`copy-${box.key}`}
                    className="f3-forensic-copy pointer-events-none absolute flex items-center"
                    data-reveal={
                        !resolvedVisibleKeys.includes(box.key)
                            ? "hidden"
                            : animatedKey === box.key
                              ? "animating"
                              : "visible"
                    }
                    style={{
                        left: `${box.boxLeft + F3_FORENSIC_COPY_INSET_X}px`,
                        top: `${box.boxTop + F3_FORENSIC_COPY_INSET_Y}px`,
                        width: `${Math.max(box.boxWidth - F3_FORENSIC_COPY_INSET_X * 2, 0)}px`,
                        height: `${Math.max(box.boxHeight - F3_FORENSIC_COPY_INSET_Y * 2, 0)}px`,
                    }}
                >
                    <p
                        className="font-medium tracking-[-0.01em] text-white/72"
                        style={{
                            fontSize: `${F3_FORENSIC_COPY_FONT_SIZE_REM}rem`,
                            lineHeight: F3_FORENSIC_COPY_LINE_HEIGHT,
                            ["--f3-forensic-char-count" as string]:
                                F3_FORENSIC_COPY_BY_KEY[box.key].length,
                        }}
                        onAnimationEnd={(event: ReactAnimationEvent<HTMLParagraphElement>) => {
                            if (event.animationName !== "f3ForensicCopyTypeReveal") return;
                            if (animatedKey !== box.key) return;
                            onAnimatedKeyComplete?.(box.key);
                        }}
                    >
                        {F3_FORENSIC_COPY_BY_KEY[box.key]}
                    </p>
                </div>
            ))}

            {editor?.enabled
                ? boxes.map((box) => {
                      const isSelected = selectedKey === box.key;

                      return (
                          <div
                              key={`editor-${box.key}`}
                              className="pointer-events-none absolute"
                              style={{
                                  left: `${box.boxLeft}px`,
                                  top: `${box.boxTop}px`,
                                  width: `${box.boxWidth}px`,
                                  height: `${box.boxHeight}px`,
                              }}
                          >
                              <button
                                  type="button"
                                  className={`pointer-events-auto absolute inset-0 rounded-[14px] border bg-black/20 text-left backdrop-blur-[2px] transition ${
                                      isSelected
                                          ? "border-[var(--accent-secondary)]/85 shadow-[0_0_0_1px_rgba(167,139,250,0.22)]"
                                          : "border-[var(--accent-secondary)]/28 hover:border-[var(--accent-secondary)]/55"
                                  }`}
                                  style={{ touchAction: "none" }}
                                  onPointerDown={(event) => startDrag(event, box.key, "move-box")}
                                  onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setSelectedKey(box.key);
                                  }}
                              />
                              <button
                                  type="button"
                                  aria-label={`Move highlight dock for ${F3_FORENSIC_EDITOR_LABELS[box.key]}`}
                                  className="pointer-events-auto absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--accent-secondary)]/70 bg-[var(--background)]/92 shadow-[0_0_0_1px_rgba(167,139,250,0.16)]"
                                  style={{
                                      left: `${box.targetAnchorX - box.boxLeft}px`,
                                      top: `${box.targetAnchorY - box.boxTop}px`,
                                      touchAction: "none",
                                  }}
                                  onPointerDown={(event) =>
                                      startDrag(event, box.key, "move-target-anchor")
                                  }
                              >
                                  <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent-secondary)]/85" />
                              </button>
                              <button
                                  type="button"
                                  aria-label={`Resize ${F3_FORENSIC_EDITOR_LABELS[box.key]}`}
                                  className="pointer-events-auto absolute -bottom-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--accent-secondary)]/55 bg-[var(--background)]/90 text-[0.55rem] text-white/75 shadow-[0_0_0_1px_rgba(167,139,250,0.12)]"
                                  style={{ touchAction: "none" }}
                                  onPointerDown={(event) => startDrag(event, box.key, "resize-box")}
                              >
                                  +
                              </button>
                              <button
                                  type="button"
                                  aria-label={`Move box dock for ${F3_FORENSIC_EDITOR_LABELS[box.key]}`}
                                  className="pointer-events-auto absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--accent-secondary)]/75 bg-[var(--background)]/92 shadow-[0_0_0_1px_rgba(167,139,250,0.18)]"
                                  style={{
                                      left: `${box.boxAnchorX - box.boxLeft}px`,
                                      top: `${box.boxAnchorY - box.boxTop}px`,
                                      touchAction: "none",
                                  }}
                                  onPointerDown={(event) => startDrag(event, box.key, "move-box-anchor")}
                              >
                                  <span className="h-1.5 w-1.5 rounded-[1px] bg-[var(--accent-secondary)]/85" />
                              </button>
                              <button
                                  type="button"
                                  aria-label={`Move elbow for ${F3_FORENSIC_EDITOR_LABELS[box.key]}`}
                                  className="pointer-events-auto absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--accent-secondary)]/75 bg-[var(--background)]/92 shadow-[0_0_0_1px_rgba(167,139,250,0.18)]"
                                  style={{
                                      left: `${box.elbowX - box.boxLeft}px`,
                                      top: `${box.elbowY - box.boxTop}px`,
                                      touchAction: "none",
                                  }}
                                  onPointerDown={(event) => startDrag(event, box.key, "move-elbow")}
                              >
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-secondary)]/85" />
                              </button>
                          </div>
                      );
                  })
                : null}
        </div>
    );
}
