"use client";

import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FLEES = 3;
const FLEE_DEBOUNCE_MS = 220;
const FIELD_WIDTH = 300;
/** Approx. height of label + decoy row (used for positioning / bounds) */
const DECOY_BLOCK_HEIGHT = 90;
/** Start puff after this delay (0 = immediate on last hover; was used when the 3rd hover also moved) */
const PRANK_PUFF_DELAY_MS = 0;
/** Decoy scale+fade+smoke duration; total handoff = delay + this (see effect below) */
const PRANK_PUFF_DURATION_MS = 460;
const PRANK_PUFF_SMOKE_BLUR_PX = 24;

/**
 * ProblemStatement pain-card glass. Slightly lighter fill so blur reads even when
 * the scrim is dark (flat opaque scrim kills visible frost).
 */
const painCardGlassStyle: CSSProperties = {
  background: "rgba(0, 0, 0, 0.16)",
  backdropFilter: "blur(28px) saturate(1.15)",
  WebkitBackdropFilter: "blur(32px) saturate(1.15)",
  boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)",
};

const painCardGlassRimStyle: CSSProperties = {
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12)",
  maskImage:
    "linear-gradient(90deg, black 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(90deg, black 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
};

function randomFieldPosition(prev: { left: number; top: number } | null) {
  const pad = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(FIELD_WIDTH, vw - pad * 2);
  let left = pad;
  let top = pad;
  for (let i = 0; i < 24; i++) {
    left = pad + Math.random() * Math.max(8, vw - w - pad * 2);
    top = pad + Math.random() * Math.max(8, vh - DECOY_BLOCK_HEIGHT - pad * 2);
    if (!prev || Math.hypot(left - prev.left, top - prev.top) > 72) break;
  }
  return { left, top };
}

function initialFieldPosition() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(FIELD_WIDTH, vw - 32);
  return {
    left: Math.max(16, (vw - w) / 2),
    top: Math.min(Math.max(104, vh * 0.46), vh - DECOY_BLOCK_HEIGHT - 24),
  };
}

type Phase = "form" | "prank" | "punchline";

