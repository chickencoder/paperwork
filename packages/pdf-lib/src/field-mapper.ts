import type { FieldRect } from "./types";

export interface PageDimensions {
  width: number;
  height: number;
}

/**
 * Convert PDF coordinates (bottom-left origin) to screen coordinates (top-left origin)
 * Also applies scale transformation for zoom
 */
export function pdfToScreen(
  rect: FieldRect,
  pageDimensions: PageDimensions,
  scale: number
): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  // PDF coordinates: origin at bottom-left
  // Screen coordinates: origin at top-left
  // Need to flip the Y axis

  const scaledX = rect.x * scale;
  const scaledY = rect.y * scale;
  const scaledWidth = rect.width * scale;
  const scaledHeight = rect.height * scale;

  // Flip Y: screen_y = page_height - pdf_y - height
  const screenY = pageDimensions.height * scale - scaledY - scaledHeight;

  return {
    left: scaledX,
    top: screenY,
    width: scaledWidth,
    height: scaledHeight,
  };
}

/**
 * Convert screen coordinates back to PDF coordinates
 */
export function screenToPdf(
  screenPos: { x: number; y: number },
  pageDimensions: PageDimensions,
  scale: number
): { x: number; y: number } {
  const pdfX = screenPos.x / scale;
  const pdfY = (pageDimensions.height * scale - screenPos.y) / scale;

  return { x: pdfX, y: pdfY };
}
