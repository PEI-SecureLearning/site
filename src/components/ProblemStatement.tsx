"use client";

import Reveal from "./Reveal";

const painPoints = [
    {
        icon: "🎯",
        text: "Generic awareness training doesn't change behavior",
    },
    {
        icon: "⏱️",
        text: "Employees forget what they learned in 2 weeks",
    },
    {
        icon: "📊",
        text: "Security teams have no way to measure real risk reduction",
    },
];

export default function ProblemStatement() {
    return (
        <section className="full-bleed py-24 md:py-32">
            <div className="mx-auto max-w-[1100px] px-6">
                <Reveal>
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Big editorial quote */}
                        <blockquote className="mb-4">
                            <p className="text-3xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">
                                &ldquo;94% of all cyberattacks begin with a phishing email.&rdquo;
                            </p>
                            <footer className="mt-4 text-sm font-medium tracking-wide text-[var(--muted)]">
                                — IBM Security Report
                            </footer>
                        </blockquote>

                    </div>
                </Reveal>

                {/* Pain points */}
                <Reveal>
                    <div className="mt-16 grid gap-5 sm:grid-cols-3">
                        {painPoints.map((point) => (
                            <div
                                key={point.text}
                                className="surface flex flex-col items-start gap-4 rounded-2xl p-6"
                            >
                                <span
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(124,58,237,0.12)] text-2xl"
                                    aria-hidden
                                >
                                    {point.icon}
                                </span>
                                <p className="text-base font-medium leading-snug text-[rgba(237,237,237,0.85)]">
                                    {point.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
