# SecureLearning — Ultimate Homepage Plan
> Living document. Updated iteratively. No code written until all decisions are locked.

---

## Status Tracker

| # | Section | Status | Decision |
|---|---------|--------|----------|
| ① | Hero | � Locked | Headline + badge decided |
| ② | Social Proof Bar | � Locked | University logo marquee |
| ③ | Problem Statement | 🟢 Locked | - |
| ④ | Feature Showcase | � Locked | Hybrid visuals per feature |
| ⑤ | How It Works | � In Discussion | Q4 open |
| ⑥ | Metrics Strip | 🟢 Locked | - |
| ⑦ | Security / Compliance | 🔴 Pending | Q6 (keep or cut) open |
| ⑧ | Final CTA | 🔴 Pending | Q5 (CTA wording) open |

> 🟢 Locked · 🟡 In Discussion · 🔴 Pending

---

## Open Questions

| ID | Topic | Status |
|----|---------------|----------|
| **Q1** | Hero headline — challenge/hook vs outcome statement | ✅ **Locked** |
| **Q2** | Social proof — stat strip vs invented company logos | ✅ **Locked** |
| **Q3** | Feature visuals — AI-generated UI mocks vs abstract/diagrammatic | ✅ **Locked** |
| **Q4** | How It Works layout — horizontal stepper vs vertical timeline | � **Discussing now** |
| **Q5** | CTA wording — "Request Early Access" vs "Get a Demo" / "Schedule a Call" | ✅ **Locked** |
| **Q6** | Section ⑦ (Security/Compliance) — keep or cut? | ✅ **Locked** |

---

## Section Blueprints

---

### ① HERO *(keep, upgrade)*

**Goal:** Instant hook. Communicate the value proposition immediately.

**Layout:** Keep DarkVeil background, existing radial glow, spacing and structure. Upgrade copy only.

#### Eyebrow badge *(optional — try in render, cut if it clutters)*
> `Simulate · Remediate · Repeat` — small `.tag` pill above H1

#### Headline *(locked ✅)*
> **Make your people unphishable.**

#### Subheadline *(locked ✅)*
> *Because generic awareness training doesn't change behavior. SecureLearning simulates real attacks, trains by role, and measures what actually changes.*

#### CTAs *(locked)*
- `Request Early Access` — primary button (purple glow)
- `See How It Works` — secondary button (scrolls to §⑤)

#### Social nudge under CTAs *(locked)*
Small muted line: `Trusted by security-conscious teams` — no logos, just text credibility hint before §②.

---

### ② SOCIAL PROOF BAR *(new)*

**Goal:** Fast credibility signal right below the hero fold.

**Layout:** Slim full-bleed horizontal strip, subtle top/bottom gradient borders.

**Decision ✅:** Infinite auto-scroll marquee strip with real institutional logos on repeat.

**Logos (from brief):** Universidade de Aveiro · IEETA · LASI → looped with spacing

**Label above the strip** *(exact wording TBD during build, candidates below)*:
- *"Developed in partnership with"* ← preferred
- *"Built at"*
- *"Backed by"*

**Style:** Logos greyscaled, soft fade masks on left/right edges, constant slow scroll. No pause on hover (optional).

> Stats strip dropped — overlaps with §⑥ Metrics Strip.

---

### ③ PROBLEM STATEMENT *(new — locked)*

**Goal:** Make the visitor nod. Name the pain before the product.

**Layout:** Wide centered block, editorial typographic feel.

**Big quote:**
> *"94% of all cyberattacks begin with a phishing email."*
> — IBM Security Report

**Three pain-point callouts below** (icon + one-liner):
- 🎯 Generic awareness training doesn't change behavior
- ⏱️ Employees forget what they learned in 2 weeks
- 📊 Security teams have no way to measure real risk reduction

---

### ④ FEATURE SHOWCASE *(new)*

**Goal:** Show what SecureLearning *does* — without overwhelming.

**Layout:** Alternating left/right rows (text + visual mock), like Linear or Supabase. Generous padding between rows.

**Feature 1 — Phishing Simulations**
- Headline: *Launch, simulate, catch — automatically.*
- Body: Design email templates, schedule campaigns, segment by department. When someone clicks, the platform catches it instantly and kicks off remediation — no manual intervention needed.
- Pills: `Campaign Designer` · `Credential-safe capture` · `Click/time metrics`
- Visual ✅: **Static screenshot of the Campaigns dashboard**  — stat cards + campaign table with status badges.
- 🎨 **Design decision:** Browser mockup with **3D perspective tilt**. Copy sits flat on the right, tilted window on the left. CSS **counter animations** on the stat numbers (count up from 0 on scroll-in). Optional: pulsing glow on the `Scheduled` status badge.


**Feature 2 — Targeted Training (LMS)**
- Headline: *Training that knows who you are.*
- Body: Not everyone needs the same lesson. SecureLearning assigns role-based video modules and quizzes based on department, risk profile, and past simulation results.
- Pills: `Role-based learning paths` · `Video modules + exams` · `LDAP/AD import`
- Visual ✅: **Profile stats / risk dashboard** — risk level score, graphs, achievements. Tells the personalization story visually even in its current static state.
- 🎨 **Design decision:** Same 3D tilt browser mockup treatment as F1. Sides swap — copy on the left, tilted window on the right.
- 📌 *Placeholder for now. Replace with admin group-assignment view (showing different courses mapped to different departments) when that screen is built.*

