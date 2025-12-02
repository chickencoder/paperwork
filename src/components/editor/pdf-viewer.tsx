"use client";

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TextAnnotation,
  SignatureAnnotation,
  HighlightAnnotation,
  StrikethroughAnnotation,
  RedactionAnnotation,
} from "@/lib/pdf/types";
import { TextAnnotationOverlay } from "./fields/text-annotation";
import { SignatureAnnotationOverlay } from "./fields/signature-annotation";
import { HighlightOverlay } from "./annotations/highlight-overlay";
import { StrikethroughOverlay } from "./annotations/strikethrough-overlay";
import { RedactionOverlay } from "./annotations/redaction-overlay";
import { PageSkeleton } from "./page-skeleton";
import { useVirtualizedPages } from "@/hooks/use-virtualized-pages";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Default US Letter page size (612x792 points at 72 DPI)
const DEFAULT_PAGE_WIDTH = 612;
const DEFAULT_PAGE_HEIGHT = 792;

function PageLoading({ scale }: { scale: number }) {
  return (
    <div
      className="relative shadow-xl rounded-sm bg-white flex items-center justify-center"
      style={{
        width: DEFAULT_PAGE_WIDTH * scale,
        height: DEFAULT_PAGE_HEIGHT * scale,
      }}
    >
      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
    </div>
  );
}

interface PDFViewerProps {
  file: File;
  scale: number;
  cssScale?: number;
  textAnnotations: TextAnnotation[];
  signatureAnnotations: SignatureAnnotation[];
  highlightAnnotations: HighlightAnnotation[];
  strikethroughAnnotations: StrikethroughAnnotation[];
  redactionAnnotations: RedactionAnnotation[];
  activeTool: "select" | "text-insert" | "signature";
  selectedAnnotationId: string | null;
  pendingSignatureData: string | null;
  onAddTextAnnotation: (annotation: TextAnnotation) => void;
  onUpdateTextAnnotation: (
    id: string,
    updates: Partial<Omit<TextAnnotation, "id" | "page">>
  ) => void;
  onRemoveTextAnnotation: (id: string) => void;
  onAddSignatureAnnotation: (annotation: SignatureAnnotation) => void;
  onUpdateSignatureAnnotation: (
    id: string,
    updates: Partial<Omit<SignatureAnnotation, "id" | "page" | "dataUrl">>
  ) => void;
  onRemoveSignatureAnnotation: (id: string) => void;
  onRemoveHighlight: (id: string) => void;
  onRemoveStrikethrough: (id: string) => void;
  onRemoveRedaction: (id: string) => void;
  onSelectAnnotation: (id: string | null) => void;
  onToolChange: (tool: "select" | "text-insert" | "signature") => void;
  onSignaturePlaced: () => void;
  onFormFieldChange?: (fieldId: string, value: string | boolean, previousValue: string | boolean) => void;
  onDocumentLoad?: (numPages: number) => void;
  onCurrentPageChange?: (page: number) => void;
  isBackgrounded?: boolean;
}

// Memoized annotations by page for O(1) lookup
interface AnnotationsByPage {
  text: TextAnnotation[];
  signature: SignatureAnnotation[];
  highlight: HighlightAnnotation[];
  strikethrough: StrikethroughAnnotation[];
  redaction: RedactionAnnotation[];
}

export interface PDFViewerHandle {
  getContainer: () => HTMLDivElement | null;
  setFormFieldValue: (fieldId: string, value: string | boolean) => void;
  forceRenderAllPages: () => void;
}

