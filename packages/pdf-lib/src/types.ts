import type { PDFDocument } from "pdf-lib";

export type FieldType = "text" | "checkbox" | "radio" | "dropdown";

export interface FieldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  page: number;
  rect: FieldRect;
  defaultValue?: string | boolean;
  options?: string[]; // For radio/dropdown
  groupName?: string; // For radio buttons
}

// Text annotation color palette - organized by color family
export type TextAnnotationColor =
  // Grayscale
  | "black"
  | "dark-gray"
  | "gray"
  | "light-gray"
  // Blues
  | "navy"
  | "blue"
  | "sky"
  // Reds
  | "dark-red"
  | "red"
  | "coral"
  // Greens
  | "dark-green"
  | "green"
  | "teal"
  // Warm
  | "brown"
  | "orange"
  | "amber"
  // Cool
  | "purple"
  | "pink"
  | "magenta";

export type TextAlign = "left" | "center" | "right";
export type FontStyle = "normal" | "italic";
export type FontFamily = "helvetica" | "times" | "courier";

export interface TextAnnotation {
  id: string;
  page: number;
  position: { x: number; y: number };
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  fontWeight: "normal" | "bold";
  fontStyle: FontStyle;
  color: TextAnnotationColor;
  textAlign: TextAlign;
  width?: number; // Optional width for multi-line text wrapping
  rotation?: number; // Rotation in degrees (0-360)
}

// Signature colors - simple set for signature use
export type SignatureColor = "black" | "navy" | "blue" | "dark-red" | "dark-green" | "purple";

export interface SignatureAnnotation {
  id: string;
  page: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  dataUrl: string; // PNG data URL of the signature
  rotation?: number; // Rotation in degrees (0-360)
  color?: SignatureColor; // Color to tint the signature (default: black)
}

// Annotation rect for highlight/strikethrough (can span multiple lines)
export interface AnnotationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";

// Shape annotation types
export type ShapeType = "rectangle" | "ellipse" | "line" | "arrow" | "triangle" | "star" | "hexagon" | "callout";

// Shape colors - same as text annotation colors plus transparent
export type ShapeColor =
  | "transparent"
  | "black"
  | "dark-gray"
  | "gray"
  | "light-gray"
  | "navy"
  | "blue"
  | "sky"
  | "dark-red"
  | "red"
  | "coral"
  | "dark-green"
  | "green"
  | "teal"
  | "brown"
  | "orange"
  | "amber"
  | "purple"
  | "pink"
  | "magenta";

export interface ShapeAnnotation {
  id: string;
  page: number;
  shapeType: ShapeType;
  position: { x: number; y: number }; // Top-left for rect/ellipse, start for line/arrow
  width: number; // For line/arrow: dx to end point
  height: number; // For line/arrow: dy to end point
  fillColor: ShapeColor;
  strokeColor: ShapeColor;
  strokeWidth: number; // 1-10px
  opacity: number; // 0-100%
  rotation?: number; // Rotation in degrees (0-360)
}

export interface HighlightAnnotation {
  id: string;
  page: number;
  rects: AnnotationRect[];
  color: HighlightColor;
  selectedText: string;
}

export type StrikethroughColor = "red" | "black";

export interface StrikethroughAnnotation {
  id: string;
  page: number;
  rects: AnnotationRect[];
  selectedText: string;
  color: StrikethroughColor;
}

export interface RedactionAnnotation {
  id: string;
  page: number;
  rects: AnnotationRect[];
  selectedText: string;
  enabled: boolean;
}

export interface TextReplacementAnnotation {
  id: string;
  page: number;
  // Original text info (for reference)
  originalText: string;
  // Whiteout rectangles (covers original text - one per line for multi-line selections)
  whiteoutRects: AnnotationRect[];
  // Replacement text (positioned at first whiteout location)
  replacementText: string;
  fontSize: number;
  fontFamily: FontFamily;
  fontWeight: "normal" | "bold";
  fontStyle: FontStyle;
  color: TextAnnotationColor;
  textAlign: TextAlign;
}

export type FieldValue = string | boolean;

export interface EditorState {
  pdfFile: File | null;
  pdfDocument: PDFDocument | null;
  pdfBytes: Uint8Array | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  formFields: FormField[];
  fieldValues: Record<string, FieldValue>;
  textAnnotations: TextAnnotation[];
  selectedFieldId: string | null;
  activeTool: "select" | "text-insert" | "signature" | "shape";
  activeShapeType: ShapeType;
  shapeAnnotations: ShapeAnnotation[];
  isDirty: boolean;
}

export type EditorAction =
  | { type: "SET_PDF"; file: File; document: PDFDocument; bytes: Uint8Array }
  | { type: "SET_FORM_FIELDS"; fields: FormField[] }
  | { type: "SET_FIELD_VALUE"; fieldId: string; value: FieldValue }
  | { type: "ADD_TEXT_ANNOTATION"; annotation: TextAnnotation }
  | { type: "UPDATE_TEXT_ANNOTATION"; id: string; text: string }
  | { type: "REMOVE_TEXT_ANNOTATION"; id: string }
  | { type: "SET_SCALE"; scale: number }
  | { type: "SET_ACTIVE_TOOL"; tool: "select" | "text-insert" }
  | { type: "SELECT_FIELD"; fieldId: string | null }
  | { type: "RESET" };
