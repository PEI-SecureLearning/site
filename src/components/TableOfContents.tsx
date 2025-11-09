"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { FiChevronRight } from "react-icons/fi";

import styles from "./TableOfContents.module.css";

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  className?: string;
}

export default function TableOfContents({ items, className = "" }: TableOfContentsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set<string>());
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const tocItems = useMemo(
    () =>
      items
        .filter((item) => item.id && item.text)
        .map((item) => ({
          ...item,
          level: Math.min(Math.max(item.level, 1), 6),
        })),
    [items]
  );

  const [activeId, setActiveId] = useState<string>(() => tocItems[0]?.id ?? "");

  const tocTree = useMemo(() => buildTree(tocItems), [tocItems]);
  const activePath = useMemo(() => (activeId ? findPath(tocTree, activeId) ?? [] : []), [tocTree, activeId]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    setActiveId(tocItems[0]?.id ?? "");
    setExpandedIds(new Set<string>());
  }, [tocItems]);

  useEffect(() => {
    if (!tocItems.length) return;

    let ticking = false;

    const updateActiveHeading = () => {
      ticking = false;
      let currentId = tocItems[0]?.id ?? "";

      for (const item of tocItems) {
        const element = document.getElementById(item.id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 160) {
          currentId = item.id;
        } else {
          break;
        }
      }

      setActiveId((prev) => (prev === currentId ? prev : currentId));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveHeading);
      }
    };

    updateActiveHeading();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [tocItems]);

  const removeBranch = useCallback((set: Set<string>, node: TocNode) => {
    set.delete(node.id);
    node.children.forEach((child) => removeBranch(set, child));
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateShadows = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      setShowTopShadow(scrollTop > 4);
      setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 4);
    };

    updateShadows();
    element.addEventListener("scroll", updateShadows, { passive: true });
    window.addEventListener("resize", updateShadows);

    return () => {
      element.removeEventListener("scroll", updateShadows);
      window.removeEventListener("resize", updateShadows);
    };
  }, [tocTree]);

  const autoExpandActivePath = useCallback(() => {
    if (!activePath.length) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      let changed = false;

      activePath.forEach((node) => {
        if (!next.has(node.id)) {
          next.add(node.id);
          changed = true;
        }
      });

      const activeRoot = activePath[0];
      if (activeRoot) {
        tocTree.forEach((root) => {
          if (root.id !== activeRoot.id && next.has(root.id)) {
            removeBranch(next, root);
            changed = true;
          }
        });
      }

      return changed ? next : prev;
    });
  }, [activePath, tocTree, removeBranch]);

  useEffect(() => {
    autoExpandActivePath();
  }, [autoExpandActivePath]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      containerRefs.current.forEach((el, id) => {
        if (!el) return;
        const content = el.firstElementChild as HTMLElement | null;
        const height = expandedIds.has(id) ? content?.scrollHeight ?? 0 : 0;
        el.style.maxHeight = `${height}px`;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [expandedIds, tocTree]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !activeId) return;
    const link = container.querySelector<HTMLElement>(`[data-toc-link="${CSS.escape(activeId)}"]`);
    if (!link) return;

    const linkTop = link.offsetTop;
    const linkBottom = linkTop + link.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    const padding = 24;

    if (linkTop < viewTop + padding) {
      container.scrollTo({
        top: Math.max(linkTop - container.clientHeight * 0.4, 0),
        behavior: "smooth",
      });
    } else if (linkBottom > viewBottom - padding) {
      container.scrollTo({
        top: Math.max(linkBottom - container.clientHeight * 0.6, 0),
        behavior: "smooth",
      });
    }
  }, [activeId]);

  if (!tocItems.length) {
    return null;
  }

  const containerClasses = [
    "w-full",
    "xl:w-72 xl:fixed xl:top-28 xl:right-[clamp(1.5rem,3vw,2.5rem)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderNode = (node: TocNode, depth: number, ancestorLast: boolean[], isLast: boolean): JSX.Element => {
    const hasChildren = node.children.length > 0;
    const isExpanded = hasChildren && expandedIds.has(node.id);
    const isActive = node.id === activeId;
    const isInActivePath = activePath.some((pathNode) => pathNode.id === node.id);

    const linkClasses = [
      "block rounded-md px-2 transition-colors duration-200",
      depth === 0 ? "py-1.5" : "py-1",
      isActive
        ? "bg-[rgba(124,58,237,0.18)] text-[var(--accent-secondary)]"
        : isInActivePath
          ? "text-[rgba(237,237,237,0.82)]"
          : "text-[rgba(237,237,237,0.68)] hover:text-[var(--foreground)]",
    ].join(" ");

    const toggle = () => {
      if (!hasChildren) return;
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          removeBranch(next, node);
        } else {
          next.add(node.id);
        }
        return next;
      });
    };

    return (
      <li key={node.id}>
        <div className="flex items-center gap-1">
          {depth > 0 && (
            <span className="mr-0.5 font-mono text-[11px] leading-none text-[rgba(167,139,250,0.65)] whitespace-pre">
              {buildConnectorPrefix(ancestorLast, isLast)}
            </span>
          )}
          <a
            href={`#${node.id}`}
            data-toc-link={node.id}
            className={`${linkClasses} flex-1`}
          >
            {node.text}
          </a>
          {hasChildren && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? `Collapse ${node.text}` : `Expand ${node.text}`}
              className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[rgba(237,237,237,0.75)] transition hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[rgba(124,58,237,0.6)]"
            >
              <FiChevronRight
                className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                aria-hidden
              />
            </button>
          )}
        </div>

        <div
          ref={(el) => {
            const map = containerRefs.current;
            if (el) {
              map.set(node.id, el);
            } else {
              map.delete(node.id);
            }
          }}
          className={`${styles.children} ${isExpanded ? styles.expanded : ""}`}
        >
          {hasChildren && (
            <ul className={`${depth === 0 ? "space-y-1" : "space-y-0.5"}`}>
              {node.children.map((child, index) =>
                renderNode(child, depth + 1, [...ancestorLast, isLast], index === node.children.length - 1)
              )}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <nav aria-label="On this page" className={containerClasses}>
      <div className="surface-inset rounded-3xl border border-[rgba(167,139,250,0.18)] bg-[rgba(18,16,23,0.86)] px-4 py-5 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
          On this page
        </p>
        <div className="relative mt-4">
          <div ref={scrollRef} className={styles.scrollArea}>
            <ul className="space-y-1.5 pb-2 text-sm">
              {tocTree.map((node, index) => renderNode(node, 0, [], index === tocTree.length - 1))}
            </ul>
          </div>
          <div className={`${styles.fadeTop} ${showTopShadow ? styles.fadeVisible : ""}`} />
          <div className={`${styles.fadeBottom} ${showBottomShadow ? styles.fadeVisible : ""}`} />
        </div>
      </div>
    </nav>
  );
}


interface TocNode extends TableOfContentsItem {
  children: TocNode[];
}

function buildTree(items: TableOfContentsItem[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [];

  items.forEach((item) => {
    const node: TocNode = { ...item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  });

  return root;
}

function findPath(nodes: TocNode[], targetId: string, trail: TocNode[] = []): TocNode[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === targetId) {
      return nextTrail;
    }
    if (node.children.length) {
      const found = findPath(node.children, targetId, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

function buildConnectorPrefix(ancestors: boolean[], isLast: boolean) {
  let prefix = "";
  for (let i = 0; i < ancestors.length - 1; i += 1) {
    prefix += ancestors[i] ? "  " : "│ ";
  }
  if (ancestors.length > 0) {
    prefix += isLast ? "└ " : "├ ";
  }
  return prefix;
}


