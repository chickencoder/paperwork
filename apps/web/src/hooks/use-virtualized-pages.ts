import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const DEFAULT_VISIBLE_BUFFER = 2;
const DEFAULT_PRELOAD_BUFFER = 2;

interface VisibleRange {
  firstVisible: number;
  lastVisible: number;
  renderStart: number;
  renderEnd: number;
}

interface VirtualizedPage {
  pageIndex: number;
  shouldRender: boolean;
}

interface UseVirtualizedPagesOptions {
  totalPages: number;
  containerRef: React.RefObject<HTMLElement | null>;
  visibleBuffer?: number;
  preloadBuffer?: number;
}

interface UseVirtualizedPagesReturn {
  pages: VirtualizedPage[];
  visibleRange: VisibleRange;
  currentPage: number;
  forceRenderAll: () => void;
  isForceRenderingAll: boolean;
}

export function useVirtualizedPages({
  totalPages,
  containerRef,
  visibleBuffer = DEFAULT_VISIBLE_BUFFER,
  preloadBuffer = DEFAULT_PRELOAD_BUFFER,
}: UseVirtualizedPagesOptions): UseVirtualizedPagesReturn {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>(() => ({
    firstVisible: 0,
    lastVisible: 0,
    renderStart: 0,
    renderEnd: Math.min(visibleBuffer + preloadBuffer, totalPages - 1),
  }));

  // Track the totalPages that forceRenderAll was set for (null means not forced)
  const [forceRenderTotalPages, setForceRenderTotalPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageVisibilityRef = useRef<Map<number, number>>(new Map());
  const observedElementsRef = useRef<Set<Element>>(new Set());

  // Calculate which pages should be rendered
  const pages = useMemo(() => {
    // Only force render all if it was set for the current document
    const shouldForceRenderAll = forceRenderTotalPages === totalPages;

    if (shouldForceRenderAll) {
      return Array.from({ length: totalPages }, (_, i) => ({
        pageIndex: i,
        shouldRender: true,
      }));
    }

    return Array.from({ length: totalPages }, (_, i) => {
      const isInRenderWindow = i >= visibleRange.renderStart && i <= visibleRange.renderEnd;

      return {
        pageIndex: i,
        shouldRender: isInRenderWindow,
      };
    });
  }, [totalPages, visibleRange, forceRenderTotalPages]);

  // Force render all pages (for export/print)
  const forceRenderAll = useCallback(() => {
    setForceRenderTotalPages(totalPages);
  }, [totalPages]);

  // Setup IntersectionObserver
  useEffect(() => {
    if (totalPages === 0) return;

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        let hasChanges = false;

        entries.forEach((entry) => {
          const pageIndexAttr = entry.target.getAttribute("data-page-index");
          if (pageIndexAttr === null) return;

          const pageIndex = parseInt(pageIndexAttr, 10);

          if (entry.isIntersecting) {
            const currentRatio = pageVisibilityRef.current.get(pageIndex);
            if (currentRatio !== entry.intersectionRatio) {
              pageVisibilityRef.current.set(pageIndex, entry.intersectionRatio);
              hasChanges = true;
            }
          } else {
            if (pageVisibilityRef.current.has(pageIndex)) {
              pageVisibilityRef.current.delete(pageIndex);
              hasChanges = true;
            }
          }
        });

        if (!hasChanges) return;

        // Calculate new visible range
        const visiblePages = Array.from(pageVisibilityRef.current.keys()).sort((a, b) => a - b);

        if (visiblePages.length === 0) return;

        const firstVisible = visiblePages[0];
        const lastVisible = visiblePages[visiblePages.length - 1];

        const newRange: VisibleRange = {
          firstVisible,
          lastVisible,
          renderStart: Math.max(0, firstVisible - visibleBuffer - preloadBuffer),
          renderEnd: Math.min(totalPages - 1, lastVisible + visibleBuffer + preloadBuffer),
        };

        setVisibleRange((prev) => {
          // Only update if actually changed
          if (
            prev.firstVisible === newRange.firstVisible &&
            prev.lastVisible === newRange.lastVisible &&
            prev.renderStart === newRange.renderStart &&
            prev.renderEnd === newRange.renderEnd
          ) {
            return prev;
          }
          return newRange;
        });

        // Calculate the most visible page (for currentPage)
        let maxRatio = 0;
        let mostVisible = firstVisible;
        pageVisibilityRef.current.forEach((ratio, pageIndex) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisible = pageIndex;
          }
        });
        setCurrentPage(mostVisible + 1); // 1-indexed for display
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: "200px 0px 200px 0px", // Extra margin for preloading
      }
    );

    const observer = observerRef.current;
    const observedElements = observedElementsRef.current;
    const pageVisibility = pageVisibilityRef.current;
    return () => {
      observer?.disconnect();
      pageVisibility.clear();
      observedElements.clear();
    };
  }, [totalPages, visibleBuffer, preloadBuffer]);

  // Observe/unobserve page elements when they mount/unmount
  useEffect(() => {
    const container = containerRef.current;
    const observer = observerRef.current;
    if (!container || !observer) return;

    // Use MutationObserver to detect when page elements are added/removed
    const mutationObserver = new MutationObserver(() => {
      const pageElements = container.querySelectorAll("[data-page-index]");
      const currentElements = new Set(pageElements);

      // Observe new elements
      pageElements.forEach((el) => {
        if (!observedElementsRef.current.has(el)) {
          observer.observe(el);
          observedElementsRef.current.add(el);
        }
      });

      // Unobserve removed elements
      observedElementsRef.current.forEach((el) => {
        if (!currentElements.has(el)) {
          observer.unobserve(el);
          observedElementsRef.current.delete(el);
        }
      });
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    // Initial observation
    const pageElements = container.querySelectorAll("[data-page-index]");
    pageElements.forEach((el) => {
      observer.observe(el);
      observedElementsRef.current.add(el);
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [containerRef, totalPages]);


  return {
    pages,
    visibleRange,
    currentPage,
    forceRenderAll,
    isForceRenderingAll: forceRenderTotalPages === totalPages,
  };
}
