import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Highlighter,
  Type,
  PenLine,
  Eraser,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EditorViewProps {
  pdfData: Uint8Array | null;
  fileName: string | null;
  onBack?: () => void;
}

type Tool = "select" | "highlight" | "text" | "draw" | "sign" | "eraser";

// All available tools
const tools: { id: Tool; icon: typeof Highlighter; label: string }[] = [
  { id: "highlight", icon: Highlighter, label: "Highlight" },
  { id: "text", icon: Type, label: "Add Text" },
  { id: "draw", icon: PenLine, label: "Draw" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

export function EditorView({
  pdfData,
  fileName,
  onBack,
}: EditorViewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [activeTool, setActiveTool] = useState<Tool>("select");

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));

  const handleDownload = () => {
    // For now, just download the original PDF
    // TODO: Apply modifications before download
    if (pdfData) {
      const blob = new Blob([new Uint8Array(pdfData)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const pdfSource = pdfData ? { data: pdfData } : null;

  if (!pdfSource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No PDF loaded</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-muted text-foreground mr-2"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
              className={`
                p-2 rounded-lg transition-colors
                ${
                  activeTool === tool.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }
              `}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg hover:bg-muted text-foreground"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg hover:bg-muted text-foreground"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Download</span>
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-muted/30">
        <Document
          file={pdfSource}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          }
          error={
            <div className="text-destructive p-4">Failed to load PDF</div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            className="shadow-lg rounded-lg overflow-hidden"
            renderAnnotationLayer
            renderTextLayer
          />
        </Document>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-4 p-3 border-t border-border bg-card">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm text-foreground">
          Page {currentPage} of {numPages || "..."}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage >= numPages}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* File name */}
      {fileName && (
        <div className="text-center py-2 text-xs text-muted-foreground border-t border-border">
          {fileName}
        </div>
      )}
    </div>
  );
}
