"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

const steps = [
    {
        num: "①",
        icon: "🏢",
        title: "Import your org",
        desc: "Connect via LDAP/AD or CSV. Tag users by role, department, and risk profile.",
    },
    {
        num: "②",
        icon: "🎣",
        title: "Design your campaign",
        desc: "Choose templates, set lure types, schedule waves, segment by group.",
    },
    {
        num: "③",
        icon: "🚀",
        title: "Launch & monitor",
        desc: "Real-time tracking of clicks, credentials submitted, and time-to-click.",
    },
    {
        num: "④",
        icon: "📈",
        title: "Review & improve",
        desc: "Export KPIs, see susceptibility trends, and auto-assign follow-up training.",
    },
];

function ConnectorLine() {
    const lineRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = lineRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.style.transform = "scaleX(1)";
                    observer.unobserve(el);
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="absolute top-[2.75rem] left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] hidden h-px lg:block" aria-hidden>
            <div className="absolute inset-0 bg-[rgba(167,139,250,0.1)]" />
            <div
                ref={lineRef}
                className="absolute inset-0 origin-left"
                style={{
                    background: "linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)",
                    transform: "scaleX(0)",
                    transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            />
        </div>
    );
}

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="full-bleed pb-24 md:pb-32">
            <div className="mx-auto max-w-[1100px] px-6">
                <div className="relative">
                    <ConnectorLine />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, i) => (
                            <Reveal key={step.num}>
                                <div
                                    className="surface flex flex-col items-start gap-4 rounded-2xl p-6"
                                    style={{ transitionDelay: `${i * 120}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(124,58,237,0.12)] text-2xl">
                                            {step.icon}
                                        </span>
                                        <span
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--accent-secondary)",
                                                textShadow: "0 0 20px rgba(167,139,250,0.4)",
                                            }}
                                        >
                                            {step.num}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-[var(--foreground)]">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-[rgba(237,237,237,0.6)]">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
