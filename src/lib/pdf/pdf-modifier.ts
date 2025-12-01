import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { pdfjs } from "react-pdf";
import type {
  TextAnnotation,
  SignatureAnnotation,
  HighlightAnnotation,
  StrikethroughAnnotation,
  RedactionAnnotation,
  HighlightColor,
  StrikethroughColor,
} from "./types";
import type { ExtractedFormValues } from "./form-extractor";

// Color map for highlight annotations
const HIGHLIGHT_COLORS: Record<HighlightColor, { r: number; g: number; b: number }> = {
  yellow: { r: 1, g: 0.92, b: 0.23 },
  green: { r: 0.6, g: 0.98, b: 0.6 },
  blue: { r: 0.53, g: 0.81, b: 0.98 },
  pink: { r: 1, g: 0.71, b: 0.76 },
  orange: { r: 1, g: 0.85, b: 0.4 },
};

// Color map for strikethrough annotations
const STRIKETHROUGH_COLORS: Record<StrikethroughColor, { r: number; g: number; b: number }> = {
  red: { r: 0.8, g: 0.1, b: 0.1 },
  black: { r: 0.1, g: 0.1, b: 0.1 },
};

// Helper to wrap text to fit within a given width
function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

interface ModifyPDFOptions {
  rasterize?: boolean;
}

export async function modifyPDF(
  originalBytes: Uint8Array,
  formValues: ExtractedFormValues,
  textAnnotations: TextAnnotation[],
  signatureAnnotations: SignatureAnnotation[] = [],
  highlightAnnotations: HighlightAnnotation[] = [],
  strikethroughAnnotations: StrikethroughAnnotation[] = [],
  redactionAnnotations: RedactionAnnotation[] = [],
  options: ModifyPDFOptions = {}
): Promise<Uint8Array> {
  // Load the PDF
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });

  // Get the form if it exists
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  // Apply form values by iterating through PDF form fields
  for (const field of fields) {
    const fieldName = field.getName();
    const value = formValues[fieldName];

    if (value === undefined) continue;

    try {
      const fieldType = field.constructor.name;

      if (fieldType === "PDFTextField") {
        const textField = form.getTextField(fieldName);
        if (typeof value === "string") {
          textField.setText(value);
        }
      } else if (fieldType === "PDFCheckBox") {
        const checkBox = form.getCheckBox(fieldName);
        if (typeof value === "boolean") {
          if (value) {
            checkBox.check();
          } else {
            checkBox.uncheck();
          }
        }
      } else if (fieldType === "PDFRadioGroup") {
        const radioGroup = form.getRadioGroup(fieldName);
        if (typeof value === "string") {
          radioGroup.select(value);
        }
      } else if (fieldType === "PDFDropdown") {
        const dropdown = form.getDropdown(fieldName);
        if (typeof value === "string") {
          dropdown.select(value);
        }
      }
    } catch (error) {
      console.warn(`Could not set value for field ${fieldName}:`, error);
    }
  }

  // Add text annotations
  if (textAnnotations.length > 0) {
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    for (const annotation of textAnnotations) {
      if (annotation.page < pages.length && annotation.text.trim()) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();
        const font = annotation.fontWeight === "bold" ? boldFont : regularFont;
        const lineHeight = annotation.fontSize * 1.2;

        // If width is set, wrap text to multiple lines
        if (annotation.width) {
          const lines = wrapText(
            annotation.text,
            font,
            annotation.fontSize,
            annotation.width
          );

          lines.forEach((line, index) => {
            const pdfY =
              pageHeight -
              annotation.position.y -
              annotation.fontSize -
              index * lineHeight;

            page.drawText(line, {
              x: annotation.position.x,
              y: pdfY,
              size: annotation.fontSize,
              font,
              color: rgb(0.1, 0.1, 0.1),
            });
          });
        } else {
          // Single line text
          const pdfY =
            pageHeight - annotation.position.y - annotation.fontSize;

          page.drawText(annotation.text, {
            x: annotation.position.x,
            y: pdfY,
            size: annotation.fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1),
          });
        }
      }
    }
  }

  // Add signature annotations
  if (signatureAnnotations.length > 0) {
    const pages = pdfDoc.getPages();

    for (const annotation of signatureAnnotations) {
      if (annotation.page < pages.length) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();

        try {
          // Convert data URL to bytes
          const base64Data = annotation.dataUrl.split(",")[1];
          const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
            c.charCodeAt(0)
          );

          // Embed the PNG image
          const image = await pdfDoc.embedPng(imageBytes);

          // Calculate PDF coordinates (flip Y axis)
          const pdfY = pageHeight - annotation.position.y - annotation.height;

          // Draw the image
          page.drawImage(image, {
            x: annotation.position.x,
            y: pdfY,
            width: annotation.width,
            height: annotation.height,
          });
        } catch (error) {
          console.warn("Failed to embed signature:", error);
        }
      }
    }
  }

  // Add highlight annotations
  if (highlightAnnotations.length > 0) {
    const pages = pdfDoc.getPages();

    for (const annotation of highlightAnnotations) {
      if (annotation.page < pages.length) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();
        const color = HIGHLIGHT_COLORS[annotation.color];

        for (const rect of annotation.rects) {
          // Calculate PDF coordinates (flip Y axis)
          const pdfY = pageHeight - rect.y - rect.height;

          page.drawRectangle({
            x: rect.x,
            y: pdfY,
            width: rect.width,
            height: rect.height,
            color: rgb(color.r, color.g, color.b),
            opacity: 0.4,
            borderWidth: 0,
          });
        }
      }
    }
  }

  // Add strikethrough annotations
  if (strikethroughAnnotations.length > 0) {
    const pages = pdfDoc.getPages();

    for (const annotation of strikethroughAnnotations) {
      if (annotation.page < pages.length) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();

        const color = STRIKETHROUGH_COLORS[annotation.color];

        for (const rect of annotation.rects) {
          // Calculate the center Y position of the rect (in PDF coordinates)
          const centerY = pageHeight - rect.y - rect.height / 2;

          page.drawLine({
            start: { x: rect.x, y: centerY },
            end: { x: rect.x + rect.width, y: centerY },
            thickness: 1.5,
            color: rgb(color.r, color.g, color.b),
            opacity: 1,
          });
        }
      }
    }
  }

  // Add redaction annotations (solid black rectangles) - only draw if enabled
  if (redactionAnnotations.length > 0) {
    const pages = pdfDoc.getPages();

    for (const annotation of redactionAnnotations) {
      // Only draw redaction if it's enabled
      if (annotation.page < pages.length && annotation.enabled) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();

        for (const rect of annotation.rects) {
          // Calculate PDF coordinates (flip Y axis)
          const pdfY = pageHeight - rect.y - rect.height;

          page.drawRectangle({
            x: rect.x,
            y: pdfY,
            width: rect.width,
            height: rect.height,
            color: rgb(0, 0, 0),
            opacity: 1,
            borderWidth: 0,
          });
        }
      }
    }
  }

  // If rasterize option is enabled, convert each page to an image
  if (options.rasterize) {
    const modifiedBytes = await pdfDoc.save();
    return rasterizePDF(modifiedBytes);
  }

  return pdfDoc.save();
}

