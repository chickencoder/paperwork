"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ToolWindow,
  ToolSection,
  ToolActionButton,
} from "./tool-window";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SplitPdfWindowProps {
  open: boolean;
  onClose: () => void;
  pdfBytes: Uint8Array | null;
  fileName: string;
  onAddTab?: (file: File, bytes: Uint8Array) => void;
}

type SplitMode = "range" | "extract" | "every";

export function SplitPdfWindow({
  open,
  onClose,
  pdfBytes,
  fileName,
  onAddTab,
}: SplitPdfWindowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [mode, setMode] = useState<SplitMode>("extract");
  const [pageRange, setPageRange] = useState("1");
  const [everyN, setEveryN] = useState("1");

  // Get total pages when PDF loads
  useEffect(() => {
    async function getPageCount() {
      if (!pdfBytes || pdfBytes.byteLength === 0) {
        setTotalPages(0);
        return;
      }
      try {
        const pdfDoc = await PDFDocument.load(pdfBytes.slice(), {
          ignoreEncryption: true,
        });
        setTotalPages(pdfDoc.getPageCount());
      } catch {
        setTotalPages(0);
      }
    }
    getPageCount();
  }, [pdfBytes]);

  const parsePageRange = (range: string, max: number): number[] => {
    const pages: Set<number> = new Set();
    const parts = range.split(",").map((p) => p.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= max) {
          pages.add(num);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = useCallback(async () => {
    if (!pdfBytes || pdfBytes.byteLength === 0) return;

    setIsProcessing(true);

    try {
      const srcDoc = await PDFDocument.load(pdfBytes.slice(), {
        ignoreEncryption: true,
      });
      const pageCount = srcDoc.getPageCount();

      let pagesToExtract: number[] = [];

      if (mode === "extract" || mode === "range") {
        pagesToExtract = parsePageRange(pageRange, pageCount);
      } else if (mode === "every") {
        const n = parseInt(everyN, 10) || 1;
        for (let i = 1; i <= pageCount; i += n) {
          pagesToExtract.push(i);
        }
      }

      if (pagesToExtract.length === 0) {
        throw new Error("No valid pages selected");
      }

      // Create new PDF with selected pages
      const newDoc = await PDFDocument.create();
      const pageIndices = pagesToExtract.map((p) => p - 1); // Convert to 0-indexed
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const resultBytes = await newDoc.save();

      // Generate filename for the new PDF
      const baseName = fileName.replace(/\.pdf$/i, "");
      const suffix =
        mode === "extract"
          ? `_pages_${pagesToExtract.join("-")}`
          : mode === "every"
            ? `_every_${everyN}`
            : `_split`;
      const newFileName = `${baseName}${suffix}.pdf`;

      // Create file and add as new tab
      const bytes = new Uint8Array(resultBytes);
      const file = new File([bytes], newFileName, { type: "application/pdf" });
      onAddTab?.(file, bytes);
      onClose();
    } catch (error) {
      console.error("Split failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, fileName, mode, pageRange, everyN]);

  return (
    <ToolWindow open={open} onClose={onClose} title="Split PDF" width={300}>
      <p className="text-[11px] text-muted-foreground">
        {totalPages > 0 ? `${totalPages} pages` : "Loading..."}
      </p>

      <ToolSection label="Mode">
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            type="button"
            variant={mode === "extract" ? "outline" : "secondary"}
            size="sm"
            onClick={() => setMode("extract")}
            className="h-7 text-xs rounded-lg"
          >
            Extract
          </Button>
          <Button
            type="button"
            variant={mode === "range" ? "outline" : "secondary"}
            size="sm"
            onClick={() => setMode("range")}
            className="h-7 text-xs rounded-lg"
          >
            Range
          </Button>
          <Button
            type="button"
            variant={mode === "every" ? "outline" : "secondary"}
            size="sm"
            onClick={() => setMode("every")}
            className="h-7 text-xs rounded-lg"
          >
            Every N
          </Button>
        </div>
      </ToolSection>

      {(mode === "extract" || mode === "range") && (
        <div className="space-y-1.5">
          <Label className="text-xs">Pages</Label>
          <Input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="e.g. 1-3, 5, 7-9"
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Use commas and ranges (1-3, 5, 7-9)
          </p>
        </div>
      )}

      {mode === "every" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Every N pages</Label>
          <Input
            type="number"
            value={everyN}
            onChange={(e) => setEveryN(e.target.value)}
            min={1}
            max={totalPages}
            className="h-8 text-xs"
          />
        </div>
      )}

      <ToolActionButton
        onClick={handleSplit}
        disabled={!pdfBytes || totalPages === 0}
        isLoading={isProcessing}
        loadingText="Splitting..."
      >
        <Scissors className="w-3.5 h-3.5" />
        Split
      </ToolActionButton>
    </ToolWindow>
  );
}
