import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import Navbar from "@/components/Navbar";
import FirefoxNoticeGate from "@/components/FirefoxNoticeGate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureLearning | Cybersecurity Awareness Platform",
  description:
    "Safe phishing simulations, just-in-time training, and measurable awareness improvement.",
  icons: {
    icon: [{ url: "/assets/branding/logo-icon.png", type: "image/png" }],
    shortcut: [{ url: "/assets/branding/logo-icon.png", type: "image/png" }],
    apple: [{ url: "/assets/branding/logo-icon.png", type: "image/png" }],
  },
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
          <FirefoxNoticeGate />
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
