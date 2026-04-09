"use client";

import {
    Fragment,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
} from "react";
import Reveal from "./Reveal";

type MetricItem = {
    id: string;
    label: string;
    static?: string;
    prefix?: string;
    value?: number | null;
    /** When set (and greater than `value`), the number counts down from here to `value`. */
    countFrom?: number;
    suffix?: string;
};

const metrics: MetricItem[] = [
    {
        id: "susceptibility",
        prefix: "~",
        value: 70,
        suffix: "%",
        label: "Susceptibility reduction",
    },
    {
        id: "simulations",
        static: "Unlimited",
        label: "Simulations per campaign",
    },
    {
        id: "time",
        prefix: "<",
        value: 15,
        countFrom: 45,
        suffix: " min",
        label: "To your first campaign",
    },
];

/** Same stops as `--gradient-accent`, reversed (lilac → violet) for contrast with the rest of the page. */
const metricValueGradientStyle: CSSProperties = {
    background:
        "linear-gradient(90deg, #a78bfa 0%, #9b6bff 50%, #7c3aed 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
};

function Counter({
    prefix = "",
    value,
    suffix,
    countFrom,
    active,
}: {
    prefix?: string;
    value: number | null | undefined;
    suffix?: string;
    countFrom?: number;
    active: boolean;
}) {
    const target = value ?? 0;
    const countDown = countFrom !== undefined && countFrom > target;
    const initialNum = countDown ? (countFrom as number) : 0;
    const [display, setDisplay] = useState(
        `${prefix ?? ""}${initialNum}${suffix ?? ""}`
    );
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!active || value === null || value === undefined) return;

        const reduceMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) {
            setDisplay(`${prefix ?? ""}${target}${suffix ?? ""}`);
            return;
        }

        const start = performance.now();
        const duration = 1400;

        const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            let current: number;
            if (countDown && countFrom !== undefined) {
                current = Math.round(countFrom + (target - countFrom) * eased);
            } else {
                current = Math.round(eased * target);
            }
            setDisplay(`${prefix ?? ""}${current}${suffix ?? ""}`);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [active, value, prefix, suffix, countFrom, countDown, target]);

    return <span className="tabular-nums whitespace-nowrap">{display}</span>;
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
            /* Match Reveal `motion="lift"` — start counts when strip hits viewport center band */
            { threshold: 0.12, rootMargin: "-32% 0px -32% 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="full-bleed py-28 md:py-36">
            <div className="mx-auto max-w-[1240px] px-6 md:px-10">
                <Reveal motion="lift">
                    <div
                        ref={ref}
                        className="flex flex-col items-stretch gap-12 md:flex-row md:gap-0"
                    >
                        {metrics.map((m, index) => (
                            <Fragment key={m.id}>
                                {index > 0 ? (
                                    <div
                                        className="hidden w-px shrink-0 self-stretch bg-[rgba(167,139,250,0.15)] md:block"
                                        aria-hidden
                                    />
                                ) : null}
                                <div className="flex flex-1 flex-col items-center justify-start gap-3 text-center md:px-4">
                                    <span
                                        className="inline-block whitespace-nowrap text-4xl font-semibold tracking-[-0.03em] md:text-5xl lg:text-6xl"
                                        style={metricValueGradientStyle}
                                    >
                                        {m.static ? (
                                            m.static
                                        ) : (
                                            <Counter
                                                prefix={m.prefix}
                                                value={m.value}
                                                suffix={m.suffix}
                                                countFrom={m.countFrom}
                                                active={active}
                                            />
                                        )}
                                    </span>
                                    <span className="max-w-[14rem] text-sm font-medium leading-snug text-[rgba(237,237,237,0.50)] md:max-w-none md:text-base">
                                        {m.label}
                                    </span>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
