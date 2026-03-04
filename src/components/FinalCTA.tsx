"use client";

import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="full-bleed relative overflow-hidden py-28 md:py-36">
            {/* Purple radial gradient background */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
                style={{
                    background:
                        "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(124,58,237,0.38) 0%, rgba(12,10,15,0) 70%)",
                }}
            />
            {/* Top border glow */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                aria-hidden
                style={{
                    background:
                        "linear-gradient(90deg, transparent, rgba(167,139,250,0.4) 30%, rgba(167,139,250,0.4) 70%, transparent)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-[720px] px-6 text-center">
                <h2 className="mb-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                    Ready to stop guessing about your{" "}
                    <span
                        className="bg-gradient-to-r from-[#a78bfa] via-[#9B6BFF] to-[#7C3AED] bg-clip-text text-transparent"
                    >
                        security posture?
                    </span>
                </h2>
                <p className="mb-10 text-lg leading-relaxed text-[rgba(237,237,237,0.62)]">
                    SecureLearning gives you the tools to train employees, simulate
                    threats, and measure what actually changes.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/coming-soon" className="btn btn-primary">
                        Request Early Access
                    </Link>
                    <Link href="/docs" className="btn btn-secondary">
                        Explore the Docs
                    </Link>
                </div>
            </div>
        </section>
    );
}
