"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

import ElectricBorder from "@/components/ElectricBorder";
import type { DocMeta } from "@/lib/docs";

interface JourneyTimelineProps {
  items: DocMeta[];
}

export function JourneyTimeline({ items }: JourneyTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const phaseRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [progress, setProgress] = useState(0);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [activePhases, setActivePhases] = useState<string[]>([]);

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

      const phaseHits: string[] = [];
      Object.entries(phaseRefs.current).forEach(([phaseName, element]) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const center = window.scrollY + rect.top + rect.height / 2;
        if (anchor + 1 >= center) {
          phaseHits.push(phaseName);
        }
      });

      // If scrolled to page bottom, ensure all items are marked active and progress filled
      const doc = document.documentElement;
      const atPageBottom =
        Math.ceil(window.scrollY + window.innerHeight) >=
        Math.floor(doc.scrollHeight);
      if (atPageBottom) {
        setVisibleIndexes(itemRefs.current.map((_, i) => i));
        setActivePhases(Object.keys(phaseRefs.current));
        setProgress(1);
      } else {
        setVisibleIndexes(activated);
        setActivePhases(phaseHits);
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
          const isMilestone = doc.isMilestone ?? false;
          const showPhaseDivider =
            index === 0 || items[index - 1]?.phase !== doc.phase;
          const milestoneNumber = isMilestone
            ? items
                .slice(0, index + 1)
                .filter((item) => item.isMilestone)
                .length
            : null;
          const alignmentClass = isEven
            ? "md:flex-row"
            : "md:flex-row-reverse";

          return (
            <Fragment key={doc.slug}>
              {showPhaseDivider && (
                <li
                  ref={(el) => {
                    phaseRefs.current[doc.phase] = el;
                  }}
                  aria-hidden="true"
                  className={`relative my-12 flex list-none items-center justify-center transition duration-500 ${
                    activePhases.includes(doc.phase)
                      ? "opacity-100 blur-0"
                      : "opacity-30 blur-[0.5px]"
                  }`}
                >
                  <div className="relative flex w-full items-center justify-center">
                    <div
                      className={`h-px w-full border-t-2 border-dashed transition duration-500 ${
                        activePhases.includes(doc.phase)
                          ? "border-[rgba(124,58,237,0.8)] shadow-[0_0_32px_rgba(124,58,237,0.45)]"
                          : "border-[rgba(124,58,237,0.3)] shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                      }`}
                    />
                    <span
                      className={`absolute rounded-full border px-5 py-1 text-xs font-semibold uppercase tracking-[0.35em] transition duration-500 ${
                        activePhases.includes(doc.phase)
                          ? "border-[rgba(167,139,250,0.65)] bg-[rgba(12,10,15,0.98)] text-[rgba(255,255,255,0.92)] shadow-[0_12px_40px_rgba(18,16,23,0.9)]"
                          : "border-[rgba(167,139,250,0.25)] bg-[rgba(12,10,15,0.78)] text-[rgba(236,236,255,0.5)] shadow-[0_8px_30px_rgba(9,7,12,0.6)]"
                      }`}
                    >
                      {doc.phase}
                    </span>
                  </div>
                </li>
              )}
              <li
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                data-index={index}
                className={`group relative transition-opacity duration-500 ${active ? "opacity-100" : "opacity-40"}`}
              >
                <span
                  className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition md:inline-flex ${
                    isMilestone
                      ? `h-6 w-6 ${active ? "border-[#a78bfa] bg-[rgba(167,139,250,0.6)] shadow-[0_0_12px_rgba(167,139,250,0.5)]" : "border-[rgba(167,139,250,0.3)] bg-[rgba(12,10,15,0.9)]"}`
                      : `h-4 w-4 ${active ? "border-[#a78bfa] bg-[rgba(167,139,250,0.45)]" : "border-[rgba(167,139,250,0.12)] bg-[rgba(12,10,15,0.85)]"}`
                  }`}
                />
                <div className={`md:flex md:items-center md:gap-10 ${alignmentClass}`}>
                  <div className="hidden md:block md:flex-1" />
                  <div className="md:flex-1">
                    <div className={`relative mt-6 md:mt-0 ${isEven ? "md:pl-12" : "md:pr-12"}`}>
                      {isMilestone ? (
                        <ElectricBorder
                          color="var(--accent-secondary)"
                          chaos={0.1}
                          speed={0.5}
                          thickness={1.7}
                          className={`rounded-3xl transition duration-500 ${
                            active
                              ? "shadow-[0_22px_65px_rgba(124,58,237,0.25)]"
                              : "shadow-[0_16px_42px_rgba(124,58,237,0.12)]"
                          }`}
                        >
                          <div
                            className={`rounded-3xl px-8 py-8 transition-colors duration-500 ${
                              active
                                ? "bg-[rgba(24,21,28,0.98)]"
                                : "bg-[rgba(18,16,23,0.88)]"
                            }`}
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                                <span>{milestoneNumber ? `M${milestoneNumber}` : "M"}</span>
                                <time className="text-[rgba(237,237,237,0.68)]">{doc.updated}</time>
                              </div>
                              <h2
                                className={`text-xl font-semibold transition ${active ? "text-[var(--foreground)]" : "text-[rgba(237,237,237,0.45)]"}`}
                              >
                                {doc.title}
                              </h2>
                              <p
                                className={`text-sm leading-relaxed transition ${active ? "text-[rgba(237,237,237,0.8)]" : "text-[rgba(237,237,237,0.48)]"}`}
                              >
                                {doc.summary}
                              </p>
                              <Link
                                href={`/journey/${doc.slug}`}
                                className={`inline-flex w-fit items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-[rgba(124,58,237,0.2)] text-[var(--accent-secondary)] hover:bg-[rgba(167,139,250,0.28)]" : "pointer-events-none bg-[rgba(24,21,28,0.6)] text-[rgba(161,161,170,0.4)]"}`}
                                aria-disabled={!active}
                                tabIndex={active ? 0 : -1}
                              >
                                Read milestone ↗
                              </Link>
                            </div>
                          </div>
                        </ElectricBorder>
                      ) : (
                        <div
                          className={`rounded-3xl border px-6 py-6 shadow-lg transition duration-500 ${
                            active ? "border-[rgba(167,139,250,0.35)] bg-[rgba(24,21,28,0.95)]" : "border-[rgba(167,139,250,0.12)] bg-[rgba(18,16,23,0.8)]"
                          }`}
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
                      )}
                    </div>
                  </div>
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}

