import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                SecureLearning
              </Link>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 md:gap-6">
                {[
                  { href: "/", label: "Home" },
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/contact", label: "Contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </header>
          <main className="flex-1">
            <div className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
              {children}
            </div>
          </main>
          <footer className="border-t border-slate-200 bg-white/90 py-8 text-sm text-slate-600">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
              <p>© 2025 SecureLearning – Universidade de Aveiro</p>
              <p>Advisors: João Almeida · Luís Batista · Filipe Gomes</p>
              <p>
                Educational, defensive purpose. Minimal data collected and
                deleted on request.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