**Feature 3 — Just-in-Time Remediation**
- Headline: *Teach at the moment of failure.*
- Body: The second someone falls for a simulated phish, they see exactly what happened and why — then they complete a short remediation module before returning to their workflow.
- Pills: `Inline feedback` · `Immediate training trigger` · `Exam-gated completion`
- Visual ✅: ✨ **Animated flow diagram** — a dark `.surface` card containing 6 sequential "state nodes" connected by animated lines.
- 🎨 **Design decision:** **Flat layout** — no 3D tilt. Standard `Reveal` fade-up on scroll. The animated diagram is the hero.
- **Node sequence:** `📧 Phish clicked` → `🎣 Caught` → `💬 Inline feedback` → `📚 Training assigned` → `✅ Exam passed` → `🔒 Complete`
- **Animation mechanic:** On scroll-in, nodes activate one by one with staggered delay. Each node glows (purple accent pulse), then a connecting line draws from it to the next node (`scaleX: 0 → 1`). Whole sequence loops with a pause between cycles. Pure CSS `keyframes` + JS interval — no external library.
- **Node style:** Small pill/badge per step — icon + label. Active state: glowing purple border + brighter text. Inactive: muted, dimmed. Connecting lines: thin, purple gradient fill.
- 📌 *User skeptical of this approach — if it doesn't look premium in execution, replace with a tilted video mockup of the remediation flow (once that feature is fully built).*

---

### ⑤ HOW IT WORKS *(new)*

**Goal:** Demystify the product in 4 steps.

**Layout ✅ Locked:** 4-card row (1×4 on desktop, 2×2 on tablet, 1-column on mobile). Each card is a self-contained `.surface` tile.

**Card anatomy (each step):**
- Large icon at the top (thematic, ~32px, purple tint) — representing the action of that step
- Glowing numbered badge (①②③④) — small, sits beside or below the icon  
- Step title in bold
- 2-line description (muted)

**Step icons (TBD during build, these are the themes):**
1. 🏢 **Import your org** — users/org icon. Connect via LDAP/AD or CSV. Tag users by role, department, and risk profile.
2. 🎣 **Design your campaign** — email/template icon. Choose templates, set lure types, schedule waves, segment by group.
3. 🚀 **Launch & monitor** — dashboard/chart icon. Real-time tracking of clicks, credentials, time-to-click.
4. 📈 **Review & improve** — trend/report icon. Export KPIs, see susceptibility trends, auto-assign follow-up training.

**Connector animation:** A thin horizontal line runs between the cards with a purple gradient fill that animates `scaleX: 0 → 1` on scroll-into-view, giving a sense of sequential progress. Each card stagger-reveals with ~0.15s delay.

---

### ⑥ METRICS STRIP *(new — locked)*

**Goal:** Numbers that create conviction.

**Layout:** Dark `.surface` card, 4 animated counters in a row.

| Metric | Value |
|--------|-------|
| Avg phishing detection rate improvement | **+67%** |
| Training completion after remediation | **94%** |
| Simulations per campaign | **Unlimited** |
| Time to first campaign | **< 15 min** |

---

### ⑦ "BUILT WITH TRUST IN MIND" *(new — locked ✅)*

**Goal:** Address enterprise buyer trust concerns through *product design decisions*, not certifications.

**Section eyebrow label:** `Designed for enterprise security teams`

**Layout:** 4 cards in a 1×4 row on desktop (matching §⑤ rhythm). Same `.surface` tile style.

- 🔒 **No real credential storage** — Safe simulation engine isolates all phishing landing pages
- 👥 **Role-based access control** — Fine-grained permissions across your entire organization
- 📋 **Audit-grade reporting** — Export CSV/PDF evidence for compliance reviews
- 🏢 **Multi-tenant architecture** — One platform, full isolation between organizations

---

### ⑧ FINAL CTA *(new)*

**Goal:** Conversion. Bottom of the funnel.

**Layout:** Full-bleed, purple radial gradient background (mirroring hero energy).

**Headline *(locked ✅)*:**
> *Ready to stop guessing about your security posture?*

**Sub-copy:**
> *SecureLearning gives you the tools to train employees, simulate threats, and measure what actually changes.*

**Buttons (Q5 — pending):**
- Primary: `Request Early Access` / `Get a Demo` / TBD
- Secondary: `Explore the Docs` → links to `/docs`

---

## Design System Notes *(apply globally)*

| Element | Approach |
|---------|----------|
| **Spacing** | Generous — sections breathe like Linear |
| **Dividers** | Subtle gradient fades or thin `rgba(167,139,250,0.18)` borders |
| **Animations** | `Reveal` (fade-up on scroll) + staggered children for grids |
| **Typography** | Big section headlines `3xl–5xl`, muted sub-copy |
| **Cards** | `.surface` style: `#18151c` bg, purple-tinted border |
| **Feature pills** | `.tag` style: `rgba(124,58,237,0.12)` bg, `#a78bfa` text |
| **Colors** | Keep existing palette — no changes |
| **Hero bg** | Keep DarkVeil — no changes |

---

## Q1 — Hero Headline ✅ Locked

**Decision:** `"Make your people unphishable."` as H1.
**Optional:** `Simulate · Remediate · Repeat` badge above it — include during build, cut if it clutters the moment of impact.