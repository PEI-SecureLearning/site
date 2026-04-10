"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const features = [
    {
        title: "No real credential storage",
        desc: "Safe simulation engine isolates all phishing landing pages. No real credentials ever touch our servers.",
        textDelay: 0.8,
        lines: (
            <>
                <div className="absolute right-0 top-0 hidden h-full w-[1px] bg-gradient-to-b from-transparent to-[#A78BFA]/30 md:block" />
                <div className="absolute bottom-0 left-0 w-full md:right-[1px] md:w-auto h-[1.5px] bg-gradient-to-r from-transparent to-[#A78BFA]/30 md:to-[#A78BFA]/30 md:from-transparent" />
            </>
        ),
    },
    {
        title: "Role-based access control",
        desc: "Fine-grained permissions across your entire organization.",
        textDelay: 1.6,
        lines: (
            <>
                <div className="absolute bottom-0 left-0 hidden w-full h-[1.5px] bg-gradient-to-r from-[#A78BFA]/30 to-transparent md:block" />
                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#A78BFA]/30 to-transparent md:hidden" />
            </>
        ),
    },
    {
        title: "Audit-grade reporting",
        desc: "Export CSV or PDF evidence in one click. Built for compliance reviews from day one.",
        textDelay: 2.4,
        lines: (
            <>
                <div className="absolute right-0 top-0 hidden h-full w-[1px] bg-gradient-to-b from-[#A78BFA]/30 to-transparent md:block" />
                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#A78BFA]/30 to-transparent md:hidden" />
            </>
        ),
    },
    {
        title: "Multi-tenant architecture",
        desc: "One platform, full isolation between organizations.",
        textDelay: 3.2,
        lines: null,
    },
];

const PURE_FADE_DURATION_MS = 2400;
const FINAL_COPY_DELAY_MS = Math.max(...features.map((feature) => feature.textDelay)) * 1000;
const PIN_RELEASE_DELAY_MS = PURE_FADE_DURATION_MS + FINAL_COPY_DELAY_MS;

