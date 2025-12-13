"use client";

import { useState, useCallback, useEffect } from "react";
import { RotateCw, RotateCcw } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { ToolWindow, ToolSection, ToolActionButton } from "./tool-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RotatePdfWindowProps {
  open: boolean;
  onClose: () => void;
  pdfBytes: Uint8Array | null;
  fileName: string;
  onApply?: (newBytes: Uint8Array) => void;
}

type RotateAngle = "90" | "180" | "270";

export function RotatePdfWindow({
  open,
  onClose,
  pdfBytes,
  onApply,
}: RotatePdfWindowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [angle, setAngle] = useState<RotateAngle>("90");
  const [allPages, setAllPages] = useState(true);
  const [pageRange, setPageRange] = useState("");

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

  const handleRotate = useCallback(async () => {
    if (!pdfBytes || pdfBytes.byteLength === 0) return;

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes.slice(), {
        ignoreEncryption: true,
      });
      const pageCount = pdfDoc.getPageCount();
      const pagesToRotate = allPages
        ? Array.from({ length: pageCount }, (_, i) => i + 1)
        : parsePageRange(pageRange, pageCount);

      const angleNum = parseInt(angle, 10);
      for (const pageNum of pagesToRotate) {
        const page = pdfDoc.getPage(pageNum - 1);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + angleNum));
      }

      const resultBytes = await pdfDoc.save();
      onApply?.(resultBytes);
    } catch (error) {
      console.error("Rotate failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, angle, allPages, pageRange, onApply]);

  return (
    <ToolWindow open={open} onClose={onClose} title="Rotate PDF">
      <p className="text-[11px] text-muted-foreground">
        {totalPages > 0 ? `${totalPages} pages` : "Loading..."}
      </p>

      <ToolSection label="Rotation">
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            type="button"
            variant={angle === "270" ? "outline" : "secondary"}
            size="sm"
            onClick={() => setAngle("270")}
            className="h-8 text-xs rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Left
          </Button>
          <Button
            type="button"
            variant={angle === "180" ? "outline" : "secondary"}
            size="sm"
            onClick={() => setAngle("180")}
            className="h-8 text-xs rounded-lg"
          >
            180°
          </Button>
          <Button
            type="button"
            variant={angle === "90" ? "outline" : "secondary"}
            size="sm"
            onClick={() => setAngle("90")}
            className="h-8 text-xs rounded-lg"
          >
            Right
            <RotateCw className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </ToolSection>

      <ToolSection label="Pages">
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            type="button"
            variant={allPages ? "outline" : "secondary"}
            size="sm"
            onClick={() => setAllPages(true)}
            className="h-7 text-xs rounded-lg"
          >
            All pages
          </Button>
          <Button
            type="button"
            variant={!allPages ? "outline" : "secondary"}
            size="sm"
            onClick={() => setAllPages(false)}
            className="h-7 text-xs rounded-lg"
          >
            Custom
          </Button>
        </div>
      </ToolSection>

      {!allPages && (
        <Input
          type="text"
          value={pageRange}
          onChange={(e) => setPageRange(e.target.value)}
          placeholder="1-3, 5, 7-9"
          className="h-8 text-xs"
        />
      )}

      <ToolActionButton
        onClick={handleRotate}
        disabled={!pdfBytes || totalPages === 0}
        isLoading={isProcessing}
        loadingText="Rotating..."
      >
        <RotateCw className="w-3.5 h-3.5" />
        Rotate
      </ToolActionButton>
    </ToolWindow>
  );
}
