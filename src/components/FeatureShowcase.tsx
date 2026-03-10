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
    browserRef,
}: Readonly<{
    children: React.ReactNode;
    flip: boolean;
    browserRef: React.RefObject<HTMLDivElement | null>;
}>) {
    return (
        <div
            className="mx-auto w-full max-w-[1040px] px-4 md:px-0 xl:max-w-[1160px]"
            style={{ perspective: "1200px" }}
        >
            <div
                ref={browserRef}
                className="relative w-full"
                style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: flip ? "right center -300px" : "left center -300px",
                }}
            >
                <div
                    className="pointer-events-none absolute inset-x-[7%] inset-y-[10%] -z-20 rounded-[38px] blur-3xl"
                    style={{
                        background: flip
                            ? "radial-gradient(circle at 78% 32%, rgba(167,139,250,0.16), transparent 42%), radial-gradient(circle at 30% 70%, rgba(124,58,237,0.14), transparent 52%)"
                            : "radial-gradient(circle at 22% 32%, rgba(167,139,250,0.16), transparent 42%), radial-gradient(circle at 70% 70%, rgba(124,58,237,0.14), transparent 52%)",
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-x-[14%] -bottom-10 -z-10 h-20 rounded-full blur-3xl"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 50%, rgba(7,5,12,0.88) 0%, rgba(7,5,12,0.58) 48%, transparent 82%)",
                    }}
                />
                <div
                    className="relative overflow-hidden rounded-[24px] border border-[rgba(167,139,250,0.18)] bg-[#0e0b14]/85 backdrop-blur-2xl"
                    style={
                        {
                            "--feature-browser-rotate-y": `${flip ? -12 : 12}deg`,
                            background:
                                "linear-gradient(180deg, rgba(20,16,30,0.96) 0%, rgba(10,8,16,0.94) 100%)",
                            boxShadow:
                                "0 65px 120px rgba(0,0,0,0.76), 0 18px 40px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.36), inset 0 -24px 60px rgba(0,0,0,0.22)",
                            filter: "saturate(1.08) contrast(1.04)",
                        } as React.CSSProperties
                    }
                >
                    <div
                        className="pointer-events-none absolute inset-0 z-0"
                        style={{
                            background: flip
                                ? "radial-gradient(circle at 82% 26%, rgba(255,255,255,0.07), transparent 18%), radial-gradient(circle at 18% 82%, rgba(124,58,237,0.12), transparent 32%)"
                                : "radial-gradient(circle at 18% 26%, rgba(255,255,255,0.07), transparent 18%), radial-gradient(circle at 82% 82%, rgba(124,58,237,0.12), transparent 32%)",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0 z-10"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.035) 34%, transparent 72%)",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-y-0 z-20 w-[42%]"
                        style={{
                            [flip ? "right" : "left"]: "-8%",
                            background: `linear-gradient(${flip ? "118deg" : "62deg"}, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 16%, rgba(167,139,250,0.03) 28%, transparent 60%)`,
                            opacity: 0.34,
                            filter: "blur(10px)",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-[1px] z-20 rounded-[23px]"
                        style={{
                            border: "1px solid rgba(255,255,255,0.045)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/15" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-black/30" />

                    {/* Browser chrome */}
                    <div className="relative z-30 flex items-center gap-2 border-b border-[rgba(167,139,250,0.1)] bg-[linear-gradient(180deg,rgba(23,18,34,0.98)_0%,rgba(16,13,24,0.94)_100%)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_24px_rgba(0,0,0,0.22)]">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                        <div className="mx-3 flex-1 rounded-md border border-white/[0.04] bg-[#181321]/95 px-4 py-1.5 text-center text-[0.7rem] tracking-[0.18em] text-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-10px_18px_rgba(0,0,0,0.18)]">
                            app.securelearning.pt
                        </div>
                    </div>
                    <div className="relative z-0 overflow-hidden border-t border-white/[0.03] shadow-[inset_0_0_90px_rgba(124,58,237,0.06),inset_0_-28px_42px_rgba(0,0,0,0.2)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-white/[0.045] to-transparent" />
                        <div
                            className="pointer-events-none absolute inset-0 z-10"
                            style={{
                                background:
                                    "radial-gradient(130% 95% at 50% 100%, rgba(0,0,0,0.26) 0%, transparent 58%)",
                            }}
                        />
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to provide refs to the map loop
function FeatureBlock({ feature }: Readonly<{ feature: (typeof features)[0] }>) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const browserRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const direction = feature.flip ? 1 : -1;
    const browserJustify = feature.flip ? "justify-end" : "justify-start";
    const cardJustify = feature.flip ? "justify-start" : "justify-end";
    const cardTransformOrigin = feature.flip ? "left center" : "right center";

    useEffect(() => {
        if (!sceneRef.current || !browserRef.current || !cardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.set(browserRef.current, {
                transformPerspective: 1600,
                force3D: true,
            });

            gsap.set(cardRef.current, {
                transformPerspective: 1400,
                transformOrigin: cardTransformOrigin,
                force3D: true,
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sceneRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.1,
                    invalidateOnRefresh: true,
                },
            });

            tl.fromTo(
                browserRef.current,
                {
                    x: direction * 260,
                    y: 140,
                    z: -920,
                    rotateY: direction * -38,
                    rotateX: 26,
                    rotateZ: direction * 8,
                    scale: 0.68,
                    autoAlpha: 0.24,
                },
                {
                    x: direction * 72,
                    y: 14,
                    z: -140,
                    rotateY: direction * -18,
                    rotateX: 13,
                    rotateZ: direction * 2.5,
                    scale: 0.9,
                    autoAlpha: 1,
                    ease: "power2.out",
                    duration: 0.34,
                },
                0
            )
                .to(browserRef.current, {
                    x: direction * 24,
                    y: 0,
                    z: 0,
                    rotateY: direction * -12,
                    rotateX: 8,
                    rotateZ: direction * 0.6,
                    scale: 0.98,
                    ease: "power3.out",
                    duration: 0.2,
                })
                .to(browserRef.current, {
                    x: direction * 18,
                    y: -4,
                    rotateY: direction * -11.5,
                    rotateX: 7.8,
                    rotateZ: direction * 0.25,
                    scale: 0.985,
                    ease: "power1.out",
                    duration: 0.08,
                })
                .to({}, { duration: 0.16 })
                .fromTo(
                    cardRef.current,
                    {
                        autoAlpha: 0,
                        x: direction * -120,
                        y: 30,
                        z: -220,
                        rotateY: direction * 20,
                        rotateX: 4,
                        rotateZ: direction * 3,
                        scale: 0.965,
                    },
                    {
                        autoAlpha: 1,
                        x: direction * -46,
                        y: 0,
                        z: 0,
                        rotateY: direction * 11,
                        rotateX: 2.6,
                        rotateZ: direction * 1.35,
                        scale: 1,
                        ease: "power3.out",
                        duration: 0.22,
                    }
                )
                .to({}, { duration: 0.1 });
        }, sceneRef);

        return () => ctx.revert();
    }, [feature.flip]);

    return (
        <div
            ref={sceneRef}
            className="relative h-[240vh] w-full"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <div
                    className={`absolute inset-0 z-0 flex items-center px-4 pt-[5.75rem] md:px-10 md:pt-[6.75rem] lg:px-14 ${browserJustify}`}
                >
                    <BrowserMockup flip={feature.flip} browserRef={browserRef}>
                        {/* Abstract UI Placeholder */}
                        <div className="relative h-[300px] w-full overflow-hidden bg-gradient-to-b from-[#130f1e] to-[#0a080f] md:h-[500px] lg:h-[700px]">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
                            <div className={`absolute top-1/3 ${feature.flip ? 'left-1/3' : 'right-1/3'} -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[var(--accent-primary)]/10 blur-[100px]`} />
                            {/* Sleek skeleton UI lines */}
                            <div className="absolute inset-x-6 top-6 bottom-6 flex flex-col gap-4 rounded-xl border border-white/5 bg-white/[0.01] p-4 backdrop-blur-sm md:inset-x-12 md:top-12 md:bottom-12 md:gap-6 md:p-8">
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

                <div
                    className={`pointer-events-none absolute inset-0 z-20 flex items-center px-6 pt-[6rem] md:px-16 md:pt-[7rem] lg:px-28 ${cardJustify}`}
                >
                    <div
                        ref={cardRef}
                        className="pointer-events-auto w-[88%] max-w-[400px] md:max-w-[440px] lg:max-w-[470px]"
                        style={{
                            perspective: "1500px",
                            zIndex: 50,
                            filter: `drop-shadow(${direction * 20}px 20px 40px rgba(0,0,0,0.6))`,
                        }}
                    >
                        <div
                            className="relative flex flex-col items-start overflow-hidden rounded-2xl p-8 md:p-10"
                            style={
                                {
                                    "--feature-card-rotate-y": `${feature.flip ? -11 : 11}deg`,
                                    background: "rgba(0, 0, 0, 0.2)",
                                    backdropFilter: "blur(32px)",
                                    WebkitBackdropFilter: "blur(32px)",
                                    boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)",
                                    transformOrigin: "top center",
                                    transformStyle: "preserve-3d",
                                } as React.CSSProperties
                            }
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
                            <div
                                className="pointer-events-none absolute inset-0 rounded-2xl"
                                style={{
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 45%, transparent 100%)",
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
