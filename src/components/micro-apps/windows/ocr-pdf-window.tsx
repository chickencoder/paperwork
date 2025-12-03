"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Download, Loader2, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWindow, ToolFileSize, ToolSection } from "./tool-window";
import { Button } from "@/components/ui/button";
import {
  extractTextFromPDF,
  downloadTextFile,
  copyTextToClipboard,
  type OCRProgress,
  type OCRResult,
} from "@/lib/pdf/pdf-ocr";

interface OcrPdfWindowProps {
  open: boolean;
  onClose: () => void;
  pdfBytes: Uint8Array | null;
  fileName: string;
}

export function OcrPdfWindow({
  open,
  onClose,
  pdfBytes,
  fileName,
}: OcrPdfWindowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number | "all">("all");
  const abortRef = useRef(false);

  const originalSize = pdfBytes?.byteLength ?? 0;

  const handleOCR = useCallback(async () => {
    if (!pdfBytes || pdfBytes.byteLength === 0) return;

    setIsProcessing(true);
    setResult(null);
    setProgress(null);
    abortRef.current = false;

    try {
      const ocrResult = await extractTextFromPDF(pdfBytes, {
        language: "eng",
        onProgress: (p) => {
          if (!abortRef.current) {
            setProgress(p);
          }
        },
      });
      setResult(ocrResult);
    } catch (error) {
      console.error("OCR failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes]);

  const handleCopy = useCallback(async () => {
    if (!result) return;

    const textToCopy =
      selectedPage === "all"
        ? result.fullText
        : result.pages.find((p) => p.pageNumber === selectedPage)?.text ?? "";

    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result, selectedPage]);

  const handleDownload = useCallback(() => {
    if (!result) return;

    const textToDownload =
      selectedPage === "all"
        ? result.fullText
        : `--- Page ${selectedPage} ---\n\n${result.pages.find((p) => p.pageNumber === selectedPage)?.text ?? ""}`;

    downloadTextFile(textToDownload, fileName);
  }, [result, selectedPage, fileName]);

  const getDisplayText = () => {
    if (!result) return "";
    if (selectedPage === "all") return result.fullText;
    return result.pages.find((p) => p.pageNumber === selectedPage)?.text ?? "";
  };

  const getAverageConfidence = () => {
    if (!result || result.pages.length === 0) return 0;
    const sum = result.pages.reduce((acc, p) => acc + p.confidence, 0);
    return Math.round(sum / result.pages.length);
  };

  return (
    <ToolWindow open={open} onClose={onClose} title="Extract Text (OCR)" width={320}>
      <ToolFileSize label="File size" size={originalSize} />

      <p className="text-[11px] text-muted-foreground">
        Extract text from scanned PDFs using optical character recognition.
        Processing happens entirely in your browser.
      </p>

      {/* Progress indicator */}
      {isProcessing && progress && (
        <div className="px-2.5 py-2 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {progress.status === "initializing"
                ? "Initializing OCR..."
                : `Processing page ${progress.currentPage} of ${progress.totalPages}`}
            </span>
            <span className="text-xs font-medium">
              {progress.status === "initializing"
                ? "..."
                : `${Math.round((progress.currentPage / progress.totalPages) * 100)}%`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width:
                  progress.status === "initializing"
                    ? "5%"
                    : `${(progress.currentPage / progress.totalPages) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Stats */}
          <div className="px-2.5 py-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Pages processed
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {result.pages.length}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Avg. confidence
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  getAverageConfidence() >= 80
                    ? "text-green-600 dark:text-green-400"
                    : getAverageConfidence() >= 60
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                )}
              >
                {getAverageConfidence()}%
              </span>
            </div>
          </div>

          {/* Page selector */}
          {result.pages.length > 1 && (
            <ToolSection label="View">
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={selectedPage === "all" ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedPage("all")}
                  className="h-6 text-[10px] px-2"
                >
                  All
                </Button>
                {result.pages.map((p) => (
                  <Button
                    key={p.pageNumber}
                    type="button"
                    variant={
                      selectedPage === p.pageNumber ? "outline" : "secondary"
                    }
                    size="sm"
                    onClick={() => setSelectedPage(p.pageNumber)}
                    className="h-6 text-[10px] px-2 min-w-[28px]"
                  >
                    {p.pageNumber}
                  </Button>
                ))}
              </div>
            </ToolSection>
          )}

          {/* Text preview */}
          <div className="relative">
            <div className="max-h-[200px] overflow-y-auto p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap break-words font-mono leading-relaxed">
                {getDisplayText() || "(No text detected)"}
              </pre>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCopy}
              size="sm"
              variant="secondary"
              className="flex-1 h-8 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </Button>
          </div>
        </>
      )}

      {/* Start OCR button */}
      {!result && (
        <Button
          type="button"
          onClick={handleOCR}
          disabled={isProcessing || !pdfBytes}
          size="sm"
          className="w-full h-8 text-xs"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5" />
              Extract Text
            </>
          )}
        </Button>
      )}

      {/* Re-run button */}
      {result && (
        <Button
          type="button"
          onClick={handleOCR}
          disabled={isProcessing}
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5" />
              Run OCR Again
            </>
          )}
        </Button>
      )}
    </ToolWindow>
  );
}
