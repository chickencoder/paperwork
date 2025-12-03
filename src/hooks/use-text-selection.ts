import { useState, useEffect, useCallback, useRef, type RefObject } from "react";
import type { AnnotationRect } from "@/lib/pdf/types";

export interface TextSelection {
  text: string;
  pageIndex: number;
  rects: AnnotationRect[];
  // Position for floating toolbar (top-center of first rect, in viewport coords)
  toolbarPosition: { x: number; y: number };
}

interface UseTextSelectionOptions {
  containerRef: RefObject<HTMLElement | null>;
  scale: number;
  enabled?: boolean;
}

/**
 * Merge adjacent rectangles on the same line into single rectangles.
 * This prevents individual word boxes from revealing word lengths in redactions.
 */
function mergeLineRects(rects: AnnotationRect[]): AnnotationRect[] {
  if (rects.length <= 1) return rects;

  // Sort by Y position (top to bottom), then by X (left to right)
  const sorted = [...rects].sort((a, b) => {
    // Consider rects on the same line if their Y positions are within a small threshold
    const yThreshold = Math.min(a.height, b.height) * 0.5;
    if (Math.abs(a.y - b.y) <= yThreshold) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  const merged: AnnotationRect[] = [];
  let current: AnnotationRect | null = null;

  for (const rect of sorted) {
    if (!current) {
      current = { ...rect };
      continue;
    }

    // Check if this rect is on the same line as current
    const yThreshold = Math.min(current.height, rect.height) * 0.5;
    const sameLine = Math.abs(current.y - rect.y) <= yThreshold;

    if (sameLine) {
      // Merge: extend current rect to cover both
      const minX = Math.min(current.x, rect.x);
      const maxX = Math.max(current.x + current.width, rect.x + rect.width);
      const minY = Math.min(current.y, rect.y);
      const maxY = Math.max(current.y + current.height, rect.y + rect.height);

      current = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    } else {
      // Different line - push current and start new
      merged.push(current);
      current = { ...rect };
    }
  }

  // Don't forget the last one
  if (current) {
    merged.push(current);
  }

  return merged;
}

export function useTextSelection({
  containerRef,
  scale,
  enabled = true,
}: UseTextSelectionOptions) {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const mouseUpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSelection(null);
      return;
    }

    const handleSelectionChange = () => {
      const windowSelection = window.getSelection();

      // No selection or collapsed (just a cursor)
      if (!windowSelection || windowSelection.isCollapsed) {
        setSelection(null);
        return;
      }

      const container = containerRef.current;
      if (!container) {
        setSelection(null);
        return;
      }

      // Get the selection range
      const range = windowSelection.getRangeAt(0);

      // Check if selection is within our PDF container
      if (!container.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }

      // Find the page element containing the selection
      const startNode = range.startContainer.parentElement;
      const pageElement = startNode?.closest("[data-page-index]");

      if (!pageElement) {
        setSelection(null);
        return;
      }

      const pageIndex = parseInt(pageElement.getAttribute("data-page-index") || "0", 10);
      const pageRect = pageElement.getBoundingClientRect();

      // Get all client rects for the selection (handles multi-line)
      const clientRects = Array.from(range.getClientRects());

      if (clientRects.length === 0) {
        setSelection(null);
        return;
      }

      // Filter rects that are within the text layer (ignore tiny rects)
      const validRects = clientRects.filter(rect => rect.width > 1 && rect.height > 1);

      if (validRects.length === 0) {
        setSelection(null);
        return;
      }

      // Convert to page-relative coordinates, accounting for scale
      const normalizedRects: AnnotationRect[] = validRects.map((rect) => ({
        x: (rect.left - pageRect.left) / scale,
        y: (rect.top - pageRect.top) / scale,
        width: rect.width / scale,
        height: rect.height / scale,
      }));

      // Merge adjacent rects on the same line to create solid blocks
      const mergedRects = mergeLineRects(normalizedRects);

      // Calculate toolbar position (centered above the first rect, in viewport coords)
      const firstRect = validRects[0];
      const toolbarPosition = {
        x: firstRect.left + firstRect.width / 2,
        y: firstRect.top,
      };

      setSelection({
        text: windowSelection.toString(),
        pageIndex,
        rects: mergedRects,
        toolbarPosition,
      });
    };

    // Listen for selection changes
    document.addEventListener("selectionchange", handleSelectionChange);

    // Also check on mouseup for more reliable detection
    const handleMouseUp = () => {
      // Clear any pending timeout
      if (mouseUpTimeoutRef.current) {
        clearTimeout(mouseUpTimeoutRef.current);
      }
      // Small delay to let selection finalize
      mouseUpTimeoutRef.current = setTimeout(handleSelectionChange, 10);
    };
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleMouseUp);
      // Cleanup timeout on unmount
      if (mouseUpTimeoutRef.current) {
        clearTimeout(mouseUpTimeoutRef.current);
      }
    };
  }, [containerRef, scale, enabled]);

  return { selection, clearSelection };
}
