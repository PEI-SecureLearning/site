"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Feature data ─────────────────────────────────────────── */

const features = [
    {
        id: "f1",
        number: "01",
        badge: "Threat Simulation",
        headline: "Expose your vulnerabilities before the attackers do.",
        body: "We don't send obvious, badly-spelled decoys. SecureLearning deploys hyper-realistic, credential-safe phishing campaigns that mirror tomorrow's actual threats. You see precisely who clicks, when they click, and where your actual risk lies. No guesswork. Just data.",
        flip: false,
    },
    {
        id: "f2",
        number: "02",
        badge: "Targeted Training",
        headline: "Stop wasting time on irrelevant videos.",
        body: "Generic security training breeds resentment. We actively map employee behavior to risk profiles, assigning hyper-relevant, surgical 3-minute modules only to the individuals who actually need them. Less downtime, higher retention, stronger compliance.",
        flip: true,
    },
];

/* ─── Animated flow diagram for F3 ─────────────────────────── */

const FLOW_NODES = [
    { icon: "📧", label: "Phish clicked" },
    { icon: "🎣", label: "Caught" },
    { icon: "💬", label: "Inline feedback" },
    { icon: "📚", label: "Training assigned" },
    { icon: "✅", label: "Exam passed" },
    { icon: "🔒", label: "Complete" },
];

function RemediationDiagram() {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [running, setRunning] = useState(false);
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startSequence = () => {
        setActiveIndex(-1);
        setRunning(true);
        let i = 0;
        const tick = () => {
            setActiveIndex(i);
            i++;
            if (i < FLOW_NODES.length) {
                timerRef.current = setTimeout(tick, 450);
            } else {
                // Pause then restart
                timerRef.current = setTimeout(() => {
                    setActiveIndex(-1);
                    timerRef.current = setTimeout(startSequence, 600);
                }, 2400);
            }
        };
        timerRef.current = setTimeout(tick, 300);
    };

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !running) {
                    startSequence();
                }
            },
            { threshold: 0.4 }
        );
        observer.observe(el);
        return () => {
            observer.disconnect();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={sectionRef}
            className="surface mx-auto w-full max-w-2xl rounded-2xl p-8 md:p-10"
        >
            <div className="flex flex-wrap items-center justify-center gap-0">
                {FLOW_NODES.map((node, idx) => (
                    <div key={node.label} className="flex items-center">
                        {/* Node */}
                        <div
                            className="flex flex-col items-center gap-2 transition-all duration-300"
                            style={{ minWidth: "80px" }}
                        >
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition-all duration-300"
                                style={{
                                    borderColor:
                                        idx <= activeIndex
                                            ? "rgba(124,58,237,0.8)"
                                            : "rgba(167,139,250,0.15)",
                                    background:
                                        idx <= activeIndex
                                            ? "rgba(124,58,237,0.18)"
                                            : "rgba(18,16,23,0.6)",
                                    boxShadow:
                                        idx === activeIndex
                                            ? "0 0 18px rgba(124,58,237,0.55)"
                                            : "none",
                                }}
                            >
                                {node.icon}
                            </div>
                            <span
                                className="text-center text-[0.72rem] font-medium leading-tight transition-colors duration-300"
                                style={{
                                    color:
                                        idx <= activeIndex
                                            ? "rgba(237,237,237,0.9)"
                                            : "rgba(237,237,237,0.35)",
                                }}
                            >
                                {node.label}
                            </span>
                        </div>

                        {/* Connector line between nodes */}
                        {idx < FLOW_NODES.length - 1 && (
                            <div className="relative mx-1 h-px" style={{ width: "32px" }}>
                                <div
                                    className="absolute inset-0 origin-left transition-all duration-300"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)",
                                        transform:
                                            idx < activeIndex ? "scaleX(1)" : "scaleX(0)",
                                        transitionDelay: `${idx * 50}ms`,
                                    }}
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{ background: "rgba(167,139,250,0.12)" }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>


        </div>
    );
}

/* ─── Browser mockup wrapper ────────────────────────────────── */

function BrowserMockup({
    children,
    flip,
    triggerRef,
}: {
    children: React.ReactNode;
    flip: boolean;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}) {
    const defaultContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = triggerRef || defaultContainerRef;
    const mockupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                mockupRef.current,
                {
                    rotateY: flip ? -25 : 25,
                    rotateX: 20,
                    rotateZ: flip ? 4 : -4,
                    y: 200,
                    z: -400,
                    scale: 0.9,
                    opacity: 0,
                },
                {
                    rotateY: flip ? -5 : 5,
                    rotateX: 3,
                    rotateZ: 0,
                    y: 0,
                    z: 0,
                    scale: 0.95,
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%", // Animates in as you see it
                        end: "top top",   // Finishes perfectly as the screen pins
                        scrub: 1.5,
                    },
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [flip, containerRef]);

    return (
        <div
            ref={triggerRef ? undefined : defaultContainerRef}
            className="w-full max-w-[900px] xl:max-w-[1024px] mx-auto px-6 md:px-0" // Added more buffer and slightly smaller widths
            style={{ perspective: "2500px" }}
        >
            <div
                ref={mockupRef}
                className="relative overflow-hidden w-full rounded-[24px] border border-[rgba(167,139,250,0.15)] bg-[#0e0b14]/80 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)]"
                style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: flip ? "right center -300px" : "left center -300px",
                }}
            >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-[rgba(167,139,250,0.08)] bg-[#13101a]/90 px-5 py-4">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <div className="mx-3 flex-1 rounded-md border border-[rgba(255,255,255,0.02)] bg-[#1a1625] px-4 py-1.5 text-center text-[0.7rem] tracking-wide text-[rgba(237,237,237,0.3)] shadow-inner">
                        app.securelearning.pt
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}

