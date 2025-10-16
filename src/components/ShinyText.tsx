"use client";

import styles from "./ShinyText.module.css";

import type { ReactNode } from "react";

interface ShinyTextProps {
  text?: string;
  children?: ReactNode;
  disabled?: boolean;
  speed?: number; // seconds per cycle
  className?: string;
}

type ShineStyle = React.CSSProperties & { [key in `--shine-duration`]?: string };

export default function ShinyText({ text, children, disabled = false, speed = 5, className = "" }: ShinyTextProps) {
  const inlineStyle: ShineStyle = { "--shine-duration": `${speed}s` };
  const content = children ?? text ?? "";
  return (
    <span className={`${styles.wrapper} ${className}`}>
      <span className={styles.base}>{content}</span>
      {!disabled && (
        <span className={styles.shinyText} style={inlineStyle} aria-hidden>
          {content}
        </span>
      )}
    </span>
  );
}


