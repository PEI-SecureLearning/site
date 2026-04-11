"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FaGithub } from "react-icons/fa";

const links = [
  { href: "/journey", label: "Journey" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);
  const pathname = usePathname();
  const search = useSearchParams();

  // Sliding hover pill state
  const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 10);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string, label: string) => {
    if (!mounted) return false;
    if (href.startsWith("/journey")) return pathname?.startsWith("/journey");
    if (href === "/about") return pathname === "/about";
    if (href.startsWith("/coming-soon")) {
      const t = search?.get("t")?.toLowerCase();
      return pathname === "/coming-soon" && t === label.toLowerCase();
    }
    return false;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!navRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = navRef.current.getBoundingClientRect();
    
    setHoverStyle({
      left: rect.left - parentRect.left,
      width: rect.width,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-out border-b ${
        isScrolled
          ? "bg-[rgba(12,10,15,0.75)] backdrop-blur-lg border-[rgba(167,139,250,0.12)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* === LEFT: Logo & Navigation === */}
        <div className="flex items-center gap-8">
          <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-80">
            <Image
              src="/assets/branding/logo-2lines.svg"
              alt="SecureLearning"
              width={140}
              height={44}
              className="h-[2.5rem] w-auto object-contain origin-left transition-transform"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <nav
            ref={navRef}
            onMouseLeave={handleMouseLeave}
            className="relative hidden md:flex items-center space-x-1"
          >
            {/* Magic Sliding Background */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-[rgba(167,139,250,0.08)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                left: `${hoverStyle.left}px`,
                width: `${hoverStyle.width}px`,
                opacity: hoverStyle.opacity,
              }}
            />

            {links.map((link) => {
              const active = isActive(link.href, link.label);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={handleMouseEnter}
                  className={`relative z-10 px-3.5 py-1.5 text-[0.85rem] font-medium transition-colors duration-200 ${
                    active
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[#d4d4d8]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* === RIGHT: Utilities & CTAs === */}
        <div className="flex shrink-0 items-center gap-4">
          
          <a
            href="https://github.com/PEI-SecureLearning"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[0.85rem] font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            aria-label="GitHub Repository"
          >
            <FaGithub className="text-[1.05rem]" aria-hidden="true" />
            <span className="hidden lg:inline-block">Star Us</span>
          </a>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-4 w-[1px] bg-[rgba(255,255,255,0.12)]"></div>

          {/* Auth Mock Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#"
              className="flex h-8 items-center justify-center px-3 text-[0.85rem] font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Sign in
            </Link>
            <Link
              href="#"
              style={{ color: "#0c0a0f" }}
              className="flex h-8 items-center justify-center rounded-full bg-white px-4 text-[0.85rem] font-bold transition-transform hover:scale-105 active:scale-95"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Burger Toggle (Sequenced Animation) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative flex justify-center items-center w-8 h-8 focus:outline-none z-50 ml-2"
            aria-label="Toggle menu"
          >
            {/* Top Bar Wrapper (Y translation) */}
            <span
              className={`absolute transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isMenuOpen ? "translate-y-0 delay-0" : "-translate-y-[6px] delay-[150ms]"
              }`}
            >
              {/* Top Bar (Rotation) */}
              <span
                className={`block w-[22px] h-[1.5px] bg-white transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMenuOpen ? "rotate-45 delay-[150ms]" : "rotate-0 delay-0"
                }`}
              />
            </span>
            
            {/* Middle Bar */}
            <span
              className={`absolute block w-[22px] h-[1.5px] bg-white transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isMenuOpen ? "opacity-0 scale-x-0 delay-0" : "opacity-100 scale-x-100 delay-[150ms]"
              }`}
            />
            
            {/* Bottom Bar Wrapper (Y translation) */}
            <span
              className={`absolute transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isMenuOpen ? "translate-y-0 delay-0" : "translate-y-[6px] delay-[150ms]"
              }`}
            >
              {/* Bottom Bar (Rotation) */}
              <span
                className={`block w-[22px] h-[1.5px] bg-white transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMenuOpen ? "-rotate-45 delay-[150ms]" : "rotate-0 delay-0"
                }`}
              />
            </span>
          </button>

        </div>
      </div>
    </header>

      {/* === MOBILE OVERLAY === */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-[rgba(12,10,15,0.95)] backdrop-blur-2xl flex flex-col justify-between px-6 py-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          isMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-6 mt-4">
          {links.map((link, i) => {
            const active = isActive(link.href, link.label);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  // Defer the state update to allow Next.js routing interceptors to catch the native click
                  // before the parent container instantly locks pointer events.
                  setTimeout(() => setIsMenuOpen(false), 50);
                }}
                className={`text-xl font-medium border-b border-[rgba(255,255,255,0.06)] pb-4 transition-all duration-500 ${
                  isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                } ${active ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-white"}`}
                style={{ transitionDelay: `${i * 50 + 100}ms` }}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className={`flex flex-col gap-4 pb-4 transition-all duration-500 delay-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link
            href="#"
            className="flex h-12 w-full items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] text-[0.95rem] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.05)] active:scale-[0.98]"
          >
            Sign in
          </Link>
          <Link
            href="#"
            style={{ color: "#0c0a0f" }}
            className="flex h-12 w-full items-center justify-center rounded-full bg-white text-[0.95rem] font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </>
  );
}
