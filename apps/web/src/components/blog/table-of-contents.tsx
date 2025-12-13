"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

const MAX_VISIBLE_ITEMS = 8;

export function TableOfContents() {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Scan the DOM for headings on mount
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const headingElements = article.querySelectorAll("h2[id], h3[id]");
    const items: HeadingItem[] = Array.from(headingElements).map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: el.tagName === "H3" ? 3 : 2,
    }));

    setHeadings(items);
  }, []);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const threshold = 150;
      let currentId = headings[0].id;

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= threshold) {
            currentId = heading.id;
          }
        }
      }

      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const shouldCollapse = headings.length > MAX_VISIBLE_ITEMS;
  const visibleHeadings = shouldCollapse && !isExpanded
    ? headings.slice(0, MAX_VISIBLE_ITEMS)
    : headings;

  return (
    <nav className="space-y-1">
      <p className="text-sm font-medium text-foreground mb-3">On this page</p>
      <ul className="space-y-0.5">
        {visibleHeadings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`
                  block text-sm py-1.5 transition-all duration-150 border-l-2 -ml-px
                  ${heading.level === 3 ? "pl-5" : "pl-3"}
                  ${
                    isActive
                      ? "text-primary font-medium border-primary"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground/30"
                  }
                `}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 pl-3"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {headings.length - MAX_VISIBLE_ITEMS} more
            </>
          )}
        </button>
      )}
    </nav>
  );
}
