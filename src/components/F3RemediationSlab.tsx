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

export default function F3RemediationSlab({
    prefersReducedMotion,
    placement = "overlay",
    animateOnMount = true,
}: Readonly<{
    prefersReducedMotion: boolean;
    placement?: "overlay" | "inline";
    animateOnMount?: boolean;
}>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const slabRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const copyRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const scrim = scrimRef.current;
        const glow = glowRef.current;
        const slab = slabRef.current;
        const logo = logoRef.current;
        const heading = headingRef.current;
        const copy = copyRef.current;
        if (!root || !scrim || !glow || !slab || !logo || !heading || !copy) return;

        const ctx = gsap.context(() => {
            if (prefersReducedMotion || !animateOnMount) {
                gsap.set(scrim, { opacity: 1 });
                gsap.set(glow, { opacity: 1, scale: 1 });
                gsap.set(slab, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
                gsap.set([logo, heading, copy], { opacity: 1, y: 0 });
                return;
            }

            gsap.set(scrim, { opacity: 0 });
            gsap.set(glow, { opacity: 0, scale: 0.9 });
            gsap.set(slab, {
                opacity: 0,
                y: 28,
                scale: 0.945,
                filter: "blur(14px)",
                transformOrigin: "50% 50%",
                force3D: true,
            });
            gsap.set([logo, heading, copy], {
                opacity: 0,
                y: 14,
                force3D: true,
            });

            const tl = gsap.timeline();
            tl.to(
                scrim,
                {
                    opacity: 1,
                    duration: 0.34,
                    ease: "power2.out",
                },
                0
            )
                .to(
                    glow,
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.82,
                        ease: "power2.out",
                    },
                    0
                )
                .to(
                    slab,
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.62,
                        ease: "power3.out",
                    },
                    0.08
                )
                .to(
                    logo,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.36,
                        ease: "power2.out",
                    },
                    0.22
                )
                .to(
                    heading,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.42,
                        ease: "power3.out",
                    },
                    0.28
                )
                .to(
                    copy,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.44,
                        ease: "power3.out",
                    },
                    0.34
                );
        }, root);

        return () => {
            ctx.revert();
        };
    }, [animateOnMount, prefersReducedMotion]);

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
                    className="pointer-events-none absolute inset-0 rounded-[28px]"
                    style={{
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.075)",
                        maskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, black 14%, rgba(0,0,0,0.28) 58%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, black 14%, rgba(0,0,0,0.28) 58%, transparent 100%)",
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0 rounded-[28px]"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 22%, rgba(16,12,24,0.05) 54%, rgba(3,2,7,0.24) 100%)",
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-x-[10%] top-[-52%] h-40 rounded-full blur-3xl"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 62%, rgba(255,255,255,0.055) 0%, rgba(167,139,250,0.03) 34%, rgba(255,255,255,0) 72%)",
                    }}
                />
                <div className="relative z-[1] flex flex-col items-center gap-3.5 text-center md:gap-4">
                    <div ref={logoRef} className="flex justify-center">
                        <Image
                            src={BRAND_WORDMARK_SRC}
                            alt="SecureLearning"
                            width={200}
                            height={40}
                            className="h-8 w-auto max-w-full object-contain opacity-[0.9] brightness-110 contrast-95 md:h-9"
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
