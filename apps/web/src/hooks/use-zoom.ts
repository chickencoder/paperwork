import { useRef, useCallback, useEffect, useState, type RefObject } from "react";

interface UseZoomOptions {
  containerRef?: RefObject<HTMLElement | null>; // Container to apply CSS transform to
  minScale?: number;
  maxScale?: number;
  initialBaseScale?: number; // Render PDF at higher resolution initially for better downscaling
  commitDelayMs?: number;
  onCommit?: (scale: number) => void;
  onZoomStart?: () => void; // Called when zoom gesture begins (to dismiss popovers, etc.)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useZoom({
  containerRef: _containerRef,
  minScale = 0.5,
  maxScale = 3.0,
  initialBaseScale = 3.0, // Render at max zoom so all zooming is CSS downscaling (no re-render needed)
  commitDelayMs = 300,
  onCommit,
  onZoomStart,
}: UseZoomOptions = {}) {
  // Base scale is what the PDF is rendered at (starts higher for crisp downscaling)
  const [baseScale, setBaseScale] = useState(initialBaseScale);
  // CSS scale is the transform applied on top of base scale
  // Start at 1/initialBaseScale so effective scale = 1 (100%)
  const [cssScale, setCssScale] = useState(1 / initialBaseScale);

  // Refs for tracking during gestures
  const targetScaleRef = useRef(1); // The actual zoom level user wants (starts at 1 = 100%)
  const baseScaleRef = useRef(initialBaseScale);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isZoomingRef = useRef(false);
  const zoomEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effective scale = baseScale * cssScale (what the user sees)
  const effectiveScale = baseScale * cssScale;

  // Ref to track CSS scale for synchronous reads
  const cssScaleRef = useRef(1 / initialBaseScale);

  // Apply CSS transform directly to DOM for synchronous updates (no flicker)
  const applyTransform = useCallback((scale: number) => {
    const container = _containerRef?.current;
    if (container) {
      container.style.transform = scale !== 1 ? `scale(${scale})` : "";
      container.style.transformOrigin = "center top";
    }
    cssScaleRef.current = scale;
    setCssScale(scale);
  }, [_containerRef]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      // Calculate new target scale
      const delta = -e.deltaY * 0.01;
      const oldTarget = targetScaleRef.current;
      const newTarget = clamp(oldTarget * (1 + delta), minScale, maxScale);

      // Skip if scale didn't change (at min/max bounds)
      if (oldTarget === newTarget) return;

      // Call onZoomStart once at the beginning of a zoom gesture
      if (!isZoomingRef.current) {
        isZoomingRef.current = true;
        onZoomStart?.();
      }

      // Reset the zoom end timer
      if (zoomEndTimerRef.current) {
        clearTimeout(zoomEndTimerRef.current);
      }
      zoomEndTimerRef.current = setTimeout(() => {
        isZoomingRef.current = false;
        zoomEndTimerRef.current = null;
      }, 150);

      // Calculate the new CSS scale relative to base
      const newCssScale = newTarget / baseScaleRef.current;
      const oldCssScale = cssScaleRef.current;

      // Compensate scroll BEFORE updating scale
      // The content at viewportCenterY will move by the ratio of scales
      const viewportCenterY = window.scrollY + window.innerHeight / 2;
      const scrollRatio = newCssScale / oldCssScale;
      const newScrollY = viewportCenterY * scrollRatio - window.innerHeight / 2;

      // Update target scale
      targetScaleRef.current = newTarget;

      // Apply transform and scroll SYNCHRONOUSLY to avoid flicker
      applyTransform(newCssScale);
      window.scrollTo({ top: newScrollY, behavior: "instant" as ScrollBehavior });

      // Debounce the commit - only re-render when zooming BEYOND the base scale
      // Downscaling via CSS looks fine, upscaling gets blurry
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
      }

      commitTimerRef.current = setTimeout(() => {
        const finalScale = targetScaleRef.current;
        const currentBase = baseScaleRef.current;

        // Only commit if we're zooming beyond the base (upscaling would be blurry)
        if (finalScale <= currentBase) {
          commitTimerRef.current = null;
          return;
        }

        // Update base scale and reset CSS scale
        baseScaleRef.current = finalScale;
        setBaseScale(finalScale);
        applyTransform(1);

        // Notify parent of the commit
        onCommit?.(finalScale);

        commitTimerRef.current = null;
      }, commitDelayMs);
    },
    [minScale, maxScale, commitDelayMs, onCommit, onZoomStart, applyTransform]
  );

  const zoomIn = useCallback(() => {
    const oldTarget = targetScaleRef.current;
    const newTarget = clamp(oldTarget + 0.25, minScale, maxScale);
    if (oldTarget === newTarget) return;

    // Dismiss popovers/selections on zoom
    onZoomStart?.();

    const newCssScale = newTarget / baseScaleRef.current;
    const oldCssScale = cssScaleRef.current;

    // Compensate scroll
    const viewportCenterY = window.scrollY + window.innerHeight / 2;
    const scrollRatio = newCssScale / oldCssScale;
    const newScrollY = viewportCenterY * scrollRatio - window.innerHeight / 2;

    targetScaleRef.current = newTarget;
    applyTransform(newCssScale);
    window.scrollTo({ top: newScrollY, behavior: "instant" as ScrollBehavior });

    // Only commit if zooming beyond base scale
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
    }
    commitTimerRef.current = setTimeout(() => {
      const finalScale = targetScaleRef.current;
      const currentBase = baseScaleRef.current;
      if (finalScale <= currentBase) {
        commitTimerRef.current = null;
        return;
      }
      baseScaleRef.current = finalScale;
      setBaseScale(finalScale);
      applyTransform(1);
      onCommit?.(finalScale);
      commitTimerRef.current = null;
    }, commitDelayMs);
  }, [minScale, maxScale, commitDelayMs, onCommit, onZoomStart, applyTransform]);

  const zoomOut = useCallback(() => {
    const oldTarget = targetScaleRef.current;
    const newTarget = clamp(oldTarget - 0.25, minScale, maxScale);
    if (oldTarget === newTarget) return;

    // Dismiss popovers/selections on zoom
    onZoomStart?.();

    const newCssScale = newTarget / baseScaleRef.current;
    const oldCssScale = cssScaleRef.current;

    // Compensate scroll
    const viewportCenterY = window.scrollY + window.innerHeight / 2;
    const scrollRatio = newCssScale / oldCssScale;
    const newScrollY = viewportCenterY * scrollRatio - window.innerHeight / 2;

    targetScaleRef.current = newTarget;
    applyTransform(newCssScale);
    window.scrollTo({ top: newScrollY, behavior: "instant" as ScrollBehavior });

    // Zooming out never needs re-render (downscaling looks fine)
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, [minScale, maxScale, onZoomStart, applyTransform]);

  const resetZoom = useCallback(() => {
    const oldTarget = targetScaleRef.current;
    if (oldTarget === 1) return;

    const newCssScale = 1 / baseScaleRef.current;
    const oldCssScale = cssScaleRef.current;

    // Compensate scroll
    const viewportCenterY = window.scrollY + window.innerHeight / 2;
    const scrollRatio = newCssScale / oldCssScale;
    const newScrollY = viewportCenterY * scrollRatio - window.innerHeight / 2;

    targetScaleRef.current = 1;
    applyTransform(newCssScale);
    window.scrollTo({ top: newScrollY, behavior: "instant" as ScrollBehavior });

    // Reset to 1x is always below initialBaseScale, no re-render needed
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, [applyTransform]);

  // Register wheel event listener
  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
      }
    };
  }, []);

  return {
    baseScale,      // Scale the PDF is rendered at
    cssScale,       // CSS transform multiplier
    effectiveScale, // What the user sees (baseScale * cssScale)
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
