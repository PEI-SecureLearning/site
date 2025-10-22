"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { DocMeta } from "@/lib/docs";

interface JourneyTimelineProps {
  items: DocMeta[];
}

export function JourneyTimeline({ items }: JourneyTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = window.scrollY + containerRect.top;
      const containerHeight = container.offsetHeight;
      const containerBottom = containerTop + containerHeight;

      const anchorRaw = window.scrollY + window.innerHeight * 0.6;
      const anchor = Math.min(
        Math.max(anchorRaw, containerTop),
        containerBottom
      );

      const total = Math.max(containerBottom - containerTop, 1);
      const newProgress = (anchor - containerTop) / total;
      setProgress(newProgress);

      const activated: number[] = [];
      itemRefs.current.forEach((element, index) => {
        if (!element) return;
        const elementRect = element.getBoundingClientRect();
        const elementCenter =
          window.scrollY + elementRect.top + elementRect.height / 2;
        // Small epsilon to avoid rounding issues on some devices
        if (anchor + 1 >= elementCenter) {
          activated.push(index);
        }
      });

      // If scrolled to page bottom, ensure all items are marked active and progress filled
      const doc = document.documentElement;
      const atPageBottom =
        Math.ceil(window.scrollY + window.innerHeight) >=
        Math.floor(doc.scrollHeight);
      if (atPageBottom) {
        setVisibleIndexes(itemRefs.current.map((_, i) => i));
        setProgress(1);
      } else {
        setVisibleIndexes(activated);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 overflow-hidden md:block">
        <div className="h-full w-full rounded-full bg-[rgba(167,139,250,0.12)]" />
        <div
          className="absolute left-0 top-0 h-full w-full origin-top rounded-full bg-gradient-to-b from-[#7c3aed] via-[#a78bfa] to-[#7c3aed] transition-transform duration-500 ease-out"
          style={{ transform: `scaleY(${progress})` }}
        />
      </div>
      <ol className="space-y-12">
        {items.map((doc, index) => {
          const active = visibleIndexes.includes(index);
          const isEven = index % 2 === 0;
          const alignmentClass = isEven
            ? "md:flex-row"
            : "md:flex-row-reverse";

          return (
            <li
              key={doc.slug}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              data-index={index}
              className={`group relative transition-opacity duration-500 ${active ? "opacity-100" : "opacity-40"}`}
            >
              <span
                className={`absolute left-1/2 top-1/2 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition md:inline-flex ${active ? "border-[#a78bfa] bg-[rgba(167,139,250,0.45)]" : "border-[rgba(167,139,250,0.12)] bg-[rgba(12,10,15,0.85)]"}`}
              />
              <div className={`md:flex md:items-center md:gap-10 ${alignmentClass}`}>
                <div className="hidden md:block md:flex-1" />
                <div className="md:flex-1">
                  <div className={`relative mt-6 md:mt-0 ${isEven ? "md:pl-12" : "md:pr-12"}`}>
                    <div
                      className={`rounded-3xl border px-6 py-6 shadow-lg transition duration-500 ${active ? "border-[rgba(167,139,250,0.35)] bg-[rgba(24,21,28,0.95)]" : "border-[rgba(167,139,250,0.12)] bg-[rgba(18,16,23,0.8)]"}`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                          <span>{`Step ${index + 1}`}</span>
                          <time className="text-[rgba(237,237,237,0.65)]">{doc.updated}</time>
                        </div>
                        <h2
                          className={`text-xl font-semibold transition ${active ? "text-[var(--foreground)]" : "text-[rgba(237,237,237,0.45)]"}`}
                        >
                          {doc.title}
                        </h2>
                        <p
                          className={`text-sm leading-relaxed transition ${active ? "text-[rgba(237,237,237,0.78)]" : "text-[rgba(237,237,237,0.45)]"}`}
                        >
                          {doc.summary}
                        </p>
                        <Link
                          href={`/journey/${doc.slug}`}
                          className={`inline-flex w-fit items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-[rgba(124,58,237,0.18)] text-[var(--accent-secondary)] hover:bg-[rgba(167,139,250,0.24)]" : "pointer-events-none bg-[rgba(24,21,28,0.6)] text-[rgba(161,161,170,0.4)]"}`}
                          aria-disabled={!active}
                          tabIndex={active ? 0 : -1}
                        >
                          Read document ↗
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

