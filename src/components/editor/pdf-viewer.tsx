import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
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

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  scale: number;
  cssScale?: number;
  isZooming?: boolean;
  isCommitting?: boolean;
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
}

export interface PDFViewerHandle {
  getContainer: () => HTMLDivElement | null;
  setFormFieldValue: (fieldId: string, value: string | boolean) => void;
}

export const PDFViewer = forwardRef<PDFViewerHandle, PDFViewerProps>(
  function PDFViewer(
    {
      file,
      scale,
      cssScale = 1,
      isZooming = false,
      isCommitting = false,
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
    },
    ref
  ) {
    const [numPages, setNumPages] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    // Track previous values for form fields (for undo)
    const formFieldValuesRef = useRef<Map<string, string | boolean>>(new Map());

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
      },
      []
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
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        // Handle text insertion
        if (activeTool === "text-insert") {
          const annotation: TextAnnotation = {
            id: `annotation-${Date.now()}`,
            page: pageIndex,
            position: { x, y },
            text: "",
            fontSize: 12,
            fontWeight: "normal",
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
      [activeTool, scale, selectedAnnotationId, pendingSignatureData, onAddTextAnnotation, onAddSignatureAnnotation, onUpdateSignatureAnnotation, onSelectAnnotation, onToolChange, onSignaturePlaced]
    );

    return (
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col items-center gap-6 py-8",
          isZooming && "will-change-transform",
          // Suppress all transitions during zoom to prevent animation glitches
          isZooming && "[&_*]:!transition-none",
          // Use visibility instead of opacity - more reliable hiding during commit
          isCommitting && "invisible"
        )}
        style={{
          transform: cssScale !== 1 ? `scale(${cssScale})` : undefined,
          transformOrigin: "center top",
        }}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center gap-6"
          loading={
            <div className="flex items-center justify-center h-96">
              <div className="animate-pulse text-stone-400 font-body">
                Loading PDF...
              </div>
            </div>
          }
        >
          {Array.from({ length: numPages }, (_, index) => (
            <div
              key={`page-${index}`}
              data-page-index={index}
              className="relative shadow-xl rounded-sm bg-white"
              style={{
                cursor: activeTool === "text-insert" || activeTool === "signature" ? "crosshair" : "default",
              }}
              onClick={(e) => handlePageClick(e, index)}
            >
              <Page
                pageNumber={index + 1}
                scale={scale}
                className={cn(
                  "transition-shadow duration-300",
                  "hover:shadow-2xl"
                )}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                renderForms={true}
              />

              {/* Text annotations for this page */}
              {textAnnotations
                .filter((a) => a.page === index)
                .map((annotation) => (
                  <TextAnnotationOverlay
                    key={annotation.id}
                    annotation={annotation}
                    scale={scale}
                    isSelected={selectedAnnotationId === annotation.id}
                    onSelect={() => onSelectAnnotation(annotation.id)}
                    onUpdate={(updates) =>
                      onUpdateTextAnnotation(annotation.id, updates)
                    }
                    onRemove={() => onRemoveTextAnnotation(annotation.id)}
                  />
                ))}

              {/* Signature annotations for this page */}
              {signatureAnnotations
                .filter((a) => a.page === index)
                .map((annotation) => (
                  <SignatureAnnotationOverlay
                    key={annotation.id}
                    annotation={annotation}
                    scale={scale}
                    isSelected={selectedAnnotationId === annotation.id}
                    onSelect={() => onSelectAnnotation(annotation.id)}
                    onUpdate={(updates) =>
                      onUpdateSignatureAnnotation(annotation.id, updates)
                    }
                    onRemove={() => onRemoveSignatureAnnotation(annotation.id)}
                  />
                ))}

              {/* Highlight annotations for this page */}
              {highlightAnnotations
                .filter((a) => a.page === index)
                .map((annotation) => (
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
              {strikethroughAnnotations
                .filter((a) => a.page === index)
                .map((annotation) => (
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
              {redactionAnnotations
                .filter((a) => a.page === index)
                .map((annotation) => (
                  <RedactionOverlay
                    key={annotation.id}
                    annotation={annotation}
                    scale={scale}
                    isSelected={selectedAnnotationId === annotation.id}
                    onSelect={() => onSelectAnnotation(annotation.id)}
                    onRemove={() => onRemoveRedaction(annotation.id)}
                  />
                ))}
            </div>
          ))}
        </Document>
      </div>
    );
  }
);
