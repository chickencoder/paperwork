import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";
import type { LoadedPDF } from "./pdf-loader";

export interface PDFMetadata {
  // Page Info
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    width: number;
    height: number;
    rotation: number;
  }>;

  // Form Fields
  formFields: {
    total: number;
    byType: {
      text: number;
      checkbox: number;
      radio: number;
      dropdown: number;
    };
  };

  // Document Properties
  title: string | null;
  author: string | null;
  subject: string | null;
  creator: string | null;
  creationDate: string | null;
  modificationDate: string | null;

  // Content Analysis
  isFlattened: boolean; // No interactive form fields
  isLikelyScanned: boolean; // Very little extractable text

  // File Info
  fileSizeBytes: number;
}

/**
 * Extract comprehensive metadata from a loaded PDF.
 * Uses the already-loaded PDF document and bytes to avoid re-parsing.
 */
export async function extractPDFMetadata(loadedPDF: LoadedPDF): Promise<PDFMetadata> {
  const { document, bytes, pageCount, formFields } = loadedPDF;

  // Extract page dimensions
  const pages = document.getPages().map((page, index) => ({
    pageNumber: index + 1,
    width: Math.round(page.getWidth()),
    height: Math.round(page.getHeight()),
    rotation: page.getRotation().angle,
  }));

  // Count form fields by type
  const fieldCounts = {
    text: 0,
    checkbox: 0,
    radio: 0,
    dropdown: 0,
  };

  for (const field of formFields) {
    if (field.type in fieldCounts) {
      fieldCounts[field.type as keyof typeof fieldCounts]++;
    }
  }

  // Extract document properties
  const title = document.getTitle() ?? null;
  const author = document.getAuthor() ?? null;
  const subject = document.getSubject() ?? null;
  const creator = document.getCreator() ?? null;
  const creationDate = document.getCreationDate()?.toISOString() ?? null;
  const modificationDate = document.getModificationDate()?.toISOString() ?? null;

  // Detect if PDF is likely scanned (very little extractable text)
  const isLikelyScanned = await detectScannedPDF(bytes);

  return {
    pageCount,
    pages,
    formFields: {
      total: formFields.length,
      byType: fieldCounts,
    },
    title,
    author,
    subject,
    creator,
    creationDate,
    modificationDate,
    isFlattened: formFields.length === 0,
    isLikelyScanned,
    fileSizeBytes: bytes.length,
  };
}

/**
 * Detect if a PDF is likely a scanned document by checking for extractable text.
 * Uses pdf.js to extract text content from the first page.
 */
async function detectScannedPDF(bytes: Uint8Array): Promise<boolean> {
  try {
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;

    // Check first page for text content
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    // Calculate total text length
    const textLength = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join("")
      .trim().length;

    // Cleanup
    page.cleanup();
    pdf.destroy();

    // Heuristic: less than 50 chars on first page suggests scanned/image-based
    return textLength < 50;
  } catch {
    // If we can't analyze, assume not scanned
    return false;
  }
}

/**
 * Format metadata as a human-readable summary string.
 */
export function formatMetadataSummary(metadata: PDFMetadata): string {
  const { pageCount, pages, formFields, isFlattened, isLikelyScanned, title } = metadata;

  // Format page dimensions
  const firstPage = pages[0];
  const pageDims = firstPage ? `${firstPage.width}x${firstPage.height}pt` : "unknown";

  // Format form fields
  const fieldTypes = Object.entries(formFields.byType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${count} ${type}`)
    .join(", ");
  const fieldsSummary = formFields.total > 0 ? fieldTypes : "none";

  const lines = [
    `PDF Analysis:`,
    `- Pages: ${pageCount} (${pageDims})`,
    `- Form fields: ${formFields.total} (${fieldsSummary})`,
    `- Flattened: ${isFlattened ? "Yes" : "No"}`,
    `- Scanned: ${isLikelyScanned ? "Yes (image-based)" : "No (text-based)"}`,
  ];

  if (title) {
    lines.push(`- Title: ${title}`);
  }

  return lines.join("\n");
}
