import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureLearning – Cybersecurity Awareness Platform",
  description:
    "Safe phishing simulations, just-in-time training, and measurable awareness improvement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <div className="flex min-h-screen flex-col bg-[var(--background)]">
          <Navbar />
          <main className="flex-1">
            <div className="page-width section-spacing">{children}</div>
          </main>
          <footer className="border-t border-[rgba(167,139,250,0.12)] bg-[#121017] py-10 text-sm text-[var(--muted)]">
            <div className="page-width flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2 text-[0.95rem]">
                <p className="text-[var(--foreground)]">
                  © 2025 SecureLearning | PEI — Universidade de Aveiro.
                </p>
                <p>Advisors: João Almeida · Luís Batista · Filipe Gomes</p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/PEI-SecureLearning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(167,139,250,0.18)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)] opacity-85 hover:opacity-100"
                >
                  GitHub Organization
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
