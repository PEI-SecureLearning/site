"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import {
    F3_INTERVENTION_SLAB_REVIEW_LINE,
    F3_INTERVENTION_SLAB_SIMULATION_LINE,
} from "./f3PhishingCopy";

const BRAND_WORDMARK_SRC = "/assets/branding/logo-horizontal.png";
const BRAND_ICON_SRC = "/assets/branding/logo-icon.png";
const SLAB_SHAPE_EASE = "power4.out";
const SLAB_CONTENT_EASE = "power3.out";
const SLAB_DOCK_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SLAB_DOCK_TRAVEL_START = 0.7;
const SLAB_DOCK_TRAVEL_MID_DURATION = 0.38;
const SLAB_DOCK_TRAVEL_END_DURATION = 0.62;
const SLAB_DOCK_SETTLE_NUDGE_DURATION = 0.12;
const SLAB_DOCK_SETTLE_RETURN_DURATION = 0.26;
const SLAB_DOCK_FALLBACK_WIDTH = 56;
const SLAB_DOCK_FALLBACK_HEIGHT = 56;
const SLAB_PRE_DOCK_HOLD_DURATION = 2.15;

function getDockTileRadius(width: number, height: number) {
    return Math.max(6, Math.round(Math.min(width, height) * 0.18));
}

export type F3RemediationSlabDebugStage =
    | "seam"
    | "grow"
    | "logo"
    | "headline"
    | "copy"
    | "hold"
    | "docked";

