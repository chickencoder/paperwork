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
  ShapeAnnotation,
  ShapeType,
} from "@paperwork/pdf-lib";
import { TextAnnotationOverlay } from "./fields/text-annotation";
import { SignatureAnnotationOverlay } from "./fields/signature-annotation";
import { HighlightOverlay } from "./annotations/highlight-overlay";
import { StrikethroughOverlay } from "./annotations/strikethrough-overlay";
import { RedactionOverlay } from "./annotations/redaction-overlay";
import { ShapeAnnotationOverlay, getShapeColorHex } from "./annotations/shape-annotation";
import { PageSkeleton } from "./page-skeleton";
import { useVirtualizedPages } from "@/hooks/use-virtualized-pages";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// PDF.js options for JPEG 2000 support (OpenJPEG WASM decoder)
const pdfOptions = {
  wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/`,
};

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
  shapeAnnotations: ShapeAnnotation[];
  activeTool: "select" | "text-insert" | "signature" | "shape";
  activeShapeType: ShapeType;
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
  onAddShapeAnnotation: (annotation: ShapeAnnotation) => void;
  onUpdateShapeAnnotation: (
    id: string,
    updates: Partial<Omit<ShapeAnnotation, "id" | "page">>
  ) => void;
  onRemoveShapeAnnotation: (id: string) => void;
  onRemoveHighlight: (id: string) => void;
  onRemoveStrikethrough: (id: string) => void;
  onRemoveRedaction: (id: string) => void;
  onSelectAnnotation: (id: string | null) => void;
  onToolChange: (tool: "select" | "text-insert" | "signature" | "shape") => void;
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
  shape: ShapeAnnotation[];
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
      shapeAnnotations,
      activeTool,
      activeShapeType,
      selectedAnnotationId,
      pendingSignatureData,
      onAddTextAnnotation,
      onUpdateTextAnnotation,
      onRemoveTextAnnotation,
      onAddSignatureAnnotation,
      onUpdateSignatureAnnotation,
      onRemoveSignatureAnnotation,
      onAddShapeAnnotation,
      onUpdateShapeAnnotation,
      onRemoveShapeAnnotation,
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

    // Shape drawing state
    const [isDrawingShape, setIsDrawingShape] = useState(false);
    const [drawingStart, setDrawingStart] = useState<{ x: number; y: number; pageIndex: number } | null>(null);
    const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null);
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
          shape: [],
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

      shapeAnnotations.forEach((a) => {
        const pageAnnotations = map.get(a.page);
        if (pageAnnotations) pageAnnotations.shape.push(a);
      });

      return map;
    }, [
      numPages,
      textAnnotations,
      signatureAnnotations,
      highlightAnnotations,
      strikethroughAnnotations,
      redactionAnnotations,
      shapeAnnotations,
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

    // Helper to get coordinates from mouse/touch event on a page
    const getPageCoordinates = useCallback(
      (e: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent, pageElement: HTMLElement) => {
        const rect = pageElement.getBoundingClientRect();
        const effectiveScale = scale * cssScale;
        let clientX: number, clientY: number;

        if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        return {
          x: (clientX - rect.left) / effectiveScale,
          y: (clientY - rect.top) / effectiveScale,
        };
      },
      [scale, cssScale]
    );

    // Handle mouse down for shape drawing
    const handlePageMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
        if (activeTool !== "shape") return;

        const target = e.target as HTMLElement;
        // Don't start drawing if clicking on form fields or existing annotations
        if (
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.closest(".annotationLayer") ||
          target.closest("[data-annotation]")
        ) {
          return;
        }

        // If a shape is selected, deselect it and switch back to select tool
        if (selectedAnnotationId) {
          onSelectAnnotation(null);
          onToolChange("select");
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const coords = getPageCoordinates(e, e.currentTarget);
        setIsDrawingShape(true);
        setDrawingStart({ ...coords, pageIndex });
        setDrawingCurrent(coords);
      },
      [activeTool, getPageCoordinates, selectedAnnotationId, onSelectAnnotation, onToolChange]
    );

    // Handle touch start for shape drawing
    const handlePageTouchStart = useCallback(
      (e: React.TouchEvent<HTMLDivElement>, pageIndex: number) => {
        if (activeTool !== "shape") return;

        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.closest(".annotationLayer") ||
          target.closest("[data-annotation]")
        ) {
          return;
        }

        // If a shape is selected, deselect it and switch back to select tool
        if (selectedAnnotationId) {
          onSelectAnnotation(null);
          onToolChange("select");
          return;
        }

        e.stopPropagation();

        const coords = getPageCoordinates(e.nativeEvent, e.currentTarget);
        setIsDrawingShape(true);
        setDrawingStart({ ...coords, pageIndex });
        setDrawingCurrent(coords);
      },
      [activeTool, getPageCoordinates, selectedAnnotationId, onSelectAnnotation, onToolChange]
    );

    // Handle drawing move and end
    useEffect(() => {
      if (!isDrawingShape || !drawingStart) return;

      const handleMove = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const pageElement = containerRef.current?.querySelector(
          `[data-page-index="${drawingStart.pageIndex}"]`
        ) as HTMLElement;
        if (!pageElement) return;

        const coords = getPageCoordinates(e, pageElement);
        setDrawingCurrent(coords);
      };

      const handleEnd = () => {
        if (!drawingStart || !drawingCurrent) {
          setIsDrawingShape(false);
          setDrawingStart(null);
          setDrawingCurrent(null);
          return;
        }

        // Calculate shape dimensions
        const width = drawingCurrent.x - drawingStart.x;
        const height = drawingCurrent.y - drawingStart.y;

        // Check if user dragged to create shape or just clicked
        const isLine = activeShapeType === "line" || activeShapeType === "arrow";
        const minSize = 5;
        const hasMinSize = isLine
          ? Math.abs(width) > minSize || Math.abs(height) > minSize
          : Math.abs(width) > minSize && Math.abs(height) > minSize;

        // Default sizes for click-to-place (sensible defaults)
        const defaultRectSize = 100;
        const defaultLineLength = 100;

        let posX = drawingStart.x;
        let posY = drawingStart.y;
        let shapeWidth: number;
        let shapeHeight: number;

        if (hasMinSize) {
          // User dragged - use their dimensions
          shapeWidth = width;
          shapeHeight = height;

          if (!isLine) {
            if (width < 0) {
              posX = drawingStart.x + width;
              shapeWidth = Math.abs(width);
            }
            if (height < 0) {
              posY = drawingStart.y + height;
              shapeHeight = Math.abs(height);
            }
          }
        } else {
          // User just clicked - create default-sized shape centered on click
          if (isLine) {
            // Line/arrow: horizontal line starting from click point
            shapeWidth = defaultLineLength;
            shapeHeight = 0;
          } else {
            // Rectangle/ellipse: centered on click
            posX = drawingStart.x - defaultRectSize / 2;
            posY = drawingStart.y - defaultRectSize / 2;
            shapeWidth = defaultRectSize;
            shapeHeight = defaultRectSize;
          }
        }

        const annotation: ShapeAnnotation = {
          id: `shape-${Date.now()}`,
          page: drawingStart.pageIndex,
          shapeType: activeShapeType,
          position: { x: posX, y: posY },
          width: shapeWidth,
          height: shapeHeight,
          fillColor: "transparent",
          strokeColor: "black",
          strokeWidth: 2,
          opacity: 100,
        };

        onAddShapeAnnotation(annotation);
        onSelectAnnotation(annotation.id);

        setIsDrawingShape(false);
        setDrawingStart(null);
        setDrawingCurrent(null);
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
      };
    }, [isDrawingShape, drawingStart, drawingCurrent, activeShapeType, getPageCoordinates, onAddShapeAnnotation, onSelectAnnotation]);

    // Render shape preview while drawing
    const renderDrawingPreview = useCallback(() => {
      if (!isDrawingShape || !drawingStart || !drawingCurrent) return null;

      const width = drawingCurrent.x - drawingStart.x;
      const height = drawingCurrent.y - drawingStart.y;
      const isLine = activeShapeType === "line" || activeShapeType === "arrow";

      // For preview, position at the drawing start
      let previewX = drawingStart.x;
      let previewY = drawingStart.y;
      let previewWidth = width;
      let previewHeight = height;

      if (!isLine) {
        if (width < 0) {
          previewX = drawingStart.x + width;
          previewWidth = Math.abs(width);
        }
        if (height < 0) {
          previewY = drawingStart.y + height;
          previewHeight = Math.abs(height);
        }
      }

      const strokeWidth = 2;
      const svgWidth = (isLine ? Math.abs(width) + strokeWidth * 2 : previewWidth + strokeWidth) * scale;
      const svgHeight = (isLine ? Math.abs(height) + strokeWidth * 2 : previewHeight + strokeWidth) * scale;

      return (
        <div
          className="absolute pointer-events-none z-40"
          style={{
            left: (isLine ? Math.min(drawingStart.x, drawingCurrent.x) - strokeWidth : previewX - strokeWidth / 2) * scale,
            top: (isLine ? Math.min(drawingStart.y, drawingCurrent.y) - strokeWidth : previewY - strokeWidth / 2) * scale,
          }}
        >
          <svg
            width={svgWidth}
            height={svgHeight}
            className="overflow-visible"
            style={{ opacity: 0.7 }}
          >
            {activeShapeType === "rectangle" && (
              <rect
                x={(strokeWidth / 2) * scale}
                y={(strokeWidth / 2) * scale}
                width={previewWidth * scale}
                height={previewHeight * scale}
                fill="none"
                stroke="#3366cc"
                strokeWidth={strokeWidth * scale}
                strokeDasharray={`${4 * scale} ${4 * scale}`}
              />
            )}
            {activeShapeType === "ellipse" && (
              <ellipse
                cx={(previewWidth / 2 + strokeWidth / 2) * scale}
                cy={(previewHeight / 2 + strokeWidth / 2) * scale}
                rx={(previewWidth / 2) * scale}
                ry={(previewHeight / 2) * scale}
                fill="none"
                stroke="#3366cc"
                strokeWidth={strokeWidth * scale}
                strokeDasharray={`${4 * scale} ${4 * scale}`}
              />
            )}
            {activeShapeType === "triangle" && (
              <polygon
                points={`
                  ${(previewWidth / 2 + strokeWidth / 2) * scale},${(strokeWidth / 2) * scale}
                  ${(previewWidth + strokeWidth / 2) * scale},${(previewHeight + strokeWidth / 2) * scale}
                  ${(strokeWidth / 2) * scale},${(previewHeight + strokeWidth / 2) * scale}
                `}
                fill="none"
                stroke="#3366cc"
                strokeWidth={strokeWidth * scale}
                strokeDasharray={`${4 * scale} ${4 * scale}`}
              />
            )}
            {activeShapeType === "hexagon" && (() => {
              const cx = (previewWidth / 2 + strokeWidth / 2) * scale;
              const cy = (previewHeight / 2 + strokeWidth / 2) * scale;
              const rx = (previewWidth / 2) * scale;
              const ry = (previewHeight / 2) * scale;
              const points = Array.from({ length: 6 }, (_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
              }).join(" ");
              return (
                <polygon
                  points={points}
                  fill="none"
                  stroke="#3366cc"
                  strokeWidth={strokeWidth * scale}
                  strokeDasharray={`${4 * scale} ${4 * scale}`}
                />
              );
            })()}
            {activeShapeType === "star" && (() => {
              const cx = (previewWidth / 2 + strokeWidth / 2) * scale;
              const cy = (previewHeight / 2 + strokeWidth / 2) * scale;
              const outerRx = (previewWidth / 2) * scale;
              const outerRy = (previewHeight / 2) * scale;
              const innerRx = outerRx * 0.4;
              const innerRy = outerRy * 0.4;
              const points = Array.from({ length: 10 }, (_, i) => {
                const angle = (i * 36 - 90) * (Math.PI / 180);
                const isOuter = i % 2 === 0;
                const rx = isOuter ? outerRx : innerRx;
                const ry = isOuter ? outerRy : innerRy;
                return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
              }).join(" ");
              return (
                <polygon
                  points={points}
                  fill="none"
                  stroke="#3366cc"
                  strokeWidth={strokeWidth * scale}
                  strokeDasharray={`${4 * scale} ${4 * scale}`}
                />
              );
            })()}
            {activeShapeType === "callout" && (() => {
              const w = previewWidth * scale;
              const h = previewHeight * scale;
              const p = (strokeWidth / 2) * scale;
              const r = Math.min(8 * scale, w / 4, h / 4);
              const tailWidth = Math.min(20 * scale, w / 3);
              const tailHeight = Math.min(15 * scale, h / 3);
              const path = `
                M ${p + r} ${p}
                H ${p + w - r}
                Q ${p + w} ${p} ${p + w} ${p + r}
                V ${p + h - r}
                Q ${p + w} ${p + h} ${p + w - r} ${p + h}
                H ${p + tailWidth + 10 * scale}
                L ${p} ${p + h + tailHeight}
                L ${p + tailWidth} ${p + h}
                H ${p + r}
                Q ${p} ${p + h} ${p} ${p + h - r}
                V ${p + r}
                Q ${p} ${p} ${p + r} ${p}
                Z
              `;
              return (
                <path
                  d={path}
                  fill="none"
                  stroke="#3366cc"
                  strokeWidth={strokeWidth * scale}
                  strokeDasharray={`${4 * scale} ${4 * scale}`}
                />
              );
            })()}
            {(activeShapeType === "line" || activeShapeType === "arrow") && (
              <>
                {activeShapeType === "arrow" && (
                  <defs>
                    <marker
                      id="preview-arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3366cc" />
                    </marker>
                  </defs>
                )}
                <line
                  x1={(width >= 0 ? strokeWidth : Math.abs(width) + strokeWidth) * scale}
                  y1={(height >= 0 ? strokeWidth : Math.abs(height) + strokeWidth) * scale}
                  x2={(width >= 0 ? Math.abs(width) + strokeWidth : strokeWidth) * scale}
                  y2={(height >= 0 ? Math.abs(height) + strokeWidth : strokeWidth) * scale}
                  stroke="#3366cc"
                  strokeWidth={strokeWidth * scale}
                  strokeDasharray={`${4 * scale} ${4 * scale}`}
                  markerEnd={activeShapeType === "arrow" ? "url(#preview-arrowhead)" : undefined}
                />
              </>
            )}
          </svg>
        </div>
      );
    }, [isDrawingShape, drawingStart, drawingCurrent, activeShapeType, scale]);

    const handlePageClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
        // Shape tool uses mousedown/mouseup, not click
        if (activeTool === "shape") return;

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
          options={pdfOptions}
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
                  cursor: shouldRender && (activeTool === "text-insert" || activeTool === "signature" || activeTool === "shape") ? "crosshair" : "default",
                }}
                onClick={(e) => shouldRender && handlePageClick(e, pageIndex)}
                onMouseDown={(e) => shouldRender && handlePageMouseDown(e, pageIndex)}
                onTouchStart={(e) => shouldRender && handlePageTouchStart(e, pageIndex)}
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
                        cssScale={cssScale}
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
                        cssScale={cssScale}
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
                        cssScale={cssScale}
                        isSelected={selectedAnnotationId === annotation.id}
                        onSelect={() => onSelectAnnotation(annotation.id)}
                        onRemove={() => onRemoveRedaction(annotation.id)}
                      />
                    ))}

                    {/* Shape annotations for this page */}
                    {pageAnnotations?.shape.map((annotation) => (
                      <ShapeAnnotationOverlay
                        key={annotation.id}
                        annotation={annotation}
                        scale={scale}
                        cssScale={cssScale}
                        isSelected={selectedAnnotationId === annotation.id}
                        onSelect={() => onSelectAnnotation(annotation.id)}
                        onUpdate={(updates) =>
                          onUpdateShapeAnnotation(annotation.id, updates)
                        }
                        onRemove={() => onRemoveShapeAnnotation(annotation.id)}
                      />
                    ))}

                    {/* Shape drawing preview */}
                    {isDrawingShape && drawingStart?.pageIndex === pageIndex && renderDrawingPreview()}
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
