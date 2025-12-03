"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ToolWindow,
  ToolFileSize,
  ToolDownloadButton,
  downloadPdf,
} from "./tool-window";

interface UnlockPdfWindowProps {
  open: boolean;
  onClose: () => void;
  pdfBytes: Uint8Array | null;
  fileName: string;
}

export function UnlockPdfWindow({
  open,
  onClose,
  pdfBytes,
  fileName,
}: UnlockPdfWindowProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const originalSize = pdfBytes?.byteLength ?? 0;

  const handleUnlock = useCallback(async () => {
    if (!pdfBytes || pdfBytes.byteLength === 0) return;

    setIsProcessing(true);

    try {
      // Load the encrypted PDF
      const srcDoc = await PDFDocument.load(pdfBytes.slice(), {
        ignoreEncryption: true,
      });

      // Create a new unencrypted document
      const newDoc = await PDFDocument.create();

      // Copy all pages to the new document
      const pageCount = srcDoc.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      // Save without encryption
      const unlockedBytes = await newDoc.save();

      // Auto-download
      const newFileName = fileName.replace(/\.pdf$/i, "_unlocked.pdf");
      downloadPdf(unlockedBytes, newFileName);
    } catch (error) {
      console.error("Unlock failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, fileName]);

  return (
    <ToolWindow open={open} onClose={onClose} title="Unlock PDF">
      <ToolFileSize label="Original size" size={originalSize} />

      <p className="text-[11px] text-muted-foreground">
        Removes password protection and restrictions from your PDF.
      </p>

      <ToolDownloadButton
        onClick={handleUnlock}
        disabled={!pdfBytes}
        isLoading={isProcessing}
        isDone={false}
      />
    </ToolWindow>
  );
}
