// Types
export * from "./types";

// PDF Loader
export { loadPDF, loadPDFFromBytes, EncryptedPDFError } from "./pdf-loader";
export type { LoadedPDF, LoadPDFOptions } from "./pdf-loader";

// PDF Modifier
export { modifyPDF, rasterizePDF, flattenPDF } from "./pdf-modifier";

// PDF Merger
export { mergePDFs } from "./pdf-merger";
export type { MergeSource, MergeResult } from "./pdf-merger";

// PDF Compressor
export { compressPDF, estimateCompression, formatFileSize } from "./pdf-compressor";
export type {
  CompressionPreset,
  CompressionOptions,
  CompressionResult,
} from "./pdf-compressor";

// PDF OCR
export { extractTextFromPDF, downloadTextFile, copyTextToClipboard } from "./pdf-ocr";
export type { OCROptions, OCRProgress, OCRResult, PageText } from "./pdf-ocr";

// Form Extractor
export { extractFormValues, getFormFieldNames } from "./form-extractor";
export type { ExtractedFormValues } from "./form-extractor";

// Field Mapper
export { pdfToScreen, screenToPdf } from "./field-mapper";
export type { PageDimensions } from "./field-mapper";