// Helper to provide refs to the map loop
function FeatureBlock({ feature }: { feature: typeof features[0] }) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Animate the card arriving *after* the browser pins
    useEffect(() => {
        if (!triggerRef.current || !cardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cardRef.current,
                {
                    opacity: 0,
                    x: feature.flip ? -150 : 150,
                    y: 80,
                    rotateY: feature.flip ? 15 : -15,
                    rotateX: 10,
                    scale: 0.9,
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotateY: 0,
                    rotateX: 0,
                    scale: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: triggerRef.current,
                        start: "top top", // Card fades in exactly when the trigger hits the top of the screen (the pin point)
                        end: "+=60%", // Smooth fade in over 60% of viewport scrolling while pinned
                        scrub: 1.5,
                    }
                }
            );
        }, triggerRef);
        return () => ctx.revert();
    }, [feature.flip]);

    return (
        <div
            ref={triggerRef}
            className="relative w-full h-[200vh]" /* Pinned scroll block height */
        >
            {/* Sticky Container - Center stage wrapper */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-0 px-4 md:px-12">

                {/* The 3D Mockup - Huge Background Canvas (Rendered First / Behind) */}
                {/* 
                    Added a deliberate `mt-[8vh]` (margin-top) vertical offset to the absolute centering. 
                    This pulls the "pinned center" point lower on the screen so the top of the browser 
                    perfectly clears the site navigation header when it finishes animating.
                */}
                <div className={`w-full absolute top-1/2 -translate-y-1/2 mt-[8vh] ${feature.flip ? 'right-0 md:-right-32' : 'left-0 md:-left-32'} z-0`}>
                    <BrowserMockup flip={feature.flip} triggerRef={triggerRef}>
                        {/* Abstract UI Placeholder */}
                        <div className="relative h-[300px] md:h-[500px] lg:h-[700px] w-full bg-gradient-to-b from-[#130f1e] to-[#0a080f] overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
                            <div className={`absolute top-1/3 ${feature.flip ? 'left-1/3' : 'right-1/3'} -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[var(--accent-primary)]/10 blur-[100px]`} />
                            {/* Sleek skeleton UI lines */}
                            <div className="absolute inset-x-6 top-6 bottom-6 md:inset-x-12 md:top-12 md:bottom-12 border border-white/5 rounded-xl bg-white/[0.01] p-4 md:p-8 flex flex-col gap-4 md:gap-6 backdrop-blur-sm">
                                <div className="w-1/3 h-4 md:h-6 rounded-md bg-white/5" />
                                <div className="w-full h-px bg-white/5" />
                                <div className="flex gap-4">
                                    <div className="w-1/4 h-24 md:h-32 rounded-lg bg-white/5" />
                                    <div className="w-1/4 h-24 md:h-32 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20" />
                                    <div className="w-2/4 h-24 md:h-32 rounded-lg bg-white/5" />
                                </div>
                                <div className="w-full flex-1 rounded-lg bg-white/5 mt-4" />
                            </div>
                        </div>
                    </BrowserMockup>
                </div>

                {/* Foreground Card Wrapper - Flex layouts keeps Y centered avoiding GSAP translate conflicts (Rendered Second / In Front) */}
                <div className={`absolute inset-0 pointer-events-none flex items-center ${feature.flip ? 'justify-start pl-6 md:pl-12 lg:pl-24' : 'justify-end pr-6 md:pr-12 lg:pr-24'} z-20`}>
                    <div
                        ref={cardRef}
                        className="w-[95%] sm:w-[85%] md:w-[450px] lg:w-[500px] pointer-events-auto shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                        style={{ perspective: "1500px", zIndex: 50 }}
                    >
                        {/* Perfect match to Problem Statement Cards */}
                        <div
                            className="rounded-2xl flex flex-col items-start p-8 md:p-10 relative overflow-hidden"
                            style={{
                                background: "rgba(0, 0, 0, 0.2)",
                                backdropFilter: "blur(32px)",
                                WebkitBackdropFilter: "blur(32px)",
                                boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)",
                                transformOrigin: "top center",
                            }}
                        >
                            {/* Inner border gradient */}
                            <div
                                className="absolute inset-0 rounded-2xl pointer-events-none"
                                style={{
                                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                                    maskImage: "linear-gradient(90deg, black 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                                    WebkitMaskImage: "linear-gradient(90deg, black 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                                    borderRadius: "1rem", // Force perfectly rounded borders even under WebKit mask composite
                                }}
                            />

                            {/* Chapter Marker */}
                            <div className="mb-6 flex items-center gap-4 relative">
                                <div className="h-px w-8 bg-[var(--accent-primary)] opacity-80" />
                                <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--accent-primary)]">
                                    {feature.number} — {feature.badge}
                                </span>
                            </div>

                            {/* Headline */}
                            <h3 className="mb-4 text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl relative">
                                {feature.headline}
                            </h3>

                            {/* Body */}
                            <p className="text-base md:text-lg leading-relaxed text-[rgba(237,237,237,0.65)] relative">
                                {feature.body}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Feature Showcase ─────────────────────────────────── */

export default function FeatureShowcase() {
    return (
        <section id="features" className="full-bleed py-24 md:py-32">
            <div className="mx-auto max-w-[1400px]">
                {/* Features 1 & 2 — cinematic scrollytelling layout */}
                <div className="flex flex-col">
                    {features.map((feature) => (
                        <FeatureBlock key={feature.id} feature={feature} />
                    ))}

                    {/* Feature 3 — flat, centered, animated diagram */}
                    <Reveal>
                        <div className="flex flex-col items-center gap-10 text-center">
                            <div className="flex flex-col items-center gap-5 max-w-xl">
                                <span className="tag">Just-in-Time Remediation</span>
                                <h3 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                                    Teach at the moment of failure.
                                </h3>
                                <p className="text-base leading-relaxed text-[rgba(237,237,237,0.65)]">
                                    The second someone falls for a simulated phish, they see
                                    exactly what happened and why — then they complete a short
                                    remediation module before returning to their workflow.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {["Inline feedback", "Immediate training trigger", "Exam-gated completion"].map(
                                        (pill) => (
                                            <span key={pill} className="tag text-xs">
                                                {pill}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="w-full">
                                <RemediationDiagram />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
