"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EarlyAccessModal } from "./EarlyAccessModal";

type EarlyAccessContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const EarlyAccessContext = createContext<EarlyAccessContextValue | null>(null);

export function useEarlyAccess() {
  const ctx = useContext(EarlyAccessContext);
  if (!ctx) {
    throw new Error("useEarlyAccess must be used within EarlyAccessProvider");
  }
  return ctx;
}

export function EarlyAccessProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    const el = openerRef.current;
    requestAnimationFrame(() => {
      if (el?.isConnected) el.focus();
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <EarlyAccessContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen ? <EarlyAccessModal onClose={close} /> : null}
    </EarlyAccessContext.Provider>
  );
}