export const PDFViewer = forwardRef<PDFViewerHandle, PDFViewerProps>(
  function PDFViewer(
    {
      file,
      scale,
      cssScale = 1,
      textAnnotations,
      signatureAnnotations,
      highlightAnnotations,
      strikethroughAnnotations,
      redactionAnnotations,
      activeTool,
      selectedAnnotationId,
      pendingSignatureData,
      onAddTextAnnotation,
      onUpdateTextAnnotation,
      onRemoveTextAnnotation,
      onAddSignatureAnnotation,
      onUpdateSignatureAnnotation,
      onRemoveSignatureAnnotation,
      onRemoveHighlight,
      onRemoveStrikethrough,
      onRemoveRedaction,
      onSelectAnnotation,
      onToolChange,
      onSignaturePlaced,
      onFormFieldChange,
      onDocumentLoad,
      onCurrentPageChange,
      isBackgrounded = false,
    },
    ref
  ) {
    const [numPages, setNumPages] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    // Track previous values for form fields (for undo)
    const formFieldValuesRef = useRef<Map<string, string | boolean>>(new Map());

    // Virtualization hook - determines which pages to render
    const { pages, currentPage, forceRenderAll } = useVirtualizedPages({
      totalPages: numPages,
      containerRef,
      visibleBuffer: isBackgrounded ? 1 : 2,
      preloadBuffer: isBackgrounded ? 0 : 2,
    });

    // Notify parent of current page changes
    useEffect(() => {
      onCurrentPageChange?.(currentPage);
    }, [currentPage, onCurrentPageChange]);

    // Memoize annotations by page for O(1) lookup instead of O(n) filter per page
    const annotationsByPage = useMemo(() => {
      const map = new Map<number, AnnotationsByPage>();

      // Initialize empty arrays for all pages
      for (let i = 0; i < numPages; i++) {
        map.set(i, {
          text: [],
          signature: [],
          highlight: [],
          strikethrough: [],
          redaction: [],
        });
      }

      // Distribute annotations to their pages
      textAnnotations.forEach((a) => {
        const pageAnnotations = map.get(a.page);
        if (pageAnnotations) pageAnnotations.text.push(a);
      });

      signatureAnnotations.forEach((a) => {
        const pageAnnotations = map.get(a.page);
        if (pageAnnotations) pageAnnotations.signature.push(a);
      });

      highlightAnnotations.forEach((a) => {
        const pageAnnotations = map.get(a.page);
        if (pageAnnotations) pageAnnotations.highlight.push(a);
      });

      strikethroughAnnotations.forEach((a) => {
        const pageAnnotations = map.get(a.page);
        if (pageAnnotations) pageAnnotations.strikethrough.push(a);
      });

      redactionAnnotations.forEach((a) => {
        const pageAnnotations = map.get(a.page);
        if (pageAnnotations) pageAnnotations.redaction.push(a);
      });

      return map;
    }, [
      numPages,
      textAnnotations,
      signatureAnnotations,
      highlightAnnotations,
      strikethroughAnnotations,
      redactionAnnotations,
    ]);

    useImperativeHandle(ref, () => ({
      getContainer: () => containerRef.current,
      setFormFieldValue: (fieldId: string, value: string | boolean) => {
        const container = containerRef.current;
        if (!container) return;

        // Find the form field by name
        const field = container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          `[name="${fieldId}"]`
        );
        if (!field) return;

        // Update the stored value to prevent triggering change tracking
        formFieldValuesRef.current.set(fieldId, value);

        // Set the value based on field type
        if (field.type === "checkbox") {
          (field as HTMLInputElement).checked = value as boolean;
        } else {
          field.value = value as string;
        }
      },
      forceRenderAllPages: forceRenderAll,
    }));

    // Listen for form field changes to track for undo/redo
    useEffect(() => {
      const container = containerRef.current;
      if (!container || !onFormFieldChange) return;

      const handleFocus = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (!target.name) return;

        // Store the initial value when field is focused
        if (target.type === "checkbox") {
          formFieldValuesRef.current.set(target.name, (target as HTMLInputElement).checked);
        } else {
          formFieldValuesRef.current.set(target.name, target.value);
        }
      };

      const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (!target.name) return;

        const previousValue = formFieldValuesRef.current.get(target.name);
        let currentValue: string | boolean;

        if (target.type === "checkbox") {
          currentValue = (target as HTMLInputElement).checked;
        } else {
          currentValue = target.value;
        }

        // Only track if we have a previous value and it changed
        if (previousValue !== undefined && previousValue !== currentValue) {
          onFormFieldChange(target.name, currentValue, previousValue);
          // Update stored value for next change
          formFieldValuesRef.current.set(target.name, currentValue);
        }
      };

      // Use capture phase to catch events before they bubble
      container.addEventListener("focusin", handleFocus, true);
      container.addEventListener("change", handleChange, true);
      container.addEventListener("input", handleChange, true);

      return () => {
        container.removeEventListener("focusin", handleFocus, true);
        container.removeEventListener("change", handleChange, true);
        container.removeEventListener("input", handleChange, true);
      };
    }, [onFormFieldChange]);

    const onDocumentLoadSuccess = useCallback(
      ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        onDocumentLoad?.(numPages);
      },
      [onDocumentLoad]
    );

    const handlePageClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
        // Don't handle clicks on form fields
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.closest(".annotationLayer")
        ) {
          return;
        }

        // If there's a selected annotation, deselect it instead of creating new
        if (selectedAnnotationId) {
          onSelectAnnotation(null);
          return;
        }

        // Check if clicking on an existing annotation
        if (target.closest("[data-annotation]")) {
          return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        // Use effectiveScale (baseScale * cssScale) since getBoundingClientRect returns CSS-scaled dimensions
        const effectiveScale = scale * cssScale;
        const x = (e.clientX - rect.left) / effectiveScale;
        const y = (e.clientY - rect.top) / effectiveScale;

        // Handle text insertion
        if (activeTool === "text-insert") {
          const annotation: TextAnnotation = {
            id: `annotation-${Date.now()}`,
            page: pageIndex,
            position: { x, y },
            text: "",
            fontSize: 12,
            fontFamily: "helvetica",
            fontWeight: "normal",
            fontStyle: "normal",
            color: "black",
            textAlign: "left",
          };

          onAddTextAnnotation(annotation);
          onToolChange("select");
        }

        // Handle signature placement
        if (activeTool === "signature" && pendingSignatureData) {
          // Get dimensions from the image
          const img = new Image();
          img.src = pendingSignatureData;

          // Use default dimensions, will be updated when image loads
          const defaultWidth = 150;
          const defaultHeight = 60;

          const annotation: SignatureAnnotation = {
            id: `sig-${Date.now()}`,
            page: pageIndex,
            position: { x: x - defaultWidth / 2, y: y - defaultHeight / 2 },
            width: defaultWidth,
            height: defaultHeight,
            dataUrl: pendingSignatureData,
          };

          // Try to get actual dimensions
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const width = 150;
            const height = width / aspectRatio;
            onUpdateSignatureAnnotation(annotation.id, { width, height });
          };

          onAddSignatureAnnotation(annotation);
          onSignaturePlaced();
          onToolChange("select");
        }
      },
      [activeTool, scale, cssScale, selectedAnnotationId, pendingSignatureData, onAddTextAnnotation, onAddSignatureAnnotation, onUpdateSignatureAnnotation, onSelectAnnotation, onToolChange, onSignaturePlaced]
    );

    // Calculate the expected page height for margin compensation
    // Each page is DEFAULT_PAGE_HEIGHT * scale, plus gap-6 (24px) between pages, plus py-8 (32px * 2) padding
    const pageHeight = DEFAULT_PAGE_HEIGHT * scale;
    const gapSize = 24; // gap-6 = 1.5rem = 24px
    const paddingY = 64; // py-8 = 2rem * 2 = 64px
    const totalContentHeight = numPages > 0
      ? (pageHeight * numPages) + (gapSize * (numPages - 1)) + paddingY
      : 0;
    // The extra space is (1 - cssScale) * totalContentHeight
    const marginCompensation = cssScale !== 1 && totalContentHeight > 0
      ? -(totalContentHeight * (1 - cssScale))
      : 0;

    return (
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col items-center gap-6 py-8",
          cssScale !== 1 && "will-change-transform"
        )}
        style={{
          transform: cssScale !== 1 ? `scale(${cssScale})` : undefined,
          transformOrigin: "center top",
          // When CSS-scaled, the visual height is smaller than DOM height
          // Use negative margin to compensate (removes the extra space)
          marginBottom: marginCompensation !== 0 ? marginCompensation : undefined,
        }}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center gap-6"
          loading={<div className="h-96" />}
        >
          {pages.map(({ pageIndex, shouldRender }) => {
            const pageAnnotations = annotationsByPage.get(pageIndex);

            return (
              <div
                key={`page-${pageIndex}`}
                data-page-index={pageIndex}
                data-page-number={pageIndex + 1}
                className="relative"
                style={{
                  cursor: shouldRender && (activeTool === "text-insert" || activeTool === "signature") ? "crosshair" : "default",
                }}
                onClick={(e) => shouldRender && handlePageClick(e, pageIndex)}
              >
                {shouldRender ? (
                  <>
                    <Page
                      pageNumber={pageIndex + 1}
                      scale={scale}
                      className={cn(
                        "shadow-xl rounded-sm bg-white transition-shadow duration-300",
                        "hover:shadow-2xl"
                      )}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      renderForms={true}
                      loading={<PageLoading scale={scale} />}
                    />

                    {/* Text annotations for this page (using memoized lookup) */}
                    {pageAnnotations?.text.map((annotation) => (
                      <TextAnnotationOverlay
                        key={annotation.id}
                        annotation={annotation}
                        scale={scale}
                        cssScale={cssScale}
                        isSelected={selectedAnnotationId === annotation.id}
                        onSelect={() => onSelectAnnotation(annotation.id)}
                        onUpdate={(updates) =>
                          onUpdateTextAnnotation(annotation.id, updates)
                        }
                        onRemove={() => onRemoveTextAnnotation(annotation.id)}
                      />
                    ))}

                    {/* Signature annotations for this page */}
                    {pageAnnotations?.signature.map((annotation) => (
                      <SignatureAnnotationOverlay
                        key={annotation.id}
                        annotation={annotation}
                        scale={scale}
                        cssScale={cssScale}
                        isSelected={selectedAnnotationId === annotation.id}
                        onSelect={() => onSelectAnnotation(annotation.id)}
                        onUpdate={(updates) =>
                          onUpdateSignatureAnnotation(annotation.id, updates)
                        }
                        onRemove={() => onRemoveSignatureAnnotation(annotation.id)}
                      />
                    ))}

                    {/* Highlight annotations for this page */}
                    {pageAnnotations?.highlight.map((annotation) => (
                      <HighlightOverlay
                        key={annotation.id}
                        annotation={annotation}
                        scale={scale}
                        isSelected={selectedAnnotationId === annotation.id}
                        onSelect={() => onSelectAnnotation(annotation.id)}
                        onRemove={() => onRemoveHighlight(annotation.id)}
                      />
                    ))}

                    {/* Strikethrough annotations for this page */}
                    {pageAnnotations?.strikethrough.map((annotation) => (
                      <StrikethroughOverlay
                        key={annotation.id}
                        annotation={annotation}
                        scale={scale}
                        isSelected={selectedAnnotationId === annotation.id}
                        onSelect={() => onSelectAnnotation(annotation.id)}
                        onRemove={() => onRemoveStrikethrough(annotation.id)}
                      />
                    ))}

                    {/* Redaction annotations for this page */}
                    {pageAnnotations?.redaction.map((annotation) => (
                      <RedactionOverlay
                        key={annotation.id}
                        annotation={annotation}
                        scale={scale}
                        isSelected={selectedAnnotationId === annotation.id}
                        onSelect={() => onSelectAnnotation(annotation.id)}
                        onRemove={() => onRemoveRedaction(annotation.id)}
                      />
                    ))}
                  </>
                ) : (
                  <PageSkeleton
                    scale={scale}
                    pageNumber={pageIndex + 1}
                  />
                )}
              </div>
            );
          })}
        </Document>
      </div>
    );
  }
);
