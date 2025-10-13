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
        if (anchor >= elementCenter) {
          activated.push(index);
        }
      });
      setVisibleIndexes(activated);
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
        <div className="h-full w-full bg-slate-200" />
        <div
          className="absolute left-0 top-0 h-full w-full origin-top bg-gradient-to-b from-sky-400 via-sky-500 to-sky-300 transition-transform duration-500 ease-out"
          style={{ transform: `scaleY(${progress})` }}
        />
      </div>
      <ol className="space-y-10">
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
              className={`group relative transition-opacity duration-500 ${active ? "opacity-100" : "opacity-50"}`}
            >
              <span
                className={`absolute left-1/2 top-1/2 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition md:inline-flex ${active ? "border-sky-400 bg-sky-500" : "border-slate-300 bg-slate-100"}`}
              />
              <div
                className={`md:flex md:items-center md:gap-6 ${alignmentClass}`}
              >
                <div className="hidden md:block md:w-1/2" />
                <div className="md:w-1/2">
                  <div
                    className={`relative mt-6 md:mt-0 ${isEven ? "md:pl-12" : "md:pr-12"}`}
                  >
                    <div
                      className={`rounded-2xl border p-6 shadow-sm transition duration-500 ${active ? "border-sky-200 bg-white" : "border-slate-200 bg-slate-50"}`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>{`Step ${index + 1}`}</span>
                          <time>{doc.updated}</time>
                        </div>
                        <h2
                          className={`text-xl font-semibold transition ${active ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {doc.title}
                        </h2>
                        <p
                          className={`text-sm transition ${active ? "text-slate-600" : "text-slate-400"}`}
                        >
                          {doc.summary}
                        </p>
                        <Link
                          href={`/journey/${doc.slug}`}
                          className={`inline-flex w-fit items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-sky-600 text-white hover:bg-sky-700" : "pointer-events-none bg-slate-300 text-slate-500"}`}
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

