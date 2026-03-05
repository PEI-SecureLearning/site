# Problem Statement Section — Design Notes

## Quote Treatment

### "94%" as the hero number
- **"94%"** — Massive (`~8rem`+), gradient fill (purple accent → cool white). The emotional gut punch.
- **"of all cyberattacks..."** — Underneath, smaller (`text-xl`/`text-2xl`), lighter weight, more muted. It's the caption.
- **"— IBM Security Report"** — Tiny, all-caps, widest tracking, possibly monospace for contrast. Fades in last.
- Reading cadence: **SHOCK → context → credibility**

### Decorative quote marks
- Oversized `"` in accent color, positioned as visual elements (slightly outside text flow)
- Think high-end magazine pullquote — the `"` is a fixture, not punctuation
- Alternative: keep inline but style them in the gradient accent color

## Cards → Typographic Blocks

### Direction A — Invisible cards (PREFERRED)
- No visible background/border at all
- Slim vertical accent bar on the left (2–3px, purple gradient)
- Left-aligned text, not centered
- The *absence* of chrome is the luxury signal
- The scroll mechanic IS the design element

### Direction B — Full-width glass strips
- Stretch to `max-w-5xl`, very thin (`py-5`)
- Hair-thin top edge gradient (purple → transparent)
- Left-aligned, `text-2xl`, `font-medium`
- Like frosted glass panes being placed one on top of the other

## Animation & Rhythm

### Quote entrance (top → bottom, in scroll order)
1. "94%" fades + scales in first. Alone. Owns the screen for a beat.
2. Rest of sentence appears a beat later. Lighter, subordinate.
3. Attribution slides in last, quietly.

### Card entrance
- Gentle 40–60px upward drift (NOT 400px — that's toast notification energy)
- Slow fade-in — cards should *materialize*, not *arrive*
- Each card settles with a satisfying deceleration

### Depth effects for already-stacked cards
- Subtle scale-down (0.97 per level)
- Slight blur (1.5px per level)

## Timing / Black Screen Fix

- ~~Position quote higher in viewport~~ → **NO**, keep position
- **Start the quote ascent earlier** — it should begin appearing while the marquee is still partially visible, not after the page goes fully dark
- Reduce the scroll % before the quote begins to show

## Background / Atmosphere
- Subtle ambient glow: faint radial gradient in center of viewport (soft purple, 3–5% opacity)
- Just enough to signal "something lives here" before text appears
