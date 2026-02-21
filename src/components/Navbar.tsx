"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { SiFigma, SiJira } from "react-icons/si";

const links = [
  { href: "/journey", label: "Journey" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 24);
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

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[rgba(167,139,250,0.12)] bg-[rgba(12,10,15,0.72)] backdrop-blur-md transition-colors duration-300"
      data-scrolled={isScrolled}
    >
      <nav className="page-width flex items-center justify-between gap-6 py-5">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/assets/branding/logo-horizontal.png"
            alt="SecureLearning"
            width={230}
            height={46}
            className="h-10 w-auto origin-left scale-125"
            priority
          />
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
          {links.map((link) => {
            const active = isActive(link.href, link.label);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  active
                    ? "inline-flex items-center rounded-full border border-dashed border-[rgba(167,139,250,0.45)] px-3 py-1 text-[var(--foreground)]"
                    : "transition-colors hover:text-[var(--foreground)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/PEI-SecureLearning"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(167,139,250,0.35)] text-[var(--foreground)] transition hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
            aria-label="SecureLearning on GitHub"
          >
            <FaGithub className="text-xl" aria-hidden="true" />
          </a>
          <a
            href="https://www.figma.com/design/FxC3tTWqKSIVrwPGa8WljP/SecureLearning?node-id=15-793&t=s9KOuu8oBwiQxcEY-1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(167,139,250,0.35)] text-[var(--foreground)] transition hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
            aria-label="SecureLearning on Figma"
          >
            <SiFigma className="text-lg" aria-hidden="true" />
          </a>
          <a
            href="https://secure-learning.atlassian.net/jira/software/projects/SL/boards/1/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(167,139,250,0.35)] text-[var(--foreground)] transition hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
            aria-label="SecureLearning on Jira"
          >
            <SiJira className="text-lg" aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  );
}
