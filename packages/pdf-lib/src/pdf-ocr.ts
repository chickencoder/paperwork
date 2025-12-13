import Tesseract from "tesseract.js";
import * as pdfjs from "pdfjs-dist";

// Type for PDF document from pdf.js
type PDFDocumentProxy = Awaited<
  ReturnType<typeof pdfjs.getDocument>["promise"]
>;

export interface OCROptions {
  language?: string; // default 'eng'
  onProgress?: (progress: OCRProgress) => void;
}

export interface OCRProgress {
  currentPage: number;
  totalPages: number;
  pageProgress: number; // 0-100 for current page
  status: "initializing" | "processing" | "complete";
}

export interface OCRResult {
  pages: PageText[];
  fullText: string;
}

export interface PageText {
  pageNumber: number;
  text: string;
  confidence: number;
}

/**
 * Render a PDF page to a canvas for OCR processing
 */
async function renderPageToCanvas(
  pdfDoc: PDFDocumentProxy,
  pageNum: number
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNum); // 1-indexed in pdf.js

  // Use scale of 2.0 for better OCR accuracy
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

/**
 * Extract text from a PDF using OCR
 */
export async function extractTextFromPDF(
  pdfBytes: Uint8Array,
  options: OCROptions = {}
): Promise<OCRResult> {
  const { language = "eng", onProgress } = options;

  // Initialize progress
  onProgress?.({
    currentPage: 0,
    totalPages: 0,
    pageProgress: 0,
    status: "initializing",
  });

  // Load PDF document once (copy bytes to avoid ArrayBuffer detachment)
  const bytesCopy = pdfBytes.slice();
  const pdfDoc = await pdfjs.getDocument({ data: bytesCopy }).promise;
  const totalPages = pdfDoc.numPages;

  // Create Tesseract worker
  const worker = await Tesseract.createWorker(language, 1, {
    logger: (m) => {
      // Handle progress updates from Tesseract
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        // Progress is reported during page processing
        // We'll update this in the page loop
      }
    },
  });

  const pages: PageText[] = [];

  try {
    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1; // 1-indexed for pdf.js

      onProgress?.({
        currentPage: pageNum,
        totalPages,
        pageProgress: 0,
        status: "processing",
      });

      // Render page to canvas
      const canvas = await renderPageToCanvas(pdfDoc, pageNum);

      onProgress?.({
        currentPage: pageNum,
        totalPages,
        pageProgress: 30,
        status: "processing",
      });

      // Run OCR on the canvas
      const { data } = await worker.recognize(canvas);

      pages.push({
        pageNumber: pageNum,
        text: data.text,
        confidence: data.confidence,
      });

      onProgress?.({
        currentPage: pageNum,
        totalPages,
        pageProgress: 100,
        status: "processing",
      });
    }
  } finally {
    // Always terminate the worker
    await worker.terminate();
    // Clean up PDF document
    pdfDoc.destroy();
  }

  // Combine all page text
  const fullText = pages
    .map((p) => `--- Page ${p.pageNumber} ---\n\n${p.text}`)
    .join("\n\n");

  onProgress?.({
    currentPage: totalPages,
    totalPages,
    pageProgress: 100,
    status: "complete",
  });

  return {
    pages,
    fullText,
  };
}

/**
 * Download text as a .txt file
 */
export function downloadTextFile(text: string, fileName: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.replace(/\.pdf$/i, "_ocr.txt");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
