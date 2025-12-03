"use client";

import { useState, useCallback } from "react";
import {
  ToolWindow,
  ToolFileSize,
  ToolDownloadButton,
} from "./tool-window";
import { rasterizePDF } from "@/lib/pdf/pdf-modifier";
import { downloadPdf } from "./tool-window";

interface FlattenPdfWindowProps {
  open: boolean;
  onClose: () => void;
  pdfBytes: Uint8Array | null;
  fileName: string;
}

export function FlattenPdfWindow({
  open,
  onClose,
  pdfBytes,
  fileName,
}: FlattenPdfWindowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const originalSize = pdfBytes?.byteLength ?? 0;

  const handleFlatten = useCallback(async () => {
    if (!pdfBytes || pdfBytes.byteLength === 0) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const flattenedBytes = await rasterizePDF(pdfBytes.slice());
      setResult(flattenedBytes);

      // Auto-download
      const newFileName = fileName.replace(/\.pdf$/i, "_flattened.pdf");
      downloadPdf(flattenedBytes, newFileName);
    } catch (error) {
      console.error("Flatten failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, fileName]);

  return (
    <ToolWindow open={open} onClose={onClose} title="Flatten PDF">
      <ToolFileSize label="Original size" size={originalSize} />

      <p className="text-[11px] text-muted-foreground">
        Converts all pages to images, making text non-selectable and
        annotations permanent.
      </p>

      {result && (
        <ToolFileSize
          label="Flattened size"
          size={result.byteLength}
          variant="success"
        />
      )}

      <ToolDownloadButton
        onClick={handleFlatten}
        disabled={!pdfBytes}
        isLoading={isProcessing}
        isDone={!!result}
      />
    </ToolWindow>
  );
}