/**
 * Rasterizes a PDF by rendering each page to a canvas and embedding
 * the resulting images back into a new PDF. This ensures any text
 * (including redacted text) cannot be extracted from the resulting PDF.
 */
async function rasterizePDF(pdfBytes: Uint8Array): Promise<Uint8Array> {
  // Configure pdfjs worker (same as react-pdf uses)
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  // Load the PDF with pdfjs
  const loadingTask = pdfjs.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // Create a new PDF document for the rasterized output
  const newPdfDoc = await PDFDocument.create();

  // Render each page at a higher resolution for quality (2x scale)
  const scale = 2;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create a canvas to render the page
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get canvas 2d context");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render the page to canvas
    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    // Convert canvas to JPEG (smaller file size than PNG)
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const base64Data = imageDataUrl.split(",")[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Embed the image in the new PDF
    const image = await newPdfDoc.embedJpg(imageBytes);

    // Get original page dimensions
    const originalViewport = page.getViewport({ scale: 1 });
    const pageWidth = originalViewport.width;
    const pageHeight = originalViewport.height;

    // Add a new page with the same dimensions as the original
    const newPage = newPdfDoc.addPage([pageWidth, pageHeight]);

    // Draw the image to fill the page
    newPage.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  return newPdfDoc.save();
}

export async function flattenPDF(bytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  form.flatten();
  return pdfDoc.save();
}
