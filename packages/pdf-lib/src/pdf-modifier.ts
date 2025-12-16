import { PDFDocument, StandardFonts, rgb, PDFFont, degrees } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";
import type {
  TextAnnotation,
  SignatureAnnotation,
  HighlightAnnotation,
  StrikethroughAnnotation,
  RedactionAnnotation,
  ShapeAnnotation,
  InlineTextEdit,
  HighlightColor,
  StrikethroughColor,
  TextAnnotationColor,
  ShapeColor,
  SignatureColor,
  FontFamily,
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

// Color map for text annotations
const TEXT_ANNOTATION_COLORS: Record<TextAnnotationColor, { r: number; g: number; b: number }> = {
  // Grayscale
  "black": { r: 0.1, g: 0.1, b: 0.1 },
  "dark-gray": { r: 0.3, g: 0.3, b: 0.3 },
  "gray": { r: 0.5, g: 0.5, b: 0.5 },
  "light-gray": { r: 0.7, g: 0.7, b: 0.7 },
  // Blues
  "navy": { r: 0.1, g: 0.2, b: 0.5 },
  "blue": { r: 0.2, g: 0.4, b: 0.8 },
  "sky": { r: 0.4, g: 0.65, b: 0.9 },
  // Reds
  "dark-red": { r: 0.6, g: 0.1, b: 0.1 },
  "red": { r: 0.85, g: 0.2, b: 0.2 },
  "coral": { r: 0.95, g: 0.4, b: 0.3 },
  // Greens
  "dark-green": { r: 0.1, g: 0.4, b: 0.2 },
  "green": { r: 0.2, g: 0.6, b: 0.35 },
  "teal": { r: 0.2, g: 0.55, b: 0.55 },
  // Warm
  "brown": { r: 0.5, g: 0.3, b: 0.2 },
  "orange": { r: 0.95, g: 0.5, b: 0.1 },
  "amber": { r: 0.95, g: 0.7, b: 0.15 },
  // Cool
  "purple": { r: 0.5, g: 0.2, b: 0.65 },
  "pink": { r: 0.9, g: 0.4, b: 0.55 },
  "magenta": { r: 0.8, g: 0.2, b: 0.55 },
};

// Color map for shape annotations (includes transparent)
const SHAPE_COLORS: Record<Exclude<ShapeColor, "transparent">, { r: number; g: number; b: number }> = {
  // Grayscale
  "black": { r: 0.1, g: 0.1, b: 0.1 },
  "dark-gray": { r: 0.3, g: 0.3, b: 0.3 },
  "gray": { r: 0.5, g: 0.5, b: 0.5 },
  "light-gray": { r: 0.7, g: 0.7, b: 0.7 },
  // Blues
  "navy": { r: 0.1, g: 0.2, b: 0.5 },
  "blue": { r: 0.2, g: 0.4, b: 0.8 },
  "sky": { r: 0.4, g: 0.65, b: 0.9 },
  // Reds
  "dark-red": { r: 0.6, g: 0.1, b: 0.1 },
  "red": { r: 0.85, g: 0.2, b: 0.2 },
  "coral": { r: 0.95, g: 0.4, b: 0.3 },
  // Greens
  "dark-green": { r: 0.1, g: 0.4, b: 0.2 },
  "green": { r: 0.2, g: 0.6, b: 0.35 },
  "teal": { r: 0.2, g: 0.55, b: 0.55 },
  // Warm
  "brown": { r: 0.5, g: 0.3, b: 0.2 },
  "orange": { r: 0.95, g: 0.5, b: 0.1 },
  "amber": { r: 0.95, g: 0.7, b: 0.15 },
  // Cool
  "purple": { r: 0.5, g: 0.2, b: 0.65 },
  "pink": { r: 0.9, g: 0.4, b: 0.55 },
  "magenta": { r: 0.8, g: 0.2, b: 0.55 },
};

// Color map for signature annotations
const SIGNATURE_COLORS: Record<SignatureColor, { r: number; g: number; b: number }> = {
  "black": { r: 0.1, g: 0.1, b: 0.1 },
  "navy": { r: 0.1, g: 0.2, b: 0.5 },
  "blue": { r: 0.2, g: 0.4, b: 0.8 },
  "dark-red": { r: 0.6, g: 0.1, b: 0.1 },
  "dark-green": { r: 0.1, g: 0.4, b: 0.2 },
  "purple": { r: 0.5, g: 0.2, b: 0.65 },
};

// Helper to colorize a signature PNG (replaces black pixels with target color)
async function colorizeSignature(
  dataUrl: string,
  color: SignatureColor
): Promise<string> {
  // If black, no colorization needed
  if (color === "black") {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Get target color
      const targetColor = SIGNATURE_COLORS[color];
      const targetR = Math.round(targetColor.r * 255);
      const targetG = Math.round(targetColor.g * 255);
      const targetB = Math.round(targetColor.b * 255);

      // Replace dark pixels with target color while preserving alpha
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Only modify non-transparent pixels
        if (a > 0) {
          // Calculate darkness (0 = black, 255 = white)
          const darkness = (r + g + b) / 3;
          // For dark pixels, replace with target color
          // Blend based on how dark the original pixel was
          const blend = 1 - darkness / 255;
          data[i] = Math.round(targetR * blend + r * (1 - blend));
          data[i + 1] = Math.round(targetG * blend + g * (1 - blend));
          data[i + 2] = Math.round(targetB * blend + b * (1 - blend));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Helper to rotate a point around a center
function rotatePoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  angleDegrees: number
): { x: number; y: number } {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = x - centerX;
  const dy = y - centerY;
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  };
}

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
  shapeAnnotations: ShapeAnnotation[] = [],
  inlineTextEdits: InlineTextEdit[] = [],
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
    // Embed all font families and their variants
    const fontFamilies: Record<FontFamily, {
      regular: PDFFont;
      bold: PDFFont;
      italic: PDFFont;
      boldItalic: PDFFont;
    }> = {
      helvetica: {
        regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
        bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
        italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
        boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
      },
      times: {
        regular: await pdfDoc.embedFont(StandardFonts.TimesRoman),
        bold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
        italic: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
        boldItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic),
      },
      courier: {
        regular: await pdfDoc.embedFont(StandardFonts.Courier),
        bold: await pdfDoc.embedFont(StandardFonts.CourierBold),
        italic: await pdfDoc.embedFont(StandardFonts.CourierOblique),
        boldItalic: await pdfDoc.embedFont(StandardFonts.CourierBoldOblique),
      },
    };
    const pages = pdfDoc.getPages();

    for (const annotation of textAnnotations) {
      if (annotation.page < pages.length && annotation.text.trim()) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();

        // Select font family (default to helvetica for backward compatibility)
        const fontFamily = annotation.fontFamily ?? "helvetica";
        const fonts = fontFamilies[fontFamily];

        // Select font variant based on weight and style
        const fontWeight = annotation.fontWeight ?? "normal";
        const fontStyle = annotation.fontStyle ?? "normal";
        let font: PDFFont;
        if (fontWeight === "bold" && fontStyle === "italic") {
          font = fonts.boldItalic;
        } else if (fontWeight === "bold") {
          font = fonts.bold;
        } else if (fontStyle === "italic") {
          font = fonts.italic;
        } else {
          font = fonts.regular;
        }

        // Get text color (default to black for backward compatibility)
        const colorKey = annotation.color ?? "black";
        const colorValue = TEXT_ANNOTATION_COLORS[colorKey];
        const textColor = rgb(colorValue.r, colorValue.g, colorValue.b);

        // Get text alignment (default to left for backward compatibility)
        const textAlign = annotation.textAlign ?? "left";
        const lineHeight = annotation.fontSize * 1.2;
        const textRotation = annotation.rotation ?? 0;

        // Helper to calculate X position based on alignment
        const getAlignedX = (lineText: string, annotationWidth: number | undefined): number => {
          if (!annotationWidth || textAlign === "left") {
            return annotation.position.x;
          }
          const textWidth = font.widthOfTextAtSize(lineText, annotation.fontSize);
          if (textAlign === "center") {
            return annotation.position.x + (annotationWidth - textWidth) / 2;
          }
          if (textAlign === "right") {
            return annotation.position.x + annotationWidth - textWidth;
          }
          return annotation.position.x;
        };

        // If width is set, wrap text to multiple lines
        if (annotation.width) {
          const lines = wrapText(
            annotation.text,
            font,
            annotation.fontSize,
            annotation.width
          );

          // Calculate the center of the text block for rotation
          const totalHeight = lines.length * lineHeight;
          const centerX = annotation.position.x + annotation.width / 2;
          const centerY = annotation.position.y + totalHeight / 2;
          const pdfCenterY = pageHeight - centerY;

          lines.forEach((line, index) => {
            const originalX = getAlignedX(line, annotation.width);
            const originalY =
              pageHeight -
              annotation.position.y -
              annotation.fontSize -
              index * lineHeight;

            if (textRotation !== 0) {
              // Rotate text position around the center of the text block
              const rotated = rotatePoint(originalX, originalY, centerX, pdfCenterY, -textRotation);
              page.drawText(line, {
                x: rotated.x,
                y: rotated.y,
                size: annotation.fontSize,
                font,
                color: textColor,
                rotate: degrees(-textRotation),
              });
            } else {
              page.drawText(line, {
                x: originalX,
                y: originalY,
                size: annotation.fontSize,
                font,
                color: textColor,
              });
            }
          });
        } else {
          // Single line text
          const pdfY =
            pageHeight - annotation.position.y - annotation.fontSize;

          if (textRotation !== 0) {
            // For single line, rotate around the text position
            const textWidth = font.widthOfTextAtSize(annotation.text, annotation.fontSize);
            const centerX = annotation.position.x + textWidth / 2;
            const centerY = pdfY + annotation.fontSize / 2;
            const rotated = rotatePoint(annotation.position.x, pdfY, centerX, centerY, -textRotation);

            page.drawText(annotation.text, {
              x: rotated.x,
              y: rotated.y,
              size: annotation.fontSize,
              font,
              color: textColor,
              rotate: degrees(-textRotation),
            });
          } else {
            page.drawText(annotation.text, {
              x: annotation.position.x,
              y: pdfY,
              size: annotation.fontSize,
              font,
              color: textColor,
            });
          }
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
        const signatureRotation = annotation.rotation ?? 0;
        const signatureColor = annotation.color ?? "black";

        try {
          // Colorize signature if needed
          const colorizedDataUrl = await colorizeSignature(annotation.dataUrl, signatureColor);

          // Convert data URL to bytes
          const base64Data = colorizedDataUrl.split(",")[1];
          const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
            c.charCodeAt(0)
          );

          // Embed the PNG image
          const image = await pdfDoc.embedPng(imageBytes);

          // Calculate PDF coordinates (flip Y axis)
          const pdfY = pageHeight - annotation.position.y - annotation.height;

          if (signatureRotation !== 0) {
            // Calculate center of the image for rotation
            const centerX = annotation.position.x + annotation.width / 2;
            const centerY = pdfY + annotation.height / 2;

            // Draw the image with rotation
            page.drawImage(image, {
              x: centerX - annotation.width / 2,
              y: centerY - annotation.height / 2,
              width: annotation.width,
              height: annotation.height,
              rotate: degrees(-signatureRotation),
            });
          } else {
            // Draw the image without rotation
            page.drawImage(image, {
              x: annotation.position.x,
              y: pdfY,
              width: annotation.width,
              height: annotation.height,
            });
          }
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

  // Add shape annotations
  if (shapeAnnotations.length > 0) {
    const pages = pdfDoc.getPages();

    for (const annotation of shapeAnnotations) {
      if (annotation.page < pages.length) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();
        const shapeRotation = annotation.rotation ?? 0;

        // Get colors (handle transparent)
        const hasFill = annotation.fillColor !== "transparent";
        const hasStroke = annotation.strokeColor !== "transparent";
        const fillColorValue = hasFill ? SHAPE_COLORS[annotation.fillColor as Exclude<ShapeColor, "transparent">] : null;
        const strokeColorValue = hasStroke ? SHAPE_COLORS[annotation.strokeColor as Exclude<ShapeColor, "transparent">] : null;

        // Normalize dimensions (handle negative width/height from reverse drawing)
        const x = annotation.width < 0 ? annotation.position.x + annotation.width : annotation.position.x;
        const y = annotation.position.y;
        const width = Math.abs(annotation.width);
        const height = Math.abs(annotation.height);

        // Calculate center for rotation
        const centerX = x + width / 2;
        const pdfCenterY = pageHeight - y - height / 2;

        switch (annotation.shapeType) {
          case "rectangle": {
            // Calculate PDF coordinates (flip Y axis)
            const pdfY = pageHeight - y - height;

            page.drawRectangle({
              x,
              y: pdfY,
              width,
              height,
              color: fillColorValue ? rgb(fillColorValue.r, fillColorValue.g, fillColorValue.b) : undefined,
              opacity: hasFill ? annotation.opacity : 0,
              borderColor: strokeColorValue ? rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b) : undefined,
              borderOpacity: hasStroke ? annotation.opacity : 0,
              borderWidth: hasStroke ? annotation.strokeWidth : 0,
              rotate: shapeRotation !== 0 ? degrees(-shapeRotation) : undefined,
            });
            break;
          }

          case "ellipse": {
            page.drawEllipse({
              x: centerX,
              y: pdfCenterY,
              xScale: width / 2,
              yScale: height / 2,
              color: fillColorValue ? rgb(fillColorValue.r, fillColorValue.g, fillColorValue.b) : undefined,
              opacity: hasFill ? annotation.opacity : 0,
              borderColor: strokeColorValue ? rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b) : undefined,
              borderOpacity: hasStroke ? annotation.opacity : 0,
              borderWidth: hasStroke ? annotation.strokeWidth : 0,
              rotate: shapeRotation !== 0 ? degrees(-shapeRotation) : undefined,
            });
            break;
          }

          case "line": {
            // For lines, position is start point, width/height define end point offset
            let startX = annotation.position.x;
            let startY = pageHeight - annotation.position.y;
            let endX = annotation.position.x + annotation.width;
            let endY = pageHeight - (annotation.position.y + annotation.height);

            // Apply rotation to line endpoints around center
            if (shapeRotation !== 0) {
              const rotatedStart = rotatePoint(startX, startY, centerX, pdfCenterY, -shapeRotation);
              const rotatedEnd = rotatePoint(endX, endY, centerX, pdfCenterY, -shapeRotation);
              startX = rotatedStart.x;
              startY = rotatedStart.y;
              endX = rotatedEnd.x;
              endY = rotatedEnd.y;
            }

            if (hasStroke && strokeColorValue) {
              page.drawLine({
                start: { x: startX, y: startY },
                end: { x: endX, y: endY },
                thickness: annotation.strokeWidth,
                color: rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b),
                opacity: annotation.opacity,
              });
            }
            break;
          }

          case "arrow": {
            // For arrows, draw line + arrowhead
            let startX = annotation.position.x;
            let startY = pageHeight - annotation.position.y;
            let endX = annotation.position.x + annotation.width;
            let endY = pageHeight - (annotation.position.y + annotation.height);

            // Apply rotation to arrow endpoints around center
            if (shapeRotation !== 0) {
              const rotatedStart = rotatePoint(startX, startY, centerX, pdfCenterY, -shapeRotation);
              const rotatedEnd = rotatePoint(endX, endY, centerX, pdfCenterY, -shapeRotation);
              startX = rotatedStart.x;
              startY = rotatedStart.y;
              endX = rotatedEnd.x;
              endY = rotatedEnd.y;
            }

            if (hasStroke && strokeColorValue) {
              const strokeColor = rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b);

              // Draw the main line
              page.drawLine({
                start: { x: startX, y: startY },
                end: { x: endX, y: endY },
                thickness: annotation.strokeWidth,
                color: strokeColor,
                opacity: annotation.opacity,
              });

              // Calculate arrowhead
              const angle = Math.atan2(endY - startY, endX - startX);
              const arrowLength = Math.max(10, annotation.strokeWidth * 4);
              const arrowAngle = Math.PI / 6; // 30 degrees

              const arrowPoint1X = endX - arrowLength * Math.cos(angle - arrowAngle);
              const arrowPoint1Y = endY - arrowLength * Math.sin(angle - arrowAngle);
              const arrowPoint2X = endX - arrowLength * Math.cos(angle + arrowAngle);
              const arrowPoint2Y = endY - arrowLength * Math.sin(angle + arrowAngle);

              // Draw arrowhead as two lines
              page.drawLine({
                start: { x: endX, y: endY },
                end: { x: arrowPoint1X, y: arrowPoint1Y },
                thickness: annotation.strokeWidth,
                color: strokeColor,
                opacity: annotation.opacity,
              });
              page.drawLine({
                start: { x: endX, y: endY },
                end: { x: arrowPoint2X, y: arrowPoint2Y },
                thickness: annotation.strokeWidth,
                color: strokeColor,
                opacity: annotation.opacity,
              });
            }
            break;
          }

          case "triangle": {
            // Draw triangle as three lines
            const pdfY = pageHeight - y - height;

            // Triangle points: top center, bottom right, bottom left
            let p1 = { x: x + width / 2, y: pdfY + height }; // top
            let p2 = { x: x + width, y: pdfY }; // bottom right
            let p3 = { x: x, y: pdfY }; // bottom left

            // Apply rotation if needed
            if (shapeRotation !== 0) {
              p1 = rotatePoint(p1.x, p1.y, centerX, pdfCenterY, -shapeRotation);
              p2 = rotatePoint(p2.x, p2.y, centerX, pdfCenterY, -shapeRotation);
              p3 = rotatePoint(p3.x, p3.y, centerX, pdfCenterY, -shapeRotation);
            }

            // Draw fill as a simple approximation (pdf-lib doesn't have native polygon fill)
            // For now, just draw the outline
            if (hasStroke && strokeColorValue) {
              const strokeColor = rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b);
              page.drawLine({ start: p1, end: p2, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              page.drawLine({ start: p2, end: p3, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              page.drawLine({ start: p3, end: p1, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
            }
            break;
          }

          case "hexagon": {
            // Draw hexagon as 6 lines
            const pdfY = pageHeight - y - height;
            const cx = x + width / 2;
            const cy = pdfY + height / 2;
            const rx = width / 2;
            const ry = height / 2;

            // Generate 6 points
            const hexPoints = Array.from({ length: 6 }, (_, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              let px = cx + rx * Math.cos(angle);
              let py = cy + ry * Math.sin(angle);
              if (shapeRotation !== 0) {
                const rotated = rotatePoint(px, py, centerX, pdfCenterY, -shapeRotation);
                px = rotated.x;
                py = rotated.y;
              }
              return { x: px, y: py };
            });

            if (hasStroke && strokeColorValue) {
              const strokeColor = rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b);
              for (let i = 0; i < 6; i++) {
                const next = (i + 1) % 6;
                page.drawLine({ start: hexPoints[i], end: hexPoints[next], thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              }
            }
            break;
          }

          case "star": {
            // Draw 5-pointed star as 10 lines
            const pdfY = pageHeight - y - height;
            const cx = x + width / 2;
            const cy = pdfY + height / 2;
            const outerRx = width / 2;
            const outerRy = height / 2;
            const innerRx = outerRx * 0.4;
            const innerRy = outerRy * 0.4;

            // Generate 10 points (alternating outer/inner)
            const starPoints = Array.from({ length: 10 }, (_, i) => {
              const angle = (i * 36 - 90) * (Math.PI / 180);
              const isOuter = i % 2 === 0;
              const rx = isOuter ? outerRx : innerRx;
              const ry = isOuter ? outerRy : innerRy;
              let px = cx + rx * Math.cos(angle);
              let py = cy + ry * Math.sin(angle);
              if (shapeRotation !== 0) {
                const rotated = rotatePoint(px, py, centerX, pdfCenterY, -shapeRotation);
                px = rotated.x;
                py = rotated.y;
              }
              return { x: px, y: py };
            });

            if (hasStroke && strokeColorValue) {
              const strokeColor = rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b);
              for (let i = 0; i < 10; i++) {
                const next = (i + 1) % 10;
                page.drawLine({ start: starPoints[i], end: starPoints[next], thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              }
            }
            break;
          }

          case "callout": {
            // Draw callout as rounded rectangle with tail - simplified as lines
            const pdfY = pageHeight - y - height;
            const tailHeight = Math.min(15, height / 3);

            // Just draw a simple rectangle with a tail pointer for PDF export
            if (hasStroke && strokeColorValue) {
              const strokeColor = rgb(strokeColorValue.r, strokeColorValue.g, strokeColorValue.b);

              // Main rectangle corners
              let tl = { x: x, y: pdfY + height };
              let tr = { x: x + width, y: pdfY + height };
              let br = { x: x + width, y: pdfY };
              let bl = { x: x, y: pdfY };
              let tailPoint = { x: x, y: pdfY - tailHeight };
              let tailBase = { x: x + Math.min(20, width / 3), y: pdfY };

              if (shapeRotation !== 0) {
                tl = rotatePoint(tl.x, tl.y, centerX, pdfCenterY, -shapeRotation);
                tr = rotatePoint(tr.x, tr.y, centerX, pdfCenterY, -shapeRotation);
                br = rotatePoint(br.x, br.y, centerX, pdfCenterY, -shapeRotation);
                bl = rotatePoint(bl.x, bl.y, centerX, pdfCenterY, -shapeRotation);
                tailPoint = rotatePoint(tailPoint.x, tailPoint.y, centerX, pdfCenterY, -shapeRotation);
                tailBase = rotatePoint(tailBase.x, tailBase.y, centerX, pdfCenterY, -shapeRotation);
              }

              // Draw rectangle outline
              page.drawLine({ start: tl, end: tr, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              page.drawLine({ start: tr, end: br, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              page.drawLine({ start: br, end: tailBase, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              page.drawLine({ start: tailBase, end: tailPoint, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              page.drawLine({ start: tailPoint, end: bl, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
              page.drawLine({ start: bl, end: tl, thickness: annotation.strokeWidth, color: strokeColor, opacity: annotation.opacity });
            }
            break;
          }
        }
      }
    }
  }

  // Apply inline text edits (for non-flattened PDFs)
  if (inlineTextEdits.length > 0) {
    const pages = pdfDoc.getPages();

    // Embed font for replacement text
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const edit of inlineTextEdits) {
      if (edit.page < pages.length) {
        const page = pages[edit.page];
        const pageHeight = page.getHeight();

        // Calculate PDF coordinates (flip Y axis)
        const pdfY = pageHeight - edit.rect.y - edit.rect.height;

        // Draw white rectangle to cover original text
        page.drawRectangle({
          x: edit.rect.x,
          y: pdfY,
          width: edit.rect.width,
          height: edit.rect.height,
          color: rgb(1, 1, 1), // White
          opacity: 1,
          borderWidth: 0,
        });

        // Draw new text on top
        if (edit.newText.trim()) {
          page.drawText(edit.newText, {
            x: edit.rect.x,
            y: pdfY + edit.rect.height * 0.15, // Adjust baseline
            size: edit.fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1), // Near black
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
export async function rasterizePDF(pdfBytes: Uint8Array): Promise<Uint8Array> {
  // Configure pdfjs worker (same as react-pdf uses)
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  // Load the PDF with pdfjs
  const loadingTask = pdfjs.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // Create a new PDF document for the rasterized output
  const newPdfDoc = await PDFDocument.create();

  // Sanitize metadata - remove any potentially sensitive information
  newPdfDoc.setTitle('');
  newPdfDoc.setAuthor('');
  newPdfDoc.setSubject('');
  newPdfDoc.setKeywords([]);
  newPdfDoc.setProducer('Paperwork');
  newPdfDoc.setCreator('');

  // Render each page at a higher resolution for quality (2x scale)
  const scale = 2;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create a canvas to render the page
    let canvas: HTMLCanvasElement | null = document.createElement("canvas");
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
    }).promise;

    // Convert canvas to JPEG (smaller file size than PNG)
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const base64Data = imageDataUrl.split(",")[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Clean up canvas to free memory
    canvas.width = 0;
    canvas.height = 0;
    canvas = null;

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

    // Clean up page reference
    page.cleanup();
  }

  return newPdfDoc.save();
}

export async function flattenPDF(bytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  form.flatten();
  return pdfDoc.save();
}
