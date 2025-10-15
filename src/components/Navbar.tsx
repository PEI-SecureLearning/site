"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";

const links = [
  { href: "/", label: "Home" },
  { href: "/journey", label: "Journey" },
  { href: "https://peisecurelearning.github.io/docs", label: "Docs", external: true },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[rgba(167,139,250,0.12)] bg-[rgba(12,10,15,0.72)] backdrop-blur-md transition-colors duration-300"
      data-scrolled={isScrolled}
    >
      <nav className="page-width flex items-center justify-between gap-6 py-5">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          SecureLearning
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <a
          href="https://github.com/PEI-SecureLearning"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(167,139,250,0.35)] text-[var(--foreground)] transition hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
          aria-label="SecureLearning on GitHub"
        >
          <FaGithub className="text-xl" aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
