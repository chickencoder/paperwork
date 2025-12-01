import { useRef, useCallback, useEffect, useState } from "react";

interface UseZoomOptions {
  currentScale: number;
  minScale?: number;
  maxScale?: number;
  commitDelayMs?: number;
  containerRef: React.RefObject<HTMLElement | null>;
  onScaleChange: (newScale: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Page-based anchor for scroll position restoration
interface ViewportAnchor {
  pageIndex: number;
  offsetRatioY: number; // 0-1, how far down the page
}

function findViewportAnchor(container: HTMLElement | null): ViewportAnchor {
  if (!container) return { pageIndex: 0, offsetRatioY: 0.5 };

  const viewportCenterY = window.innerHeight / 2;
  const pages = container.querySelectorAll("[data-page-index]");

  for (const page of pages) {
    const rect = page.getBoundingClientRect();
    // Is viewport center within this page?
    if (rect.top <= viewportCenterY && rect.bottom >= viewportCenterY) {
      return {
        pageIndex: parseInt(page.getAttribute("data-page-index") || "0"),
        offsetRatioY: (viewportCenterY - rect.top) / rect.height,
      };
    }
  }

  // Fallback: find closest page
  let closestPage = 0;
  let closestDistance = Infinity;
  pages.forEach((page, i) => {
    const rect = page.getBoundingClientRect();
    const pageCenter = rect.top + rect.height / 2;
    const distance = Math.abs(pageCenter - viewportCenterY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPage = i;
    }
  });

  return { pageIndex: closestPage, offsetRatioY: 0.5 };
}

function scrollToAnchor(container: HTMLElement | null, anchor: ViewportAnchor) {
  if (!container) return;

  const page = container.querySelector(
    `[data-page-index="${anchor.pageIndex}"]`
  );
  if (!page) return;

  const rect = page.getBoundingClientRect();
  const pageTop = rect.top + window.scrollY;

  // Where should the anchor point be in absolute coords?
  const anchorY = pageTop + rect.height * anchor.offsetRatioY;

  // Scroll to put anchor in viewport center
  window.scrollTo(0, anchorY - window.innerHeight / 2);
}

export function useZoom({
  currentScale,
  minScale = 0.5,
  maxScale = 3.0,
  commitDelayMs = 200,
  containerRef,
  onScaleChange,
}: UseZoomOptions) {
  const [isZooming, setIsZooming] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false); // True during re-render phase

  const targetScaleRef = useRef(currentScale);
  const baseScaleRef = useRef(currentScale);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track the CSS scale as a ref to avoid re-render loops, only use state for final value
  const cssScaleRef = useRef(1);
  const [cssScaleState, setCssScaleState] = useState(1);

  // Sync refs with current scale when not zooming
  useEffect(() => {
    if (!isZooming) {
      targetScaleRef.current = currentScale;
      baseScaleRef.current = currentScale;
    }
  }, [currentScale, isZooming]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        // Start zoom gesture if not already zooming
        if (!isZooming) {
          setIsZooming(true);
          baseScaleRef.current = currentScale;
          targetScaleRef.current = currentScale;
          cssScaleRef.current = 1;
        }

        // Calculate new target scale
        const delta = -e.deltaY * 0.01;
        const newTarget = clamp(
          targetScaleRef.current * (1 + delta),
          minScale,
          maxScale
        );
        targetScaleRef.current = newTarget;

        // Update CSS scale (ratio of target to base)
        const newCssScale = newTarget / baseScaleRef.current;
        cssScaleRef.current = newCssScale;
        setCssScaleState(newCssScale);

        // Debounce the commit - only re-render when gesture stops
        if (commitTimerRef.current) {
          clearTimeout(commitTimerRef.current);
        }

        commitTimerRef.current = setTimeout(() => {
          // 1. Find anchor BEFORE any changes
          const anchor = findViewportAnchor(containerRef.current);

          // 2. Enter commit state (visibility: hidden)
          setIsCommitting(true);

          // 3. Force a paint to ensure content is hidden
          // Using rAF ensures we're in the next frame where visibility is applied
          requestAnimationFrame(() => {
            // 4. Now safe to change scale - content is definitely hidden
            onScaleChange(targetScaleRef.current);
            baseScaleRef.current = targetScaleRef.current;
            commitTimerRef.current = null;

            // 5. Reset CSS transform
            cssScaleRef.current = 1;
            setCssScaleState(1);

            // 6. Wait for React to render new scale
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // 7. Restore scroll based on anchor
                scrollToAnchor(containerRef.current, anchor);

                // 8. Reveal content
                setIsCommitting(false);
                setIsZooming(false);
              });
            });
          });
        }, commitDelayMs);
      }
    },
    [currentScale, isZooming, minScale, maxScale, commitDelayMs, containerRef, onScaleChange]
  );

  const zoomIn = useCallback(() => {
    const newScale = clamp(currentScale + 0.25, minScale, maxScale);
    onScaleChange(newScale);
  }, [currentScale, minScale, maxScale, onScaleChange]);

  const zoomOut = useCallback(() => {
    const newScale = clamp(currentScale - 0.25, minScale, maxScale);
    onScaleChange(newScale);
  }, [currentScale, minScale, maxScale, onScaleChange]);

  const resetZoom = useCallback(() => {
    onScaleChange(1.0);
  }, [onScaleChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
      }
    };
  }, []);

  return {
    handleWheel,
    zoomIn,
    zoomOut,
    resetZoom,
    cssScale: cssScaleState,
    isZooming,
    isCommitting,
  };
}
