"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LightRays from "./effects/LightRays";

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [showRays, setShowRays] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  /* Handle responsive light rays */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize(); // Initial read
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Only run the WebGL rays when the section is in / near viewport */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowRays(true);
          setIsPaused(false);
        } else {
          setShowRays(false);
        }
      },
      { threshold: 0.01, rootMargin: "600px 0px 600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="full-bleed relative isolate overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* ── Top border glow ── */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-28"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(12,10,15,0.56) 0%, rgba(12,10,15,0.14) 56%, transparent 100%)",
        }}
      />

      {/* ── LightRays — single bottom-center source ── */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 z-0"
        aria-hidden
        style={{
          opacity: showRays ? 0.9 : 0,
          transition: "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.68) 24%, black 38%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.68) 24%, black 38%)",
        }}
      >
        <LightRays
          raysOrigin={(isMobile || isTablet) ? "bottom-center-elevated" : "bottom-center"}
          raysColor="#a78bfa"
          raysSpeed={0.45}
          lightSpread={isMobile ? 2.0 : 1.2}
          rayLength={isMobile ? 5.0 : 3.0}
          fadeDistance={isMobile ? 2.5 : 1.0}
          saturation={isMobile ? 1.0 : 0.8}
          followMouse={true}
          mouseInfluence={0.1}
          distortion={0.12}
          isPaused={isPaused}
          hideOrigin={isMobile || isTablet}
          originElementId={isMobile ? "github-logo-anchor" : (isTablet ? "tablet-anchor" : undefined)}
          keepAlive={true}
        />
      </div>

      {/* ── Readability vignette — ensures text pops against rays ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 38%, rgba(12,10,15,0.55) 0%, transparent 70%)",
        }}
      />

      {/* ── Content: CTA in upper portion, footer at base ── */}
      <div className="relative z-10 flex min-h-[inherit] flex-col px-6">
        {/* CTA — positioned in the upper-center area */}
        <div className="flex flex-1 items-center justify-center pt-10 pb-8 md:pt-8">
          <div className="mx-auto flex max-w-[880px] flex-col items-center gap-8 text-center translate-y-3">
            <h2
              className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-[3.75rem]"
              style={{ letterSpacing: "-0.04em" }}
            >
              Ready to stop guessing about your{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #a78bfa 0%, #9B6BFF 45%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                security posture
              </span>
              ?
            </h2>

            <Link href="/coming-soon" className="btn btn-primary">
              Request Early Access
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="relative z-10 pb-8 pt-6 text-[14px] font-light tracking-[0.015em]"
          style={{ color: "rgba(237, 237, 237, 0.45)" }}
        >
          {/* Invisible geometric anchor specifically to track the centralized top point of the footer on Tablet */}
          <div id="tablet-anchor" className="absolute top-8 left-1/2 -translate-x-1/2 h-0 w-0 pointer-events-none" />

          {/* Huly-style layout: CSS Grid orchestrates mobile (1 col) and tablet (2x2), while Desktop uses Flexbox for the wide spread */}
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 justify-items-center gap-y-6 px-8 md:grid-cols-2 md:px-12 lg:flex lg:flex-row lg:items-center lg:justify-between">
            
            {/* 1. Copyright */}
            <div className="order-3 text-center md:order-3 md:justify-self-start md:text-left lg:order-none translate-y-[4px]">
              Copyright © 2026 SecureLearning | PEI
            </div>

            {/* 2. Advisors (Displayed as a subtle horizontal link-style list rather than a single colon string) */}
            <div className="order-2 flex items-center gap-5 md:order-1 md:justify-self-start lg:order-none translate-y-[4px]">
              <span style={{ color: "rgba(237, 237, 237, 0.3)" }}>Advisors</span>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.ieeta.pt/index.php/people/joao-rafael-almeida/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:text-white/80"
                >
                  João Almeida
                </a>
                <span className="transition-colors hover:text-white/80 cursor-default">Luís Batista</span>
                <span className="transition-colors hover:text-white/80 cursor-default">Filipe Gomes</span>
              </div>
            </div>

            {/* 3. GitHub Icon (Small, no bounding box, identical to Huly's social treatment) */}
            <div className="order-1 flex items-center md:order-2 md:justify-self-end lg:order-none translate-y-[4px]">
              <a
                id="github-logo-anchor"
                href="https://github.com/PEI-SecureLearning"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgba(237,237,237,0.45)] transition-colors hover:text-[#a78bfa]"
                aria-label="GitHub Organization"
              >
                {/* SVG for FaGithub to avoid adding direct cross-imports, identical visual output */}
                <svg
                  stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"></path>
                </svg>
              </a>
            </div>

            {/* 4. The Huly-style "Made with passion" sign-off */}
            <div className="order-4 flex items-center relative z-10 group md:order-4 md:justify-self-end lg:order-none">
              <div className="relative w-[80px] h-[80px] flex items-center justify-center -ml-6 -mr-3 -my-6 pointer-events-none">
                <img src="/assets/branding/heart-purple.svg" alt="" className="w-full h-full object-contain opacity-100 drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" />
              </div>
              <span className="translate-y-px bg-gradient-to-r from-[#c4b5fd] via-[rgba(237,237,237,0.6)] to-[rgba(237,237,237,0.4)] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(167,139,250,0.15)] font-normal">
                Built with passion at UAveiro
              </span>
            </div>

          </div>
        </footer>
      </div>
    </section>
  );
}
