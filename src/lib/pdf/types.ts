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

export interface TextAnnotation {
  id: string;
  page: number;
  position: { x: number; y: number };
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  width?: number; // Optional width for multi-line text wrapping
}

export interface SignatureAnnotation {
  id: string;
  page: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  dataUrl: string; // PNG data URL of the signature
}

// Annotation rect for highlight/strikethrough (can span multiple lines)
export interface AnnotationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";

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
  activeTool: "select" | "text-insert";
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