export default function TrustSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const pinSentinelRef = useRef<HTMLDivElement>(null);
    const pinFrameRef = useRef<HTMLDivElement>(null);
    const [isTitleVisible, setIsTitleVisible] = useState(false);
    const [isGridActive, setIsGridActive] = useState(false);
    const [hasReleasedPin, setHasReleasedPin] = useState(false);
    const [releasedScrollOffset, setReleasedScrollOffset] = useState(0);
    const [releasedSceneHeight, setReleasedSceneHeight] = useState<number | null>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsTitleVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0,
                // Wait until the top of the section is 55% up from the bottom of the screen
                rootMargin: "0px 0px -55% 0px",
            }
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const sentinel = pinSentinelRef.current;
        if (!sentinel || typeof window === "undefined") return;

        const desktopMedia = window.matchMedia("(min-width: 768px)");
        if (!desktopMedia.matches) {
            setIsGridActive(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.boundingClientRect.top <= 0) {
                    setIsGridActive(true);
                    observer.disconnect();
                }
            },
            { threshold: 0 }
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, []);

    const handleSequenceRelease = useCallback(() => {
        const section = sectionRef.current;
        const pinFrame = pinFrameRef.current;
        if (!section || !pinFrame || typeof window === "undefined") {
            setHasReleasedPin(true);
            return;
        }

        const desktopMedia = window.matchMedia("(min-width: 768px)");
        if (!desktopMedia.matches) {
            setHasReleasedPin(true);
            return;
        }

        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const maxStickyOffset = Math.max(0, section.offsetHeight - pinFrame.offsetHeight);
        const stickyOffset = Math.min(
            Math.max(0, window.scrollY - sectionTop),
            maxStickyOffset
        );
        const alignedStickyOffset =
            Math.round(stickyOffset * (window.devicePixelRatio || 1)) /
            (window.devicePixelRatio || 1);

        setReleasedScrollOffset(alignedStickyOffset);
        setReleasedSceneHeight(pinFrame.offsetHeight + alignedStickyOffset);
        setHasReleasedPin(true);
    }, []);

    useEffect(() => {
        if (!isGridActive || hasReleasedPin) return;

        const releaseTimer = window.setTimeout(() => {
            handleSequenceRelease();
        }, PIN_RELEASE_DELAY_MS);

        return () => window.clearTimeout(releaseTimer);
    }, [handleSequenceRelease, hasReleasedPin, isGridActive]);

    const releasedSectionStyle =
        hasReleasedPin && releasedSceneHeight != null
            ? {
                  height: `${releasedSceneHeight}px`,
                  paddingTop: `${releasedScrollOffset}px`,
                  boxSizing: "border-box" as const,
              }
            : undefined;

    return (
        <section
            className="full-bleed relative overflow-clip"
            ref={sectionRef}
            style={releasedSectionStyle}
        >
            <div ref={pinSentinelRef} aria-hidden className="absolute inset-x-0 top-0 h-px" />

            <div
                ref={pinFrameRef}
                className={hasReleasedPin ? undefined : "md:sticky md:top-0 md:overflow-clip"}
            >
                <div className="mx-auto max-w-[1000px] px-6 py-24 md:min-h-screen md:py-32">
                    <div
                        className={`pure-fade ${isTitleVisible ? "is-visible" : ""}`}
                        style={{ transitionDelay: "0s" }}
                    >
                        <div className="relative mb-8 pb-6 text-center text-balance md:mb-16 md:pb-8">
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#A78BFA]/50 to-transparent" />

                            <h2 className="mt-3 text-3xl font-regular tracking-tight sm:text-4xl md:text-5xl text-white">
                                Designed for <span className="font-medium">enterprise security teams</span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex w-full flex-col md:flex-row">
                        <div className="flex w-full flex-col md:hidden">
                            {features.map((item, index) => (
                                <div key={item.title} className="relative flex flex-col px-8 py-7">
                                    {index < features.length - 1 ? (
                                        <div
                                            className={`pure-fade absolute bottom-0 left-8 right-8 pointer-events-none h-[1.5px] ${isGridActive ? "is-visible" : ""}`}
                                            style={{ transitionDelay: "0s" }}
                                        >
                                            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#A78BFA]/30 to-transparent" />
                                        </div>
                                    ) : null}
                                    <div
                                        className={`pure-fade ${isGridActive ? "is-visible" : ""}`}
                                        style={{ transitionDelay: `${item.textDelay}s` }}
                                    >
                                        <h3 className="mb-2.5 text-[1.1rem] font-medium leading-[1.18] tracking-[-0.02em] text-white/90">
                                            {item.title}
                                        </h3>
                                        <p className="max-w-[22rem] font-light leading-[1.6] text-white/50">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden w-full flex-col md:flex md:w-1/2">
                            {[features[0], features[2]].map((item) => (
                                <div key={item.title} className="relative flex flex-col p-8 md:p-14">
                                    {item.lines && (
                                        <div
                                            className={`pure-fade absolute inset-0 pointer-events-none ${isGridActive ? "is-visible" : ""}`}
                                            style={{ transitionDelay: "0s" }}
                                        >
                                            {item.lines}
                                        </div>
                                    )}
                                    <div
                                        className={`pure-fade ${isGridActive ? "is-visible" : ""}`}
                                        style={{ transitionDelay: `${item.textDelay}s` }}
                                    >
                                        <h3 className="mb-3 text-xl font-medium tracking-wide text-white/90">
                                            {item.title}
                                        </h3>
                                        <p className="font-light leading-relaxed text-white/50">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden w-full flex-col md:flex md:w-1/2">
                            {[features[1], features[3]].map((item) => (
                                <div key={item.title} className="relative flex flex-col p-8 md:p-14">
                                    {item.lines && (
                                        <div
                                            className={`pure-fade absolute inset-0 pointer-events-none ${isGridActive ? "is-visible" : ""}`}
                                            style={{ transitionDelay: "0s" }}
                                        >
                                            {item.lines}
                                        </div>
                                    )}
                                    <div
                                        className={`pure-fade ${isGridActive ? "is-visible" : ""}`}
                                        style={{ transitionDelay: `${item.textDelay}s` }}
                                    >
                                        <h3 className="mb-3 text-xl font-medium tracking-wide text-white/90">
                                            {item.title}
                                        </h3>
                                        <p className="font-light leading-relaxed text-white/50">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {!hasReleasedPin ? (
                <div aria-hidden className="hidden md:block h-[24rem] lg:h-[28rem]" />
            ) : null}
        </section>
    );
}
