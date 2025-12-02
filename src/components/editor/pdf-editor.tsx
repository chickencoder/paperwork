"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useEditorState, type EditorSnapshot } from "@/hooks/use-editor-state";
import { useTextSelection } from "@/hooks/use-text-selection";
import { useZoom } from "@/hooks/use-zoom";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { modifyPDF } from "@/lib/pdf/pdf-modifier";
import { extractFormValues } from "@/lib/pdf/form-extractor";
import type { HighlightColor, StrikethroughColor } from "@/lib/pdf/types";
import { PDFViewer, type PDFViewerHandle } from "./pdf-viewer";
import { Toolbar } from "./toolbar";
import { SelectionToolbar } from "./selection-toolbar";
import { ScrollProgress } from "./scroll-progress";
import type { TransitionState } from "@/components/landing/landing-dialog";

interface PDFEditorProps {
  file: File;
  initialSnapshot?: EditorSnapshot;
  initialFormValues?: Record<string, string | boolean>;
  onStateChange?: (snapshot: EditorSnapshot, isDirty: boolean) => void;
  onFormValuesChange?: (values: Record<string, string | boolean>) => void;
  hasTabBar?: boolean;
  isEntering?: boolean;
  entryRect?: TransitionState["dialogRect"];
  onEnterComplete?: () => void;
}

