import { useState, useEffect, useCallback, type RefObject } from "react";
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

export function useTextSelection({
  containerRef,
  scale,
  enabled = true,
}: UseTextSelectionOptions) {
  const [selection, setSelection] = useState<TextSelection | null>(null);

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

      // Calculate toolbar position (centered above the first rect, in viewport coords)
      const firstRect = validRects[0];
      const toolbarPosition = {
        x: firstRect.left + firstRect.width / 2,
        y: firstRect.top,
      };

      setSelection({
        text: windowSelection.toString(),
        pageIndex,
        rects: normalizedRects,
        toolbarPosition,
      });
    };

    // Listen for selection changes
    document.addEventListener("selectionchange", handleSelectionChange);

    // Also check on mouseup for more reliable detection
    const handleMouseUp = () => {
      // Small delay to let selection finalize
      setTimeout(handleSelectionChange, 10);
    };
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [containerRef, scale, enabled]);

  return { selection, clearSelection };
}
