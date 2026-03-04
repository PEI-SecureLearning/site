"use client";

import { useEffect, useRef, useState } from "react";

const metrics = [
    {
        id: "detection",
        prefix: "+",
        value: 67,
        suffix: "%",
        label: "Avg phishing detection rate improvement",
    },
    {
        id: "completion",
        prefix: "",
        value: 94,
        suffix: "%",
        label: "Training completion after remediation",
    },
    {
        id: "simulations",
        prefix: "",
        value: null,
        suffix: "",
        label: "Simulations per campaign",
        static: "Unlimited",
    },
    {
        id: "time",
        prefix: "<",
        value: 15,
        suffix: " min",
        label: "Time to first campaign",
    },
];

function Counter({
    prefix,
    value,
    suffix,
    staticText,
    active,
}: {
    prefix: string;
    value: number | null;
    suffix: string;
    staticText?: string;
    active: boolean;
}) {
    const [display, setDisplay] = useState(staticText ?? `${prefix}0${suffix}`);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!active || value === null) return;
        const start = performance.now();
        const duration = 1400;

        const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * value);
            setDisplay(`${prefix}${current}${suffix}`);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [active, value, prefix, suffix]);

    return <span className="tabular-nums">{display}</span>;
}

export default function MetricsStrip() {
    const [active, setActive] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActive(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.4 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="full-bleed py-16 md:py-20">
            <div className="mx-auto max-w-[1100px] px-6">
                <div ref={ref} className="surface rounded-2xl p-10 md:p-14">
                    <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
                        {metrics.map((m) => (
                            <div key={m.id} className="flex flex-col items-center text-center gap-2">
                                <span
                                    className="text-4xl font-bold tracking-tight sm:text-5xl"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    {m.static ? (
                                        m.static
                                    ) : (
                                        <Counter
                                            prefix={m.prefix}
                                            value={m.value}
                                            suffix={m.suffix}
                                            active={active}
                                        />
                                    )}
                                </span>
                                <span className="text-sm text-[rgba(237,237,237,0.55)] leading-snug">
                                    {m.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
