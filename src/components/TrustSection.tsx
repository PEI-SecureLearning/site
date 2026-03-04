"use client";

import Reveal from "./Reveal";

const cards = [
    {
        icon: "🔒",
        title: "No real credential storage",
        desc: "Safe simulation engine isolates all phishing landing pages. No real credentials ever touch our servers.",
    },
    {
        icon: "👥",
        title: "Role-based access control",
        desc: "Fine-grained permissions across your entire organization — admins, managers, learners.",
    },
    {
        icon: "📋",
        title: "Audit-grade reporting",
        desc: "Export CSV or PDF evidence in one click. Built for compliance reviews from day one.",
    },
    {
        icon: "🏢",
        title: "Multi-tenant architecture",
        desc: "One platform, full isolation between organizations. Your data never co-mingles.",
    },
];

export default function TrustSection() {
    return (
        <section className="full-bleed py-24 md:py-32">
            <div className="mx-auto max-w-[1100px] px-6">
                <Reveal>
                    <div className="mb-16 text-center text-balance">
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Designed for{" "}
                            <span className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">
                                enterprise security teams.
                            </span>
                        </h2>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card, i) => (
                        <Reveal key={card.title}>
                            <div
                                className="surface flex h-full flex-col items-start gap-4 rounded-2xl p-6"
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(124,58,237,0.12)] text-2xl">
                                    {card.icon}
                                </div>
                                <div>
                                    <h3 className="mb-2 font-semibold text-[var(--foreground)]">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-[rgba(237,237,237,0.58)]">
                                        {card.desc}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
