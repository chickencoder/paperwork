import { useState, useEffect, useRef } from "react";

export function useCurrentPage(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageVisibilityRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.getAttribute("data-page-number") || "0", 10);
          if (pageNum > 0) {
            if (entry.isIntersecting) {
              pageVisibilityRef.current.set(pageNum, entry.intersectionRatio);
            } else {
              pageVisibilityRef.current.delete(pageNum);
            }
          }
        });

        // Find the most visible page
        let maxRatio = 0;
        let mostVisiblePage = currentPage;
        pageVisibilityRef.current.forEach((ratio, page) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisiblePage = page;
          }
        });

        if (mostVisiblePage !== currentPage && maxRatio > 0) {
          setCurrentPage(mostVisiblePage);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    // Observe all page elements
    const pages = document.querySelectorAll("[data-page-number]");
    pages.forEach((page) => {
      observerRef.current?.observe(page);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [totalPages, currentPage]);

  return currentPage;
}