export default function F3RemediationSlab({
    prefersReducedMotion,
    placement = "overlay",
    animateOnMount = true,
    debugStage,
    handoffActive = false,
    enableDocking = false,
    dockTargetSelectors,
    onDockComplete,
}: Readonly<{
    prefersReducedMotion: boolean;
    placement?: "overlay" | "inline";
    animateOnMount?: boolean;
    debugStage?: F3RemediationSlabDebugStage;
    handoffActive?: boolean;
    enableDocking?: boolean;
    dockTargetSelectors?: readonly string[];
    onDockComplete?: () => void;
}>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const slabRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const dockMetalRef = useRef<HTMLDivElement>(null);
    const dockGlossRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const copyRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const scrim = scrimRef.current;
        const glow = glowRef.current;
        const slab = slabRef.current;
        const content = contentRef.current;
        const logo = logoRef.current;
        const icon = iconRef.current;
        const dockMetal = dockMetalRef.current;
        const dockGloss = dockGlossRef.current;
        const heading = headingRef.current;
        const copy = copyRef.current;
        if (
            !root ||
            !scrim ||
            !glow ||
            !slab ||
            !content ||
            !logo ||
            !icon ||
            !dockMetal ||
            !dockGloss ||
            !heading ||
            !copy
        ) {
            return;
        }

        const ctx = gsap.context(() => {
            const resolveDockTarget = () => {
                if (dockTargetSelectors == null || dockTargetSelectors.length === 0) {
                    return null;
                }

                for (const selector of dockTargetSelectors) {
                    const element = globalThis.document.querySelector<HTMLElement>(selector);
                    if (!element) continue;

                    const rect = element.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        return element;
                    }
                }

                return null;
            };

            if (debugStage !== undefined) {
                if (debugStage === "docked") {
                    const dockTarget = resolveDockTarget();
                    const dockRect = dockTarget?.getBoundingClientRect();
                    const dockWidth = dockRect?.width ?? SLAB_DOCK_FALLBACK_WIDTH;
                    const dockHeight = dockRect?.height ?? SLAB_DOCK_FALLBACK_HEIGHT;
                    const dockRadius = getDockTileRadius(dockWidth, dockHeight);

                    gsap.set(scrim, { opacity: 0 });
                    gsap.set(glow, {
                        opacity: 0.18,
                        scale: 0.32,
                        x:
                            dockRect == null
                                ? 0
                                : dockRect.left +
                                  dockRect.width / 2 -
                                  globalThis.window.innerWidth / 2,
                        y:
                            dockRect == null
                                ? 0
                                : dockRect.top +
                                  dockRect.height / 2 -
                                  globalThis.window.innerHeight / 2,
                    });
                    gsap.set(slab, {
                        opacity: 1,
                        x:
                            dockRect == null
                                ? 0
                                : dockRect.left +
                                  dockRect.width / 2 -
                                  globalThis.window.innerWidth / 2,
                        y:
                            dockRect == null
                                ? 0
                                : dockRect.top +
                                  dockRect.height / 2 -
                                  globalThis.window.innerHeight / 2,
                        width: dockWidth,
                        height: dockHeight,
                        maxWidth: dockWidth,
                        paddingTop: 0,
                        paddingRight: 0,
                        paddingBottom: 0,
                        paddingLeft: 0,
                        borderRadius: dockRadius,
                        clipPath: `inset(0% 0% 0% 0% round ${dockRadius}px)`,
                        scale: 0.95,
                        filter: "blur(0px)",
                    });
                    gsap.set(dockMetal, { opacity: 1 });
                    gsap.set(dockGloss, { opacity: 1 });
                    gsap.set(content, { gap: 0 });
                    gsap.set(logo, { opacity: 0, scale: 0.92, y: -10, filter: "blur(12px)" });
                    gsap.set([heading, copy], { opacity: 0, y: -14, filter: "blur(18px)" });
                    gsap.set(icon, { opacity: 1, scale: 1, filter: "blur(0px)" });
                    return;
                }

                gsap.set(scrim, { opacity: 1 });
                gsap.set(glow, {
                    opacity:
                        debugStage === "seam"
                            ? 0.42
                            : debugStage === "grow"
                              ? 0.62
                              : 0.78,
                    scale: debugStage === "seam" ? 0.96 : 1,
                });

                if (debugStage === "seam") {
                    gsap.set(slab, {
                        opacity: 0.92,
                        x: 0,
                        y: 6,
                        scaleX: 0.085,
                        scaleY: 0.16,
                        clipPath: "inset(5% 49.3% 5% 49.3% round 999px)",
                        borderRadius: "999px",
                        filter: "blur(16px)",
                    });
                    gsap.set([logo, heading, copy], { opacity: 0, y: -10, filter: "blur(8px)" });
                    gsap.set(icon, { opacity: 0, scale: 0.8, filter: "blur(8px)" });
                    gsap.set([dockMetal, dockGloss], { opacity: 0 });
                    return;
                }

                if (debugStage === "grow") {
                    gsap.set(slab, {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scaleX: 1,
                        scaleY: 1,
                        clipPath: "inset(0% 0% 0% 0% round 28px)",
                        borderRadius: "28px",
                        filter: "blur(0px)",
                    });
                    gsap.set([logo, heading, copy], { opacity: 0, y: -10, filter: "blur(8px)" });
                    gsap.set(icon, { opacity: 0, scale: 0.8, filter: "blur(8px)" });
                    gsap.set([dockMetal, dockGloss], { opacity: 0 });
                    return;
                }

                gsap.set(slab, {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    clipPath: "inset(0% 0% 0% 0% round 28px)",
                    borderRadius: "28px",
                    filter: "blur(0px)",
                });
                gsap.set(logo, {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                });
                gsap.set(icon, {
                    opacity: 0,
                    scale: 0.82,
                    filter: "blur(8px)",
                });
                gsap.set([dockMetal, dockGloss], { opacity: 0 });
                gsap.set(heading, {
                    opacity:
                        debugStage === "logo"
                            ? 0
                            : 1,
                    y: debugStage === "logo" ? -10 : 0,
                    filter: debugStage === "logo" ? "blur(8px)" : "blur(0px)",
                });
                gsap.set(copy, {
                    opacity:
                        debugStage === "copy" || debugStage === "hold"
                            ? 1
                            : 0,
                    y:
                        debugStage === "copy" || debugStage === "hold"
                            ? 0
                            : -10,
                    filter:
                        debugStage === "copy" || debugStage === "hold"
                            ? "blur(0px)"
                            : "blur(8px)",
                });
                return;
            }

            if (prefersReducedMotion || !animateOnMount) {
                gsap.set(scrim, { opacity: 1 });
                gsap.set(glow, { opacity: 1, scale: 1 });
                gsap.set(slab, {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    clipPath: "inset(0% 0% 0% 0% round 28px)",
                    borderRadius: "28px",
                    filter: "blur(0px)",
                });
                gsap.set([logo, heading, copy], { opacity: 1, y: 0, filter: "blur(0px)" });
                gsap.set(icon, { opacity: 0, scale: 0.82, filter: "blur(8px)" });
                gsap.set([dockMetal, dockGloss], { opacity: 0 });
                return;
            }

            gsap.set(scrim, { opacity: 0 });
            gsap.set(glow, { opacity: 0, scale: 0.92 });
            gsap.set(slab, {
                opacity: 0.82,
                x: 0,
                y: 6,
                scaleX: 0.085,
                scaleY: 0.16,
                clipPath: "inset(5% 49.3% 5% 49.3% round 999px)",
                borderRadius: "999px",
                filter: "blur(16px)",
                transformOrigin: "50% 50%",
                force3D: true,
            });
            gsap.set([logo, heading, copy], {
                opacity: 0,
                y: -10,
                filter: "blur(8px)",
                force3D: true,
            });
            gsap.set(icon, {
                opacity: 0,
                scale: 0.78,
                filter: "blur(10px)",
                force3D: true,
            });
            gsap.set([dockMetal, dockGloss], { opacity: 0, force3D: true });

            const resolveDockTargetForAnimation = () => {
                if (!enableDocking) {
                    return null;
                }
                return resolveDockTarget();
            };

            const tl = gsap.timeline();
            tl.to(
                scrim,
                {
                    opacity: 1,
                    duration: 0.42,
                    ease: "power2.out",
                },
                0
            )
                .to(
                    glow,
                    {
                        opacity: 0.78,
                        scale: 1,
                        duration: 0.82,
                        ease: "power2.out",
                    },
                    0.14
                )
                .to(
                    slab,
                    {
                        opacity: 0.94,
                        scaleY: 1,
                        clipPath: "inset(0.8% 47.6% 0.8% 47.6% round 999px)",
                        duration: 0.68,
                        ease: SLAB_SHAPE_EASE,
                    },
                    0.26
                )
                .to(
                    slab,
                    {
                        opacity: 1,
                        y: 0,
                        scaleX: 1,
                        clipPath: "inset(0% 0% 0% 0% round 28px)",
                        borderRadius: "28px",
                        filter: "blur(0px)",
                        duration: 0.84,
                        ease: SLAB_SHAPE_EASE,
                    },
                    0.46
                )
                .to(
                    logo,
                    {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.6,
                        ease: SLAB_CONTENT_EASE,
                    },
                    1.06
                )
                .to(
                    heading,
                    {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.68,
                        ease: SLAB_CONTENT_EASE,
                    },
                    1.22
                )
                .to(
                    copy,
                    {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.72,
                        ease: SLAB_CONTENT_EASE,
                    },
                    1.4
                );

            if (placement === "overlay" && enableDocking) {
                tl.add(() => {
                    const dockTarget = resolveDockTargetForAnimation();
                    if (!dockTarget) {
                        onDockComplete?.();
                        return;
                    }

                    const slabRect = slab.getBoundingClientRect();
                    const targetRect = dockTarget.getBoundingClientRect();
                    const dockRadius = getDockTileRadius(targetRect.width, targetRect.height);
                    const deltaX =
                        targetRect.left +
                        targetRect.width / 2 -
                        (slabRect.left + slabRect.width / 2);
                    const deltaY =
                        targetRect.top +
                        targetRect.height / 2 -
                        (slabRect.top + slabRect.height / 2);
                    const travelArcLift = deltaY <= 0 ? -16 : 16;
                    const travelMidX = deltaX * 0.58;
                    const travelMidY = deltaY * 0.38 + travelArcLift;

                    gsap.set(slab, {
                        width: slabRect.width,
                        height: slabRect.height,
                        maxWidth: slabRect.width,
                        paddingTop: globalThis.getComputedStyle(slab).paddingTop,
                        paddingRight: globalThis.getComputedStyle(slab).paddingRight,
                        paddingBottom: globalThis.getComputedStyle(slab).paddingBottom,
                        paddingLeft: globalThis.getComputedStyle(slab).paddingLeft,
                    });

                    const dockTl = gsap.timeline({
                        onComplete: () => {
                            onDockComplete?.();
                        },
                    });

                    dockTl
                        .to(
                            [heading, copy],
                            {
                                opacity: 0,
                                y: -14,
                                filter: "blur(18px)",
                                duration: 0.34,
                                stagger: 0.04,
                                ease: "power2.out",
                            },
                            0
                        )
                        .to(
                            logo,
                            {
                                opacity: 0,
                                scale: 0.92,
                                y: -10,
                                filter: "blur(12px)",
                                duration: 0.28,
                                ease: "power2.out",
                            },
                            0.02
                        )
                        .to(
                            icon,
                            {
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                                duration: 0.34,
                                ease: "power2.out",
                            },
                            0.12
                        )
                        .to(
                            dockMetal,
                            {
                                opacity: 1,
                                duration: 0.36,
                                ease: "power2.out",
                            },
                            0.14
                        )
                        .to(
                            dockGloss,
                            {
                                opacity: 1,
                                duration: 0.42,
                                ease: "power2.out",
                            },
                            0.22
                        )
                        .to(
                            scrim,
                            {
                                opacity: 0,
                                duration: 0.52,
                                ease: "power2.out",
                            },
                            0.06
                        )
                        .to(
                            glow,
                            {
                                opacity: 0.24,
                                scale: 0.44,
                                duration: 0.5,
                                ease: SLAB_DOCK_EASE,
                            },
                            0.14
                        )
                        .to(
                            slab,
                            {
                                width: targetRect.width,
                                height: targetRect.height,
                                paddingTop: 0,
                                paddingRight: 0,
                                paddingBottom: 0,
                                paddingLeft: 0,
                                borderRadius: dockRadius,
                                clipPath: `inset(0% 0% 0% 0% round ${dockRadius}px)`,
                                duration: 0.54,
                                ease: SLAB_DOCK_EASE,
                            },
                            0.14
                        )
                        .to(
                            content,
                            {
                                gap: 0,
                                duration: 0.5,
                                ease: "power2.out",
                            },
                            0.14
                        )
                        .to(
                            slab,
                            {
                                x: travelMidX,
                                y: travelMidY,
                                scale: 0.965,
                                duration: SLAB_DOCK_TRAVEL_MID_DURATION,
                                ease: "power2.in",
                            },
                            SLAB_DOCK_TRAVEL_START
                        )
                        .to(
                            glow,
                            {
                                opacity: 0.11,
                                scale: 0.24,
                                x: travelMidX,
                                y: travelMidY,
                                duration: SLAB_DOCK_TRAVEL_MID_DURATION,
                                ease: "power2.in",
                            },
                            SLAB_DOCK_TRAVEL_START
                        )
                        .to(
                            slab,
                            {
                                x: deltaX,
                                y: deltaY,
                                scale: 0.95,
                                duration: SLAB_DOCK_TRAVEL_END_DURATION,
                                ease: "power4.out",
                            },
                            ">+=0.01"
                        )
                        .to(
                            glow,
                            {
                                opacity: 0.04,
                                scale: 0.14,
                                x: deltaX,
                                y: deltaY,
                                duration: SLAB_DOCK_TRAVEL_END_DURATION,
                                ease: "power4.out",
                            },
                            "<"
                        )
                        .to(
                            slab,
                            {
                                y: deltaY + 2.8,
                                scale: 0.936,
                                duration: SLAB_DOCK_SETTLE_NUDGE_DURATION,
                                ease: "power2.in",
                            },
                            ">+=0.005"
                        )
                        .to(
                            glow,
                            {
                                opacity: 0.01,
                                scale: 0.08,
                                duration: SLAB_DOCK_SETTLE_NUDGE_DURATION,
                                ease: "power2.in",
                            },
                            "<"
                        )
                        .to(
                            dockGloss,
                            {
                                opacity: 0.72,
                                duration: SLAB_DOCK_SETTLE_NUDGE_DURATION,
                                ease: "power2.in",
                            },
                            "<"
                        );
                }, `+=${SLAB_PRE_DOCK_HOLD_DURATION}`);
            }
        }, root);

        return () => {
            ctx.revert();
        };
    }, [
        animateOnMount,
        debugStage,
        dockTargetSelectors,
        enableDocking,
        onDockComplete,
        placement,
        prefersReducedMotion,
    ]);

    useLayoutEffect(() => {
        const slab = slabRef.current;
        const glow = glowRef.current;
        const icon = iconRef.current;
        const dockMetal = dockMetalRef.current;
        const dockGloss = dockGlossRef.current;
        if (
            !handoffActive ||
            placement !== "overlay" ||
            prefersReducedMotion ||
            !slab ||
            !glow ||
            !icon ||
            !dockMetal ||
            !dockGloss
        ) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.timeline()
                .to(
                    slab,
                    {
                        opacity: 0.78,
                        scaleX: 0.94,
                        scaleY: 0.3,
                        borderRadius: 16,
                        filter: "blur(6px)",
                        duration: 0.14,
                        ease: "power1.out",
                    },
                    0
                )
                .to(
                    slab,
                    {
                        opacity: 0,
                        scaleX: 0.88,
                        scaleY: 0.18,
                        borderRadius: 18,
                        filter: "blur(16px)",
                        duration: 0.34,
                        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                    },
                    0.12
                )
                .to(
                    icon,
                    {
                        opacity: 0.78,
                        scale: 0.92,
                        filter: "blur(3px)",
                        duration: 0.14,
                        ease: "power1.out",
                    },
                    0
                )
                .to(
                    icon,
                    {
                        opacity: 0,
                        scale: 0.88,
                        filter: "blur(8px)",
                        duration: 0.32,
                        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                    },
                    0.12
                )
                .to(
                    [dockMetal, dockGloss],
                    {
                        opacity: 0.42,
                        duration: 0.1,
                        ease: "power1.out",
                    },
                    0
                )
                .to(
                    [dockMetal, dockGloss],
                    {
                        opacity: 0,
                        duration: 0.28,
                        ease: "power1.out",
                    },
                    0.1
                )
                .to(
                    glow,
                    {
                        opacity: 0.026,
                        scale: 0.1,
                        duration: 0.1,
                        ease: "power1.out",
                    },
                    0
                )
                .to(
                    glow,
                    {
                        opacity: 0.01,
                        scale: 0.06,
                        duration: 0.3,
                        ease: "power1.out",
                    },
                    0.1
                );
        }, slab);

        return () => ctx.revert();
    }, [handoffActive, placement, prefersReducedMotion]);

    const slabMarkup = (
        <div
            ref={rootRef}
            className={
                placement === "inline"
                    ? "relative isolate flex min-h-[24rem] w-full items-center justify-center overflow-hidden rounded-[34px] border border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.12),transparent_34%),linear-gradient(180deg,#0a080e_0%,#0c0a0f_100%)] px-4 py-8 md:min-h-[26rem] md:px-6"
                    : "pointer-events-none fixed inset-0 z-[50] flex items-center justify-center px-4 md:px-6"
            }
            aria-labelledby="f3-intervention-slab-heading"
            aria-describedby="f3-intervention-slab-copy"
        >
            <div
                ref={scrimRef}
                className={
                    placement === "inline"
                        ? "absolute inset-0 bg-[#06040a]/12"
                        : "absolute inset-0 bg-[#06040a]/18"
                }
                aria-hidden
            />
            <div
                ref={glowRef}
                className={`absolute left-1/2 top-1/2 ${placement === "inline" ? "h-[20rem] w-[min(36rem,88vw)]" : "h-[24rem] w-[min(40rem,90vw)]"} -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl`}
                style={{
                    background:
                        "radial-gradient(circle at 50% 34%, rgba(167,139,250,0.1) 0%, rgba(124,58,237,0.06) 28%, rgba(10,8,16,0) 70%)",
                }}
                aria-hidden
            />
            <article
                ref={slabRef}
                className="relative z-[1] w-[min(40rem,calc(100vw-1.5rem))] max-w-[40rem] overflow-hidden rounded-[28px] px-6 py-7 md:px-10 md:py-8"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(10,8,16,0.06) 0%, rgba(8,6,14,0.14) 38%, rgba(4,3,8,0.3) 100%)",
                    backdropFilter: "blur(18px) saturate(112%)",
                    WebkitBackdropFilter: "blur(18px) saturate(112%)",
                    boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)",
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        borderRadius: "inherit",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.075)",
                        maskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, black 14%, rgba(0,0,0,0.28) 58%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, black 14%, rgba(0,0,0,0.28) 58%, transparent 100%)",
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        borderRadius: "inherit",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 22%, rgba(16,12,24,0.05) 54%, rgba(3,2,7,0.24) 100%)",
                    }}
                />
                <div
                    ref={dockMetalRef}
                    className="pointer-events-none absolute inset-0"
                    style={{
                        opacity: 0,
                        borderRadius: "inherit",
                        background:
                            "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(184,198,214,0.08) 18%, rgba(76,82,96,0.14) 42%, rgba(18,16,24,0.06) 66%, rgba(6,4,10,0.18) 100%)",
                        boxShadow:
                            "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -10px 18px rgba(10,8,16,0.18)",
                    }}
                />
                <div
                    ref={dockGlossRef}
                    className="pointer-events-none absolute inset-0"
                    style={{
                        opacity: 0,
                        borderRadius: "inherit",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0) 48%), linear-gradient(122deg, rgba(255,255,255,0) 22%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.02) 58%, rgba(255,255,255,0) 76%)",
                        mixBlendMode: "screen",
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-x-[10%] top-[-52%] h-40 rounded-full blur-3xl"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 62%, rgba(255,255,255,0.055) 0%, rgba(167,139,250,0.03) 34%, rgba(255,255,255,0) 72%)",
                    }}
                />
                <div
                    ref={contentRef}
                    className="relative z-[1] flex h-full flex-col items-center justify-center gap-3.5 text-center md:gap-4"
                >
                    <div ref={logoRef} className="flex justify-center">
                        <Image
                            src={BRAND_WORDMARK_SRC}
                            alt="SecureLearning"
                            width={220}
                            height={44}
                            className="h-[2.2rem] w-auto max-w-full object-contain opacity-[0.9] brightness-110 contrast-95 md:h-[2.45rem]"
                            priority
                        />
                    </div>
                    <div
                        ref={iconRef}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    >
                        <Image
                            src={BRAND_ICON_SRC}
                            alt="SecureLearning icon"
                            width={42}
                            height={42}
                            className="h-[2rem] w-auto object-contain opacity-[0.96] brightness-110 contrast-105 md:h-[2.15rem]"
                            priority
                        />
                    </div>
                    <div className="flex max-w-[30rem] flex-col gap-3">
                        <h2
                            ref={headingRef}
                            id="f3-intervention-slab-heading"
                            className="text-balance text-[1.5rem] font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-[1.7rem] md:text-[1.95rem]"
                        >
                            {F3_INTERVENTION_SLAB_SIMULATION_LINE}
                        </h2>
                        <p
                            ref={copyRef}
                            id="f3-intervention-slab-copy"
                            className="mx-auto max-w-[30rem] text-pretty text-[0.94rem] font-normal leading-[1.58] tracking-[-0.012em] text-white/58 sm:text-[0.98rem] md:text-[1.02rem]"
                        >
                            {F3_INTERVENTION_SLAB_REVIEW_LINE}
                        </p>
                    </div>
                </div>
            </article>
        </div>
    );

    if (placement === "inline") {
        return slabMarkup;
    }

    if (globalThis.document === undefined) return null;

    return createPortal(slabMarkup, globalThis.document.body);
}
