# SecureLearning Homepage — Implementation Handoff

> Read `ultimateHomepage.md` first — that's the full plan with all copy, section decisions, and design intentions. This file only adds context and pointers you won't find there.

---

## What This Is

SecureLearning is a multi-tenant cybersecurity training & awareness platform — think phishing simulations + a role-based LMS. This is its **public marketing microsite**, built by a university team.

The homepage is being redesigned from a basic school-project page into a proper **SaaS product landing page** — the kind you'd see from Supabase, Linear, or Vercel. The goal is to make it feel like a real product being sold to enterprise security teams, not a student project. That means world-class copy, premium animations, and a high-converting page structure. The copy has been carefully crafted — don't change it.

---

## The Codebase

Next.js app (App Router), TypeScript, Tailwind CSS. The homepage lives at `src/app/page.tsx`. Replace its contents entirely — the new page is 8 sections stacked.

There are already some useful components in `src/components/` worth knowing about: a `Reveal` fade-up scroll component, a `ShinyText` shimmer effect, an `ElectricBorder` glow component, and the `DarkVeil` generative canvas that powers the hero background. The CSS design tokens and utility classes (buttons, cards, spacing) are all in `src/app/globals.css` — lean on those.

---

## Ready-Made Components to Use

Don't build from scratch where polished components already exist:

**§② Logo Marquee:**
Use the **ReactBits Logo Loop** — https://reactbits.dev/animations/logo-loop
Pop the university logos in (Universidade de Aveiro, IEETA, LASI), set them to greyscale. Done.

---

## Assets That Need to Exist Before Building

Place all assets in `public/assets/` before starting §④:

- **University logos** — already in `public/assets/logos_external/` (`ua-logo.svg`, `ieeta-logo.png`, `lasi-logo.png`). The UA SVG fill should be set to white/light so it's visible on the dark background. The colored PNGs can be desaturated + brightened with a CSS filter (`grayscale(1) brightness(1.4)`) — no need to edit the files.
- **F1 screenshot** — clean screenshot of the Campaigns dashboard (stat cards + campaign table). Save to `public/assets/`.
- **F2 screenshot** — screenshot of the profile stats / risk dashboard. Save to `public/assets/`.

If screenshots aren't ready when you reach §④, leave dimensioned placeholder boxes and move on.

---

## Suggested Build Order

Top to bottom, one section at a time.

1. **Hero** — copy + CTA wording only, keep everything else as-is
2. **Logo Marquee** — quick win with the ReactBits component
3. **Problem Statement** — static, just layout and typography
4. **How It Works** — 4-card grid with animated step connector
5. **Built with Trust** — near-identical structure to How It Works
6. **Metrics Strip** — number counters animating on scroll
7. **Feature Showcase** — most complex, save for last
8. **Final CTA** — cosmetic, fast
