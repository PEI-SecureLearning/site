"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";

/* ─── Feature data ─────────────────────────────────────────── */

const features = [
    {
        id: "f1",
        badge: "Phishing Simulations",
        headline: "Launch, simulate, catch — automatically.",
        body: "Design email templates, schedule campaigns, segment by department. When someone clicks, the platform catches it instantly and kicks off remediation — no manual intervention needed.",
        pills: ["Campaign Designer", "Credential-safe capture", "Click/time metrics"],
        image: "/assets/f1-campaigns.png",
        imageAlt: "Phishing Campaigns dashboard",
        flip: false, // text right, image left
    },
    {
        id: "f2",
        badge: "Targeted Training (LMS)",
        headline: "Training that knows who you are.",
        body: "Not everyone needs the same lesson. SecureLearning assigns role-based video modules and quizzes based on department, risk profile, and past simulation results.",
        pills: ["Role-based learning paths", "Video modules + exams", "LDAP/AD import"],
        image: "/assets/f2-training.png",
        imageAlt: "User risk profile dashboard",
        flip: true, // text left, image right
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
}: {
    children: React.ReactNode;
    flip: boolean;
}) {
    return (
        <div
            className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[#0e0b14] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            style={{
                perspective: "1000px",
                transform: flip
                    ? "rotateY(-8deg) rotateX(3deg)"
                    : "rotateY(8deg) rotateX(3deg)",
                transformStyle: "preserve-3d",
            }}
        >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-[rgba(167,139,250,0.12)] bg-[#13101a] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <div className="mx-2 flex-1 rounded-md bg-[#1e1828] px-3 py-1 text-center text-[0.65rem] text-[rgba(237,237,237,0.25)]">
                    app.securelearning.io
                </div>
            </div>
            {children}
        </div>
    );
}

/* ─── Main Feature Showcase ─────────────────────────────────── */

export default function FeatureShowcase() {
    return (
        <section id="features" className="full-bleed py-24 md:py-32">
            <div className="mx-auto max-w-[1100px] px-6">
                {/* Features 1 & 2 — alternating 3D tilt layout */}
                <div className="flex flex-col gap-28">
                    {features.map((feature) => (
                        <Reveal key={feature.id}>
                            <div
                                className={`flex flex-col items-center gap-12 lg:flex-row ${feature.flip ? "lg:flex-row-reverse" : ""
                                    }`}
                            >
                                {/* Image side */}
                                <div className="flex flex-1 items-center justify-center">
                                    <BrowserMockup flip={feature.flip}>
                                        <Image
                                            src={feature.image}
                                            alt={feature.imageAlt}
                                            width={1200}
                                            height={750}
                                            className="w-full object-cover object-top"
                                            style={{ maxHeight: "320px" }}
                                        />
                                    </BrowserMockup>
                                </div>

                                {/* Text side */}
                                <div className="flex flex-1 flex-col items-start gap-5">
                                    <span className="tag">{feature.badge}</span>
                                    <h3 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                                        {feature.headline}
                                    </h3>
                                    <p className="text-base leading-relaxed text-[rgba(237,237,237,0.65)]">
                                        {feature.body}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {feature.pills.map((pill) => (
                                            <span key={pill} className="tag text-xs">
                                                {pill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
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
