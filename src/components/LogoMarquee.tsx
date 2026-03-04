"use client";

import { LogoLoop } from "./LogoLoop";

const logos = [
    {
        src: "/assets/logos_external/ua-logo.svg",
        alt: "Universidade de Aveiro",
        title: "Universidade de Aveiro",
    },
    {
        src: "/assets/logos_external/ieeta-logo.png",
        alt: "IEETA",
        title: "IEETA",
    },
    {
        src: "/assets/logos_external/lasi-logo.png",
        alt: "LASI",
        title: "LASI",
    },
];

export default function LogoMarquee() {
    return (
        <section className="full-bleed relative py-10">
            {/* Top gradient border */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, rgba(167,139,250,0.25) 30%, rgba(167,139,250,0.25) 70%, transparent)",
                }}
                aria-hidden
            />
            {/* Bottom gradient border */}
            <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, rgba(167,139,250,0.25) 30%, rgba(167,139,250,0.25) 70%, transparent)",
                }}
                aria-hidden
            />

            <div className="mx-auto max-w-[1100px] px-6 text-center">
                <p className="mb-6 text-xs font-semibold tracking-[0.22em] uppercase text-[var(--muted)]">
                    Developed in partnership with
                </p>
            </div>

            <LogoLoop
                logos={logos}
                speed={55}
                logoHeight={44}
                gap={80}
                pauseOnHover
                fadeOut
                fadeOutColor="var(--background)"
                className="logo-marquee-filter"
                ariaLabel="Partner institution logos"
            />
        </section>
    );
}
