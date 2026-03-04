"use client";

import { LogoLoop } from "./LogoLoop";

const logos = [
    {
        src: "/assets/logos_external/ua-logo.svg",
        alt: "Universidade de Aveiro",
        title: "Universidade de Aveiro",
        href: "https://www.ua.pt/",
    },
    {
        src: "/assets/logos_external/ieeta-logo.png",
        alt: "IEETA",
        title: "IEETA",
        href: "https://www.ieeta.pt/",
    },
    {
        src: "/assets/logos_external/lasi-logo.png",
        alt: "LASI",
        title: "LASI",
        href: "https://lasi-research.pt/",
    },
];

export default function LogoMarquee() {
    return (
        <section className="full-bleed relative pt-0 pb-10">
            <div className="mx-auto max-w-[1100px] px-6 text-center">
                <p className="mb-6 text-xs font-semibold tracking-[0.22em] uppercase text-[var(--muted)]">
                    Developed in partnership with
                </p>
            </div>

            <div className="mx-auto w-full max-w-[1200px] overflow-hidden">
                <LogoLoop
                    logos={logos}
                    // --- CUSTOMIZATION VARIABLES ---
                    speed={50}           // base scroll speed
                    hoverSpeed={20}      // slow down to this speed on hover
                    scaleOnHover={true}  // slightly scale up the hovered logo
                    gap={100}            // space between logos
                    logoHeight={50}      // max height of logos
                    pauseOnHover={false} // whether to completely pause (overrides hoverSpeed)
                    fadeWidth={150}      // distance from edge of this 1100px container where logos fade
                    // -------------------------------
                    fadeOut
                    fadeOutColor="var(--background)"
                    className="logo-marquee-filter mt-4"
                    ariaLabel="Partner institution logos"
                />
            </div>
        </section>
    );
}
