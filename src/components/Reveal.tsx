"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
}

export default function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    element.classList.add("fade-up");
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
