"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** `lift` = farther upward travel + slower transition than default fade-up */
  motion?: "default" | "lift" | "fade";
}

export default function Reveal({
  children,
  className,
  delay = 0,
  motion = "default",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const isLift = motion === "lift";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      isLift
        ? {
            /* Only fire when the block overlaps the vertical middle of the viewport */
            threshold: 0.12,
            rootMargin: "-32% 0px -32% 0px",
          }
        : {
            threshold: 0.2,
            rootMargin: "0px 0px -5% 0px",
          }
    );

    const motionClass = 
      motion === "lift" ? "fade-up-lift" : 
      motion === "fade" ? "pure-fade" : 
      "fade-up";
    element.classList.add(motionClass);
    observer.observe(element);

    return () => observer.disconnect();
  }, [motion]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
