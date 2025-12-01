import { useEffect, useCallback, useRef, useState } from "react";
import { useEditorState } from "@/hooks/use-editor-state";
import { useTextSelection } from "@/hooks/use-text-selection";
import { useZoom } from "@/hooks/use-zoom";
import { modifyPDF } from "@/lib/pdf/pdf-modifier";
import { extractFormValues } from "@/lib/pdf/form-extractor";
import type { HighlightColor, StrikethroughColor } from "@/lib/pdf/types";
import { PDFViewer, type PDFViewerHandle } from "./pdf-viewer";
import { Toolbar } from "./toolbar";
import { SelectionToolbar } from "./selection-toolbar";

interface PDFEditorProps {
  file: File;
  onReset: () => void;
}

export function PDFEditor({ file, onReset }: PDFEditorProps) {
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
    commitZoom,
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
  } = useEditorState();

  const viewerRef = useRef<PDFViewerHandle>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isSignaturePopoverOpen, setIsSignaturePopoverOpen] = useState(false);
  const [pendingSignatureData, setPendingSignatureData] = useState<string | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Use zoom hook - CSS transform during gesture, re-render on commit
  const { handleWheel, zoomIn, zoomOut, resetZoom, cssScale, isZooming, isCommitting } = useZoom({
    currentScale: state.scale,
    minScale: 0.5,
    maxScale: 3.0,
    commitDelayMs: 200,
    containerRef: viewerContainerRef,
    onScaleChange: commitZoom,
  });

  // Handle toolbar scale changes (direct scale change without CSS transform)
  const handleToolbarZoom = useCallback((newScale: number) => {
    const clampedScale = Math.min(3, Math.max(0.5, newScale));
    if (clampedScale !== state.scale) {
      commitZoom(clampedScale);
    }
  }, [state.scale, commitZoom]);

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
    scale: state.scale,
    enabled: state.activeTool === "select",
  });

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
        const x = (mouseX - rect.left) / state.scale;
        const y = (mouseY - rect.top) / state.scale;

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
        const x = (viewportCenterX - rect.left) / state.scale;
        const y = (viewportCenterY - rect.top) / state.scale;

        return { pageIndex, position: { x, y } };
      }
    }

    return { pageIndex: getCurrentPageIndex(), position: { x: 100, y: 100 } };
  }, [state.scale, getCurrentPageIndex]);

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
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [zoomIn, zoomOut, resetZoom, handleWheel, state.selectedAnnotationId, state.clipboard, copySelectedAnnotation, pasteAnnotation, deleteSelectedAnnotation, getPlacementPosition, isEditingText, canUndo, canRedo, handleUndo, handleRedo]);

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

  // Handle form field changes for undo/redo tracking
  const handleFormFieldChange = useCallback(
    (fieldId: string, value: string | boolean, previousValue: string | boolean) => {
      setFormField(fieldId, value, previousValue);
    },
    [setFormField]
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

  const handleDownload = useCallback(async () => {
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
        state.redactionAnnotations
      );

      const blob = new Blob([new Uint8Array(modifiedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_filled.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  }, [state.pdfBytes, state.textAnnotations, state.signatureAnnotations, state.highlightAnnotations, state.strikethroughAnnotations, state.redactionAnnotations, file.name]);

  const handlePrint = useCallback(async () => {
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
        state.redactionAnnotations
      );

      const blob = new Blob([new Uint8Array(modifiedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Open in new window for printing
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
    } catch (error) {
      console.error("Failed to print PDF:", error);
    }
  }, [state.pdfBytes, state.textAnnotations, state.signatureAnnotations, state.highlightAnnotations, state.strikethroughAnnotations, state.redactionAnnotations]);

  const handleRasterize = useCallback(async () => {
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
        { rasterize: true }
      );

      const blob = new Blob([new Uint8Array(modifiedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_rasterized.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to rasterize PDF:", error);
    }
  }, [state.pdfBytes, state.textAnnotations, state.signatureAnnotations, state.highlightAnnotations, state.strikethroughAnnotations, state.redactionAnnotations, file.name]);

  if (!state.pdfFile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="animate-pulse text-stone-400 font-body">
          Loading document...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 pt-4">
      <Toolbar
        scale={state.scale}
        activeTool={state.activeTool}
        fileName={file.name}
        isSignaturePopoverOpen={isSignaturePopoverOpen}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onScaleChange={handleToolbarZoom}
        onToolChange={setActiveTool}
        onSignaturePopoverChange={setIsSignaturePopoverOpen}
        onSignatureCreated={handleSignatureCreated}
        onDownload={handleDownload}
        onRasterize={handleRasterize}
        onPrint={handlePrint}
        onReset={onReset}
      />

      <div className="px-4 pt-4 pb-8">
        <PDFViewer
          ref={viewerRef}
          file={file}
          scale={state.scale}
          cssScale={cssScale}
          isZooming={isZooming}
          isCommitting={isCommitting}
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
        />
      </div>

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