export function EarlyAccessModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const doneRef = useRef<HTMLButtonElement | null>(null);

  const [phase, setPhase] = useState<Phase>("form");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reduceMotion, setReduceMotion] = useState(false);
  /** Touch-primary UI (phones, most tablets); used to avoid scrim-dismiss during password prank */
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [fieldPos, setFieldPos] = useState<{ left: number; top: number } | null>(null);
  const [fieldMotionOn, setFieldMotionOn] = useState(false);
  const [fleeCount, setFleeCount] = useState(0);
  const [prankDecoyPuff, setPrankDecoyPuff] = useState(false);

  const lastFleeAt = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setCoarsePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useLayoutEffect(() => {
    if (phase !== "prank" || reduceMotion) return;
    setFieldPos(initialFieldPosition());
    setFieldMotionOn(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFieldMotionOn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "prank" || !reduceMotion) return;
    const t = window.setTimeout(() => setPhase("punchline"), 1000);
    return () => window.clearTimeout(t);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "prank" || reduceMotion) return;
    if (fleeCount < MAX_FLEES) return;
    const t1 = window.setTimeout(() => setPrankDecoyPuff(true), PRANK_PUFF_DELAY_MS);
    const t2 = window.setTimeout(
      () => setPhase("punchline"),
      PRANK_PUFF_DELAY_MS + PRANK_PUFF_DURATION_MS
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setPrankDecoyPuff(false);
    };
  }, [fleeCount, phase, reduceMotion]);

  const triggerFlee = useCallback(() => {
    if (reduceMotion || phase !== "prank") return;
    const now = performance.now();
    if (now - lastFleeAt.current < FLEE_DEBOUNCE_MS) return;
    setFleeCount((c) => {
      if (c >= MAX_FLEES) return c;
      lastFleeAt.current = performance.now();
      // Last hover: puff in place — no final teleport
      if (c < MAX_FLEES - 1) {
        setFieldPos((prev) => randomFieldPosition(prev));
      }
      return c + 1;
    });
  }, [reduceMotion, phase]);

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFieldError(null);
    const name = firstName.trim();
    const em = email.trim();
    if (!name) {
      setFieldError("Please add your first name.");
      firstNameRef.current?.focus();
      return;
    }
    if (!EMAIL_RE.test(em)) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: em,
          website,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        setFieldError(result?.error || "Something went wrong. Please try again.");
        return;
      }

      lastFleeAt.current = 0;
      setFleeCount(0);
      setPrankDecoyPuff(false);
      setPhase("prank");
    } catch {
      setFieldError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (phase === "form") {
      const t = window.setTimeout(() => firstNameRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
    if (phase === "punchline") {
      const t = window.setTimeout(() => doneRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;

    const selector =
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== "Tab") return;
      const nodes = root.querySelectorAll<HTMLElement>(selector);
      const list = Array.from(nodes).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inList = active && list.includes(active);
      if (ev.shiftKey) {
        if (active === first || !inList) {
          last.focus();
          ev.preventDefault();
        }
      } else if (active === last) {
        first.focus();
        ev.preventDefault();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const inputClass =
    "mt-2 w-full rounded-[1rem] border border-[rgba(167,139,250,0.2)] bg-[rgba(10,8,14,0.65)] px-3.5 py-2.5 text-[0.9375rem] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-[rgba(237,237,237,0.26)] focus:border-[rgba(167,139,250,0.48)] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_3px_rgba(124,58,237,0.2)]";

  const content = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100]"
    >
      <div
        className="absolute inset-0 z-0 animate-[eaOverlayIn_420ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        style={{
          background:
            "radial-gradient(ellipse 88% 78% at 50% 42%, rgba(4,2,8,0.55) 0%, rgba(4,2,8,0.78) 48%, rgba(2,1,6,0.94) 100%)",
        }}
        aria-hidden
        onClick={() => {
          if (phase === "prank" && coarsePointer) return;
          onClose();
        }}
      />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100dvh] max-w-[1200px] items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
        <div
          className={cn(
            "pointer-events-auto relative w-full max-w-[400px] origin-top rounded-2xl animate-[eaPanelIn_480ms_cubic-bezier(0.22,1,0.36,1)_forwards]",
            phase === "prank"
              ? "flex min-h-[min(300px,46dvh)] flex-col items-stretch justify-start px-8 pb-12 pt-12 md:min-h-[340px] md:px-10 md:pb-14 md:pt-14"
              : "px-8 pb-9 pt-10 md:px-10 md:pb-10 md:pt-11"
          )}
          style={painCardGlassStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl" style={painCardGlassRimStyle} aria-hidden />
          <div className="relative z-10">

          {phase === "form" && (
            <>
              <h2
                id={titleId}
                className="text-center text-[1.65rem] font-semibold leading-[1.1] tracking-[-0.035em] text-white sm:text-[1.8rem]"
              >
                Early Access
              </h2>

              <form className="mt-8 space-y-4 text-left" onSubmit={onSubmitForm} noValidate>
                <div>
                  <label
                    htmlFor="ea-first-name"
                    className="text-[0.8125rem] font-medium tracking-wide text-[rgba(237,237,237,0.72)]"
                  >
                    First name
                  </label>
                  <input
                    ref={firstNameRef}
                    id="ea-first-name"
                    name="firstName"
                    autoComplete="given-name"
                    className={inputClass}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ea-email"
                    className="text-[0.8125rem] font-medium tracking-wide text-[rgba(237,237,237,0.72)]"
                  >
                    Email
                  </label>
                  <input
                    id="ea-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute opacity-0"
                  style={{ inset: "-9999px auto auto -9999px" }}
                >
                  <label htmlFor="ea-website">Website</label>
                  <input
                    id="ea-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                {fieldError ? (
                  <p className="text-sm text-[#fca5a5]" role="alert">
                    {fieldError}
                  </p>
                ) : null}
                <button type="submit" className="btn btn-primary mt-5 w-full" disabled={isSubmitting}>
                  Submit
                </button>
              </form>
            </>
          )}

          {phase === "prank" && (
            <>
              <h2
                id={titleId}
                className="text-center text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.042em] text-white sm:text-[2.05rem] md:text-[2.15rem]"
              >
                Now your password
              </h2>
              {reduceMotion && (
                <p className="sr-only">Continuing to confirmation.</p>
              )}
            </>
          )}

          {phase === "punchline" && (
            <div
              className={cn(
                "flex flex-col items-center text-center",
                !reduceMotion &&
                  "animate-[eaPunchlineIn_720ms_cubic-bezier(0.25,0.46,0.45,0.94)_both]"
              )}
            >
              {/* One typographic moment: setup + payoff, tight coupling */}
              <div className="max-w-[min(28ch,100%)]">
                <h2
                  id={titleId}
                  className="text-balance text-[2.05rem] font-semibold leading-[1.06] tracking-[-0.043em] text-white sm:text-[2.35rem] md:text-[2.5rem]"
                >
                  Just kidding
                </h2>
                <p className="mt-2.5 text-[1.65rem] font-semibold leading-[1.11] tracking-[-0.03em] text-[var(--accent-secondary)] sm:text-[1.9rem] md:text-[2.05rem]">
                  Stay sharp
                </p>
              </div>

              {/* Secondary confirmation: quieter, separated by space not decoration */}
              <p className="mt-10 max-w-[28ch] text-[0.8125rem] font-medium leading-relaxed tracking-[0.02em] text-[rgba(237,237,237,0.48)] sm:mt-11">
                You&apos;re on the list,{" "}
                <span className="text-[var(--accent-secondary)]">
                  {firstName.trim() || "friend"}
                </span>
              </p>
              <button
                ref={doneRef}
                type="button"
                className="mt-4 min-w-[10.5rem] self-center rounded-full border border-[#3a3250] bg-[var(--background)] px-10 py-3 text-[0.95rem] font-semibold text-[var(--foreground)] shadow-none transition-[border-color,background-color] hover:border-[rgba(167,139,250,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(167,139,250,0.38)]"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {phase === "prank" && !reduceMotion && fieldPos ? (
        <div
          className={cn(
            "fixed z-[110] origin-center touch-manipulation",
            prankDecoyPuff ? "pointer-events-none" : "pointer-events-auto"
          )}
          style={{
            left: fieldPos.left,
            top: fieldPos.top,
            width: FIELD_WIDTH,
            transform: prankDecoyPuff
              ? "translateY(-12px) scale(1.32)"
              : "translateY(0) scale(1)",
            opacity: prankDecoyPuff ? 0 : 1,
            filter: prankDecoyPuff
              ? `blur(${PRANK_PUFF_SMOKE_BLUR_PX}px) saturate(0.28) brightness(1.12) contrast(0.92)`
              : "blur(0px) saturate(1) brightness(1) contrast(1)",
            boxShadow: prankDecoyPuff
              ? "0 0 28px 16px rgba(200, 192, 230, 0.28), 0 0 52px 32px rgba(150, 140, 190, 0.14), 0 18px 44px -6px rgba(0, 0, 0, 0.4)"
              : "none",
            transition: prankDecoyPuff
              ? [
                  `transform ${PRANK_PUFF_DURATION_MS}ms cubic-bezier(0.34, 1.45, 0.48, 1)`,
                  `opacity ${Math.max(300, PRANK_PUFF_DURATION_MS - 40)}ms cubic-bezier(0.18, 0.85, 0.32, 1)`,
                  `filter ${PRANK_PUFF_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  `box-shadow ${PRANK_PUFF_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                ].join(", ")
              : fieldMotionOn
                ? "left 0.42s cubic-bezier(0.22, 1, 0.36, 1), top 0.42s cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            // Touch: flee runs on pointerenter and moves this node before click is dispatched;
            // without capture, the synthetic click hits the scrim and closes the modal.
            if (e.pointerType === "touch" || e.pointerType === "pen") {
              const el = e.currentTarget;
              if (typeof el.setPointerCapture === "function") {
                try {
                  el.setPointerCapture(e.pointerId);
                } catch {
                  /* invalid pointerId, etc. */
                }
              }
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerEnter={triggerFlee}
        >
          <div aria-hidden>
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[rgba(237,237,237,0.5)]">
              Password
            </span>
            <div
              className={cn(
                inputClass,
                "mt-1 flex min-h-[2.85rem] cursor-default select-none items-center font-mono text-[0.9rem] text-[rgba(237,237,237,0.42)]"
              )}
            >
              ••••••••
            </div>
          </div>
          <span id="ea-password-hint" className="sr-only">
            Decoy field for a security awareness demonstration. Do not enter a real password.
          </span>
        </div>
      ) : null}
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