export function PDFEditor({
  file,
  initialSnapshot,
  initialFormValues,
  onStateChange,
  onFormValuesChange,
  hasTabBar = false,
  isEntering = false,
  entryRect,
  onEnterComplete,
}: PDFEditorProps) {
  const {
    state,
    setPdf,
    addTextAnnotation,
    updateTextAnnotation,
    removeTextAnnotation,
    addSignatureAnnotation,
    updateSignatureAnnotation,
    removeSignatureAnnotation,
    addHighlight,
    removeHighlight,
    addStrikethrough,
    removeStrikethrough,
    addRedaction,
    removeRedaction,
    setActiveTool,
    selectAnnotation,
    copySelectedAnnotation,
    pasteAnnotation,
    deleteSelectedAnnotation,
    setFormField,
    canUndo,
    canRedo,
    undo,
    redo,
    getSnapshot,
    restoreSnapshot,
    isDirty,
  } = useEditorState();

  const viewerRef = useRef<PDFViewerHandle>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isSignaturePopoverOpen, setIsSignaturePopoverOpen] = useState(false);
  const [pendingSignatureData, setPendingSignatureData] = useState<string | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const clearSelectionRef = useRef<(() => void) | null>(null);

  // Dismiss all popovers and selections when zooming starts
  const handleZoomStart = useCallback(() => {
    selectAnnotation(null);
    setIsSignaturePopoverOpen(false);
    clearSelectionRef.current?.();
  }, [selectAnnotation]);

  // Use zoom hook - CSS transform during gesture, re-render PDF on commit
  const { baseScale, cssScale, effectiveScale, zoomIn, zoomOut, resetZoom } = useZoom({
    containerRef: viewerContainerRef,
    minScale: 0.5,
    maxScale: 3.0,
    commitDelayMs: 300,
    onZoomStart: handleZoomStart,
  });

  // Track current page and total pages
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollProgress = useScrollProgress({ currentPage, totalPages });

  // Update the container ref when viewer is ready
  useEffect(() => {
    const updateRef = () => {
      viewerContainerRef.current = viewerRef.current?.getContainer() ?? null;
    };
    updateRef();
    // Small delay to ensure ref is available after mount
    const timer = setTimeout(updateRef, 100);
    return () => clearTimeout(timer);
  }, [state.pdfFile]);

  // Text selection for highlighting and strikethrough
  const { selection, clearSelection } = useTextSelection({
    containerRef: viewerContainerRef,
    scale: effectiveScale,
    enabled: state.activeTool === "select",
  });

  // Keep ref updated for use in handleZoomStart
  clearSelectionRef.current = clearSelection;

  // Helper to check if user is editing text (to avoid intercepting Delete/Backspace)
  const isEditingText = useCallback(() => {
    const activeElement = document.activeElement;
    return activeElement?.tagName === "TEXTAREA" || activeElement?.tagName === "INPUT";
  }, []);

  // Load the PDF bytes when file changes
  useEffect(() => {
    async function load() {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        setPdf(file, bytes);
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
    }
    load();
  }, [file, setPdf]);

  // Restore initial snapshot when component mounts (for tab switching)
  useEffect(() => {
    if (initialSnapshot) {
      restoreSnapshot(initialSnapshot);
    }
    // Only run on mount - initialSnapshot should not change during component lifecycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inject initial form values after PDF loads (for session restore)
  useEffect(() => {
    if (!initialFormValues || !state.pdfFile) return;

    // Delay to ensure annotation layer is rendered
    const timer = setTimeout(() => {
      Object.entries(initialFormValues).forEach(([fieldId, value]) => {
        viewerRef.current?.setFormFieldValue(fieldId, value);
      });
    }, 300);

    return () => clearTimeout(timer);
    // Only run when PDF loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pdfFile]);

  // Sync state changes to parent for multi-document support
  useEffect(() => {
    if (onStateChange && state.pdfFile) {
      onStateChange(getSnapshot(), isDirty);
    }
  }, [onStateChange, getSnapshot, isDirty, state.pdfFile, state.scale, state.textAnnotations, state.signatureAnnotations, state.highlightAnnotations, state.strikethroughAnnotations, state.redactionAnnotations, state.selectedAnnotationId, state.activeTool, state.clipboard]);

  // Get current visible page index (first page that's at least partially visible)
  const getCurrentPageIndex = useCallback(() => {
    const container = viewerRef.current?.getContainer();
    if (!container) return 0;

    const pages = container.querySelectorAll("[data-page-index]");
    const scrollTop = window.scrollY;
    const viewportCenter = scrollTop + window.innerHeight / 2;

    for (const page of pages) {
      const rect = page.getBoundingClientRect();
      const pageTop = rect.top + scrollTop;
      const pageBottom = pageTop + rect.height;

      // Check if page center is visible or page covers viewport center
      if (pageTop <= viewportCenter && pageBottom >= viewportCenter) {
        return parseInt(page.getAttribute("data-page-index") || "0", 10);
      }
    }

    // Fallback to first page
    return 0;
  }, []);

  // Get placement position - uses mouse position if over a page, otherwise viewport center
  const getPlacementPosition = useCallback(() => {
    const container = viewerRef.current?.getContainer();
    if (!container) return { pageIndex: 0, position: { x: 100, y: 100 } };

    const mouseX = mousePositionRef.current.x;
    const mouseY = mousePositionRef.current.y;

    // First, check if mouse is over a page
    const pages = container.querySelectorAll("[data-page-index]");
    for (const page of pages) {
      const rect = page.getBoundingClientRect();

      // Check if mouse is within this page's bounds
      if (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      ) {
        const pageIndex = parseInt(page.getAttribute("data-page-index") || "0", 10);

        // Convert mouse position to page-relative coordinates
        const x = (mouseX - rect.left) / effectiveScale;
        const y = (mouseY - rect.top) / effectiveScale;

        return { pageIndex, position: { x, y } };
      }
    }

    // Mouse not over a page - fall back to viewport center
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    for (const page of pages) {
      const rect = page.getBoundingClientRect();

      // Check if this page is visible in viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const pageIndex = parseInt(page.getAttribute("data-page-index") || "0", 10);

        // Convert viewport center to page-relative coordinates
        const x = (viewportCenterX - rect.left) / effectiveScale;
        const y = (viewportCenterY - rect.top) / effectiveScale;

        return { pageIndex, position: { x, y } };
      }
    }

    return { pageIndex: getCurrentPageIndex(), position: { x: 100, y: 100 } };
  }, [effectiveScale, getCurrentPageIndex]);

  // Undo wrapper that handles form field DOM updates
  const handleUndo = useCallback(() => {
    const action = undo();
    if (action?.type === "SET_FORM_FIELD") {
      viewerRef.current?.setFormFieldValue(action.fieldId, action.value);
    }
  }, [undo]);

  // Redo wrapper that handles form field DOM updates
  const handleRedo = useCallback(() => {
    const action = redo();
    if (action?.type === "SET_FORM_FIELD") {
      viewerRef.current?.setFormFieldValue(action.fieldId, action.value);
    }
  }, [redo]);

  // Intercept browser zoom and handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        // Zoom shortcuts
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          zoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          zoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          resetZoom();
        }
        // Copy shortcut
        else if (e.key === "c" && state.selectedAnnotationId) {
          e.preventDefault();
          copySelectedAnnotation();
        }
        // Paste shortcut
        else if (e.key === "v" && state.clipboard) {
          e.preventDefault();
          const { pageIndex, position } = getPlacementPosition();
          pasteAnnotation(pageIndex, position);
        }
        // Undo shortcut (Cmd/Ctrl + Z)
        else if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          if (canUndo) handleUndo();
        }
        // Redo shortcut (Cmd/Ctrl + Shift + Z)
        else if (e.key === "z" && e.shiftKey) {
          e.preventDefault();
          if (canRedo) handleRedo();
        }
        // Alternative Redo shortcut (Cmd/Ctrl + Y) - common on Windows
        else if (e.key === "y") {
          e.preventDefault();
          if (canRedo) handleRedo();
        }
      }

      // Delete/Backspace (without Cmd/Ctrl modifier)
      if ((e.key === "Delete" || e.key === "Backspace") && state.selectedAnnotationId) {
        // Only delete if not editing text in an input/textarea
        if (!isEditingText()) {
          e.preventDefault();
          deleteSelectedAnnotation();
        }
      }
    };

    // Track mouse position for paste/signature placement
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [zoomIn, zoomOut, resetZoom, state.selectedAnnotationId, state.clipboard, copySelectedAnnotation, pasteAnnotation, deleteSelectedAnnotation, getPlacementPosition, isEditingText, canUndo, canRedo, handleUndo, handleRedo]);

  // Handle signature created from popover - places at mouse position or viewport center
  const handleSignatureCreated = useCallback(
    (dataUrl: string) => {
      const { pageIndex, position } = getPlacementPosition();

      const defaultWidth = 150;
      const defaultHeight = 60;

      // Center the signature on the placement position
      const x = position.x - defaultWidth / 2;
      const y = position.y - defaultHeight / 2;

      const annotation = {
        id: `sig-${Date.now()}`,
        page: pageIndex,
        position: { x, y },
        width: defaultWidth,
        height: defaultHeight,
        dataUrl,
      };

      // Load image to get actual dimensions
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const width = 150;
        const height = width / aspectRatio;
        updateSignatureAnnotation(annotation.id, { width, height });
      };

      addSignatureAnnotation(annotation);
      selectAnnotation(annotation.id);
    },
    [getPlacementPosition, addSignatureAnnotation, updateSignatureAnnotation, selectAnnotation]
  );

  // Handle signature placed on PDF (when using click-to-place mode)
  const handleSignaturePlaced = useCallback(() => {
    setPendingSignatureData(null);
  }, []);

  // Handle highlight creation from text selection
  const handleHighlight = useCallback(
    (color: HighlightColor) => {
      if (!selection) return;

      addHighlight({
        id: `highlight-${Date.now()}`,
        page: selection.pageIndex,
        rects: selection.rects,
        color,
        selectedText: selection.text,
      });
      clearSelection();
    },
    [selection, addHighlight, clearSelection]
  );

  // Handle strikethrough creation from text selection
  const handleStrikethrough = useCallback(
    (color: StrikethroughColor) => {
      if (!selection) return;

      addStrikethrough({
        id: `strikethrough-${Date.now()}`,
        page: selection.pageIndex,
        rects: selection.rects,
        selectedText: selection.text,
        color,
      });
      clearSelection();
    },
    [selection, addStrikethrough, clearSelection]
  );

  // Handle form field changes for undo/redo tracking and persistence
  const handleFormFieldChange = useCallback(
    (fieldId: string, value: string | boolean, previousValue: string | boolean) => {
      setFormField(fieldId, value, previousValue);

      // Extract and report all form values for persistence
      if (onFormValuesChange) {
        const container = viewerRef.current?.getContainer();
        if (container) {
          const values = extractFormValues(container);
          onFormValuesChange(values);
        }
      }
    },
    [setFormField, onFormValuesChange]
  );

  // Handle redaction creation from text selection
  const handleRedact = useCallback(() => {
    if (!selection) return;

    addRedaction({
      id: `redaction-${Date.now()}`,
      page: selection.pageIndex,
      rects: selection.rects,
      selectedText: selection.text,
      enabled: true,
    });
    clearSelection();
  }, [selection, addRedaction, clearSelection]);

  const handleDownload = useCallback(async (options: { rasterize: boolean; hasRedactions: boolean }) => {
    if (!state.pdfBytes) return;

    try {
      // Extract form values from the DOM
      const container = viewerRef.current?.getContainer();
      const formValues = container ? extractFormValues(container) : {};

      const modifiedBytes = await modifyPDF(
        state.pdfBytes,
        formValues,
        state.textAnnotations,
        state.signatureAnnotations,
        state.highlightAnnotations,
        state.strikethroughAnnotations,
        state.redactionAnnotations,
        options.rasterize ? { rasterize: true } : undefined
      );

      // Determine filename suffix based on what was done
      let suffix = "_filled.pdf";
      if (options.hasRedactions) {
        suffix = "_redacted.pdf";
      } else if (options.rasterize) {
        suffix = "_flattened.pdf";
      }

      const blob = new Blob([new Uint8Array(modifiedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", suffix);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  }, [state.pdfBytes, state.textAnnotations, state.signatureAnnotations, state.highlightAnnotations, state.strikethroughAnnotations, state.redactionAnnotations, file.name]);

  // Check if there are any enabled redactions
  const hasRedactions = state.redactionAnnotations.some(r => r.enabled);

  if (!state.pdfFile) {
    return <div className="min-h-screen bg-muted" />;
  }

  return (
    <div className="min-h-screen bg-muted pt-4">
      <ScrollProgress
        progress={scrollProgress}
        currentPage={currentPage}
        totalPages={totalPages}
        hasTabBar={hasTabBar}
      />
      <Toolbar
        scale={effectiveScale}
        activeTool={state.activeTool}
        fileName={file.name}
        isSignaturePopoverOpen={isSignaturePopoverOpen}
        canUndo={canUndo}
        canRedo={canRedo}
        hasRedactions={hasRedactions}
        hasTabBar={hasTabBar}
        isEntering={isEntering}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToolChange={setActiveTool}
        onSignaturePopoverChange={setIsSignaturePopoverOpen}
        onSignatureCreated={handleSignatureCreated}
        onDownload={handleDownload}
      />

      <motion.div
        className="px-4 pt-4 pb-8"
        initial={
          isEntering && entryRect
            ? { opacity: 0, scale: 0.95 }
            : false
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: isEntering ? 0.05 : 0,
        }}
        onAnimationComplete={() => {
          if (isEntering) {
            onEnterComplete?.();
          }
        }}
      >
        <PDFViewer
          ref={viewerRef}
          file={file}
          scale={baseScale}
          cssScale={cssScale}
          textAnnotations={state.textAnnotations}
          signatureAnnotations={state.signatureAnnotations}
          highlightAnnotations={state.highlightAnnotations}
          strikethroughAnnotations={state.strikethroughAnnotations}
          redactionAnnotations={state.redactionAnnotations}
          activeTool={state.activeTool}
          selectedAnnotationId={state.selectedAnnotationId}
          pendingSignatureData={pendingSignatureData}
          onAddTextAnnotation={addTextAnnotation}
          onUpdateTextAnnotation={updateTextAnnotation}
          onRemoveTextAnnotation={removeTextAnnotation}
          onAddSignatureAnnotation={addSignatureAnnotation}
          onUpdateSignatureAnnotation={updateSignatureAnnotation}
          onRemoveSignatureAnnotation={removeSignatureAnnotation}
          onRemoveHighlight={removeHighlight}
          onRemoveStrikethrough={removeStrikethrough}
          onRemoveRedaction={removeRedaction}
          onToolChange={setActiveTool}
          onSelectAnnotation={selectAnnotation}
          onSignaturePlaced={handleSignaturePlaced}
          onFormFieldChange={handleFormFieldChange}
          onDocumentLoad={setTotalPages}
          onCurrentPageChange={setCurrentPage}
        />
      </motion.div>

      {/* Floating toolbar for text selection */}
      {selection && (
        <SelectionToolbar
          position={selection.toolbarPosition}
          onHighlight={handleHighlight}
          onStrikethrough={handleStrikethrough}
          onRedact={handleRedact}
        />
      )}
    </div>
  );
}
