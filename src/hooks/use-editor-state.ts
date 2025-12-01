import { useReducer, useCallback } from "react";
import type {
  TextAnnotation,
  SignatureAnnotation,
  HighlightAnnotation,
  StrikethroughAnnotation,
  RedactionAnnotation,
} from "@/lib/pdf/types";

// History configuration
const MAX_HISTORY_LENGTH = 50;
const BATCH_TIMEOUT_MS = 300;

type ClipboardAnnotation =
  | { type: "text"; data: Omit<TextAnnotation, "id"> }
  | { type: "signature"; data: Omit<SignatureAnnotation, "id"> }
  | { type: "highlight"; data: Omit<HighlightAnnotation, "id"> }
  | { type: "strikethrough"; data: Omit<StrikethroughAnnotation, "id"> }
  | { type: "redaction"; data: Omit<RedactionAnnotation, "id"> };

interface EditorState {
  pdfFile: File | null;
  pdfBytes: Uint8Array | null;
  scale: number;
  textAnnotations: TextAnnotation[];
  signatureAnnotations: SignatureAnnotation[];
  highlightAnnotations: HighlightAnnotation[];
  strikethroughAnnotations: StrikethroughAnnotation[];
  redactionAnnotations: RedactionAnnotation[];
  selectedAnnotationId: string | null;
  activeTool: "select" | "text-insert" | "signature";
  clipboard: ClipboardAnnotation | null;
}

type EditorAction =
  | { type: "SET_PDF"; file: File; bytes: Uint8Array }
  | { type: "ADD_TEXT_ANNOTATION"; annotation: TextAnnotation }
  | { type: "UPDATE_TEXT_ANNOTATION"; id: string; updates: Partial<Omit<TextAnnotation, "id" | "page">> }
  | { type: "REMOVE_TEXT_ANNOTATION"; id: string }
  | { type: "ADD_SIGNATURE_ANNOTATION"; annotation: SignatureAnnotation }
  | { type: "UPDATE_SIGNATURE_ANNOTATION"; id: string; updates: Partial<Omit<SignatureAnnotation, "id" | "page" | "dataUrl">> }
  | { type: "REMOVE_SIGNATURE_ANNOTATION"; id: string }
  | { type: "ADD_HIGHLIGHT"; annotation: HighlightAnnotation }
  | { type: "REMOVE_HIGHLIGHT"; id: string }
  | { type: "ADD_STRIKETHROUGH"; annotation: StrikethroughAnnotation }
  | { type: "REMOVE_STRIKETHROUGH"; id: string }
  | { type: "ADD_REDACTION"; annotation: RedactionAnnotation }
  | { type: "REMOVE_REDACTION"; id: string }
  | { type: "TOGGLE_REDACTION"; id: string }
  | { type: "SET_SCALE"; scale: number }
  | { type: "SET_ACTIVE_TOOL"; tool: "select" | "text-insert" | "signature" }
  | { type: "SELECT_ANNOTATION"; id: string | null }
  | { type: "COPY_TO_CLIPBOARD"; annotation: ClipboardAnnotation }
  | { type: "RESET" }
  // Form field changes (values stored in DOM, not React state)
  | { type: "SET_FORM_FIELD"; fieldId: string; value: string | boolean; previousValue: string | boolean };

// Undoable action types
type UndoableAction = Extract<
  EditorAction,
  | { type: "ADD_TEXT_ANNOTATION" }
  | { type: "UPDATE_TEXT_ANNOTATION" }
  | { type: "REMOVE_TEXT_ANNOTATION" }
  | { type: "ADD_SIGNATURE_ANNOTATION" }
  | { type: "UPDATE_SIGNATURE_ANNOTATION" }
  | { type: "REMOVE_SIGNATURE_ANNOTATION" }
  | { type: "ADD_HIGHLIGHT" }
  | { type: "REMOVE_HIGHLIGHT" }
  | { type: "ADD_STRIKETHROUGH" }
  | { type: "REMOVE_STRIKETHROUGH" }
  | { type: "ADD_REDACTION" }
  | { type: "REMOVE_REDACTION" }
  | { type: "TOGGLE_REDACTION" }
  | { type: "SET_FORM_FIELD" }
>;

const UNDOABLE_ACTION_TYPES = [
  "ADD_TEXT_ANNOTATION",
  "UPDATE_TEXT_ANNOTATION",
  "REMOVE_TEXT_ANNOTATION",
  "ADD_SIGNATURE_ANNOTATION",
  "UPDATE_SIGNATURE_ANNOTATION",
  "REMOVE_SIGNATURE_ANNOTATION",
  "ADD_HIGHLIGHT",
  "REMOVE_HIGHLIGHT",
  "ADD_STRIKETHROUGH",
  "REMOVE_STRIKETHROUGH",
  "ADD_REDACTION",
  "REMOVE_REDACTION",
  "TOGGLE_REDACTION",
  "SET_FORM_FIELD",
] as const;

// History entry stores the action and its inverse for undo
interface HistoryEntry {
  action: UndoableAction;
  inverse: UndoableAction;
  timestamp: number;
  batchId?: string; // For grouping rapid updates
}

// Extended state with history stacks
interface EditorStateWithHistory {
  current: EditorState;
  past: HistoryEntry[];
  future: HistoryEntry[];
}

// Actions for undo/redo control
type HistoryAction =
  | EditorAction
  | { type: "UNDO" }
  | { type: "REDO" };

const initialState: EditorState = {
  pdfFile: null,
  pdfBytes: null,
  scale: 1,
  textAnnotations: [],
  signatureAnnotations: [],
  highlightAnnotations: [],
  strikethroughAnnotations: [],
  redactionAnnotations: [],
  selectedAnnotationId: null,
  activeTool: "select",
  clipboard: null,
};

const initialStateWithHistory: EditorStateWithHistory = {
  current: initialState,
  past: [],
  future: [],
};

// Check if an action is undoable
function isUndoableAction(action: EditorAction): action is UndoableAction {
  return UNDOABLE_ACTION_TYPES.includes(action.type as typeof UNDOABLE_ACTION_TYPES[number]);
}

// Get the annotation/field ID from an undoable action (for batching)
function getActionAnnotationId(action: UndoableAction): string | null {
  switch (action.type) {
    case "UPDATE_TEXT_ANNOTATION":
    case "UPDATE_SIGNATURE_ANNOTATION":
      return action.id;
    case "SET_FORM_FIELD":
      return action.fieldId;
    default:
      return null;
  }
}

// Compute the inverse action needed to undo a given action
function computeInverseAction(
  action: UndoableAction,
  state: EditorState
): UndoableAction | null {
  switch (action.type) {
    // ADD actions -> inverse is REMOVE
    case "ADD_TEXT_ANNOTATION":
      return { type: "REMOVE_TEXT_ANNOTATION", id: action.annotation.id };

    case "ADD_SIGNATURE_ANNOTATION":
      return { type: "REMOVE_SIGNATURE_ANNOTATION", id: action.annotation.id };

    case "ADD_HIGHLIGHT":
      return { type: "REMOVE_HIGHLIGHT", id: action.annotation.id };

    case "ADD_STRIKETHROUGH":
      return { type: "REMOVE_STRIKETHROUGH", id: action.annotation.id };

    case "ADD_REDACTION":
      return { type: "REMOVE_REDACTION", id: action.annotation.id };

    // REMOVE actions -> inverse is ADD (capture the removed item)
    case "REMOVE_TEXT_ANNOTATION": {
      const annotation = state.textAnnotations.find((a) => a.id === action.id);
      return annotation ? { type: "ADD_TEXT_ANNOTATION", annotation } : null;
    }

    case "REMOVE_SIGNATURE_ANNOTATION": {
      const annotation = state.signatureAnnotations.find((a) => a.id === action.id);
      return annotation ? { type: "ADD_SIGNATURE_ANNOTATION", annotation } : null;
    }

    case "REMOVE_HIGHLIGHT": {
      const annotation = state.highlightAnnotations.find((a) => a.id === action.id);
      return annotation ? { type: "ADD_HIGHLIGHT", annotation } : null;
    }

    case "REMOVE_STRIKETHROUGH": {
      const annotation = state.strikethroughAnnotations.find((a) => a.id === action.id);
      return annotation ? { type: "ADD_STRIKETHROUGH", annotation } : null;
    }

    case "REMOVE_REDACTION": {
      const annotation = state.redactionAnnotations.find((a) => a.id === action.id);
      return annotation ? { type: "ADD_REDACTION", annotation } : null;
    }

    // UPDATE actions -> inverse is UPDATE with previous values
    case "UPDATE_TEXT_ANNOTATION": {
      const annotation = state.textAnnotations.find((a) => a.id === action.id);
      if (!annotation) return null;
      const previousValues: Partial<Omit<TextAnnotation, "id" | "page">> = {};
      for (const key of Object.keys(action.updates) as (keyof typeof action.updates)[]) {
        (previousValues as Record<string, unknown>)[key] = annotation[key];
      }
      return { type: "UPDATE_TEXT_ANNOTATION", id: action.id, updates: previousValues };
    }

    case "UPDATE_SIGNATURE_ANNOTATION": {
      const annotation = state.signatureAnnotations.find((a) => a.id === action.id);
      if (!annotation) return null;
      const previousValues: Partial<Omit<SignatureAnnotation, "id" | "page" | "dataUrl">> = {};
      for (const key of Object.keys(action.updates) as (keyof typeof action.updates)[]) {
        (previousValues as Record<string, unknown>)[key] = annotation[key];
      }
      return { type: "UPDATE_SIGNATURE_ANNOTATION", id: action.id, updates: previousValues };
    }

    // TOGGLE actions -> inverse is the same toggle (self-inverse)
    case "TOGGLE_REDACTION":
      return { type: "TOGGLE_REDACTION", id: action.id };

    // Form field changes - inverse swaps value and previousValue
    case "SET_FORM_FIELD":
      return {
        type: "SET_FORM_FIELD",
        fieldId: action.fieldId,
        value: action.previousValue,
        previousValue: action.value,
      };

    default:
      return null;
  }
}

// The base reducer for editor state (no history)
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_PDF":
      return {
        ...initialState,
        pdfFile: action.file,
        pdfBytes: action.bytes,
      };

    case "ADD_TEXT_ANNOTATION":
      return {
        ...state,
        textAnnotations: [...state.textAnnotations, action.annotation],
      };

    case "UPDATE_TEXT_ANNOTATION":
      return {
        ...state,
        textAnnotations: state.textAnnotations.map((a) =>
          a.id === action.id ? { ...a, ...action.updates } : a
        ),
      };

    case "REMOVE_TEXT_ANNOTATION":
      return {
        ...state,
        textAnnotations: state.textAnnotations.filter((a) => a.id !== action.id),
      };

    case "ADD_SIGNATURE_ANNOTATION":
      return {
        ...state,
        signatureAnnotations: [...state.signatureAnnotations, action.annotation],
      };

    case "UPDATE_SIGNATURE_ANNOTATION":
      return {
        ...state,
        signatureAnnotations: state.signatureAnnotations.map((a) =>
          a.id === action.id ? { ...a, ...action.updates } : a
        ),
      };

    case "REMOVE_SIGNATURE_ANNOTATION":
      return {
        ...state,
        signatureAnnotations: state.signatureAnnotations.filter((a) => a.id !== action.id),
      };

    case "ADD_HIGHLIGHT":
      return {
        ...state,
        highlightAnnotations: [...state.highlightAnnotations, action.annotation],
      };

    case "REMOVE_HIGHLIGHT":
      return {
        ...state,
        highlightAnnotations: state.highlightAnnotations.filter((a) => a.id !== action.id),
      };

    case "ADD_STRIKETHROUGH":
      return {
        ...state,
        strikethroughAnnotations: [...state.strikethroughAnnotations, action.annotation],
      };

    case "REMOVE_STRIKETHROUGH":
      return {
        ...state,
        strikethroughAnnotations: state.strikethroughAnnotations.filter((a) => a.id !== action.id),
      };

    case "ADD_REDACTION":
      return {
        ...state,
        redactionAnnotations: [...state.redactionAnnotations, action.annotation],
      };

    case "REMOVE_REDACTION":
      return {
        ...state,
        redactionAnnotations: state.redactionAnnotations.filter((a) => a.id !== action.id),
      };

    case "TOGGLE_REDACTION":
      return {
        ...state,
        redactionAnnotations: state.redactionAnnotations.map((a) =>
          a.id === action.id ? { ...a, enabled: !a.enabled } : a
        ),
      };

    case "SET_SCALE":
      return {
        ...state,
        scale: action.scale,
      };

    case "SET_ACTIVE_TOOL":
      return {
        ...state,
        activeTool: action.tool,
        selectedAnnotationId: null,
      };

    case "SELECT_ANNOTATION":
      return {
        ...state,
        selectedAnnotationId: action.id,
      };

    case "COPY_TO_CLIPBOARD":
      return {
        ...state,
        clipboard: action.annotation,
      };

    case "RESET":
      return initialState;

    // Form field values are stored in DOM, not React state
    // This action is only used for undo/redo history tracking
    case "SET_FORM_FIELD":
      return state;

    default:
      return state;
  }
}

// History-aware reducer that wraps the base reducer
function editorReducerWithHistory(
  state: EditorStateWithHistory,
  action: HistoryAction
): EditorStateWithHistory {
  const now = Date.now();

  switch (action.type) {
    case "UNDO": {
      if (state.past.length === 0) return state;

      const lastEntry = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);

      // Apply the inverse action to get the previous state
      const newCurrent = editorReducer(state.current, lastEntry.inverse);

      // Create the redo entry (swap action and inverse)
      const redoEntry: HistoryEntry = {
        action: lastEntry.inverse,
        inverse: lastEntry.action,
        timestamp: now,
      };

      return {
        current: newCurrent,
        past: newPast,
        future: [...state.future, redoEntry],
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;

      const nextEntry = state.future[state.future.length - 1];
      const newFuture = state.future.slice(0, -1);

      // Apply the inverse action (which is the original action)
      const newCurrent = editorReducer(state.current, nextEntry.inverse);

      // Create the undo entry (swap back)
      const undoEntry: HistoryEntry = {
        action: nextEntry.inverse,
        inverse: nextEntry.action,
        timestamp: now,
      };

      return {
        current: newCurrent,
        past: [...state.past, undoEntry],
        future: newFuture,
      };
    }

    case "SET_PDF":
      // Clear history when loading a new document
      return {
        current: editorReducer(state.current, action),
        past: [],
        future: [],
      };

    case "RESET":
      return initialStateWithHistory;

    default: {
      // Handle regular actions
      if (isUndoableAction(action)) {
        const inverse = computeInverseAction(action, state.current);

        if (inverse) {
          const newCurrent = editorReducer(state.current, action);
          const actionId = getActionAnnotationId(action);

          // Check if we should batch this update with the previous one
          // (same annotation/field, same action type, within timeout)
          if (
            actionId &&
            state.past.length > 0 &&
            (action.type === "UPDATE_TEXT_ANNOTATION" ||
              action.type === "UPDATE_SIGNATURE_ANNOTATION" ||
              action.type === "SET_FORM_FIELD")
          ) {
            const lastEntry = state.past[state.past.length - 1];
            const lastActionId = getActionAnnotationId(lastEntry.action);
            const timeDiff = now - lastEntry.timestamp;

            if (
              lastEntry.action.type === action.type &&
              lastActionId === actionId &&
              timeDiff < BATCH_TIMEOUT_MS
            ) {
              // Merge: keep the original inverse, update the action
              const mergedEntry: HistoryEntry = {
                action: action,
                inverse: lastEntry.inverse, // Keep original inverse for full undo
                timestamp: now,
                batchId: lastEntry.batchId || `batch-${lastEntry.timestamp}`,
              };

              return {
                current: newCurrent,
                past: [...state.past.slice(0, -1), mergedEntry],
                future: [], // Clear redo on new action
              };
            }
          }

          // New entry (no batching)
          const entry: HistoryEntry = {
            action,
            inverse,
            timestamp: now,
          };

          // Limit history size
          const newPast = [...state.past, entry].slice(-MAX_HISTORY_LENGTH);

          return {
            current: newCurrent,
            past: newPast,
            future: [], // Clear redo stack on new action
          };
        }
      }

      // Non-undoable actions: just update current state, preserve history
      return {
        ...state,
        current: editorReducer(state.current, action),
      };
    }
  }
}

export function useEditorState() {
  const [stateWithHistory, dispatch] = useReducer(
    editorReducerWithHistory,
    initialStateWithHistory
  );

  const { current: state, past, future } = stateWithHistory;

  // Undo/redo capabilities
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Get the action that would be undone (the inverse action to apply)
  const getUndoAction = useCallback(() => {
    if (past.length === 0) return null;
    return past[past.length - 1].inverse;
  }, [past]);

  // Get the action that would be redone (the inverse action to apply)
  const getRedoAction = useCallback(() => {
    if (future.length === 0) return null;
    return future[future.length - 1].inverse;
  }, [future]);

  const undo = useCallback(() => {
    const action = getUndoAction();
    dispatch({ type: "UNDO" });
    return action;
  }, [getUndoAction]);

  const redo = useCallback(() => {
    const action = getRedoAction();
    dispatch({ type: "REDO" });
    return action;
  }, [getRedoAction]);

  const setPdf = useCallback((file: File, bytes: Uint8Array) => {
    dispatch({ type: "SET_PDF", file, bytes });
  }, []);

  const addTextAnnotation = useCallback((annotation: TextAnnotation) => {
    dispatch({ type: "ADD_TEXT_ANNOTATION", annotation });
  }, []);

  const updateTextAnnotation = useCallback(
    (id: string, updates: Partial<Omit<TextAnnotation, "id" | "page">>) => {
      dispatch({ type: "UPDATE_TEXT_ANNOTATION", id, updates });
    },
    []
  );

  const removeTextAnnotation = useCallback((id: string) => {
    dispatch({ type: "REMOVE_TEXT_ANNOTATION", id });
  }, []);

  const setScale = useCallback((scale: number) => {
    dispatch({ type: "SET_SCALE", scale });
  }, []);

  const setActiveTool = useCallback((tool: "select" | "text-insert" | "signature") => {
    dispatch({ type: "SET_ACTIVE_TOOL", tool });
  }, []);

  const addSignatureAnnotation = useCallback((annotation: SignatureAnnotation) => {
    dispatch({ type: "ADD_SIGNATURE_ANNOTATION", annotation });
  }, []);

  const updateSignatureAnnotation = useCallback(
    (id: string, updates: Partial<Omit<SignatureAnnotation, "id" | "page" | "dataUrl">>) => {
      dispatch({ type: "UPDATE_SIGNATURE_ANNOTATION", id, updates });
    },
    []
  );

  const removeSignatureAnnotation = useCallback((id: string) => {
    dispatch({ type: "REMOVE_SIGNATURE_ANNOTATION", id });
  }, []);

  const addHighlight = useCallback((annotation: HighlightAnnotation) => {
    dispatch({ type: "ADD_HIGHLIGHT", annotation });
  }, []);

  const removeHighlight = useCallback((id: string) => {
    dispatch({ type: "REMOVE_HIGHLIGHT", id });
  }, []);

  const addStrikethrough = useCallback((annotation: StrikethroughAnnotation) => {
    dispatch({ type: "ADD_STRIKETHROUGH", annotation });
  }, []);

  const removeStrikethrough = useCallback((id: string) => {
    dispatch({ type: "REMOVE_STRIKETHROUGH", id });
  }, []);

  const addRedaction = useCallback((annotation: RedactionAnnotation) => {
    dispatch({ type: "ADD_REDACTION", annotation });
  }, []);

  const removeRedaction = useCallback((id: string) => {
    dispatch({ type: "REMOVE_REDACTION", id });
  }, []);

  const toggleRedaction = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_REDACTION", id });
  }, []);

  // Track form field changes for undo/redo (values stored in DOM)
  const setFormField = useCallback(
    (fieldId: string, value: string | boolean, previousValue: string | boolean) => {
      dispatch({ type: "SET_FORM_FIELD", fieldId, value, previousValue });
    },
    []
  );

  const selectAnnotation = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_ANNOTATION", id });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Copy the currently selected annotation to clipboard
  const copySelectedAnnotation = useCallback(() => {
    if (!state.selectedAnnotationId) return;

    const id = state.selectedAnnotationId;

    // Find the annotation in each array
    const textAnnotation = state.textAnnotations.find((a) => a.id === id);
    if (textAnnotation) {
      const { id: _, ...data } = textAnnotation;
      dispatch({ type: "COPY_TO_CLIPBOARD", annotation: { type: "text", data } });
      return;
    }

    const signatureAnnotation = state.signatureAnnotations.find((a) => a.id === id);
    if (signatureAnnotation) {
      const { id: _, ...data } = signatureAnnotation;
      dispatch({ type: "COPY_TO_CLIPBOARD", annotation: { type: "signature", data } });
      return;
    }

    const highlightAnnotation = state.highlightAnnotations.find((a) => a.id === id);
    if (highlightAnnotation) {
      const { id: _, ...data } = highlightAnnotation;
      dispatch({ type: "COPY_TO_CLIPBOARD", annotation: { type: "highlight", data } });
      return;
    }

    const strikethroughAnnotation = state.strikethroughAnnotations.find((a) => a.id === id);
    if (strikethroughAnnotation) {
      const { id: _, ...data } = strikethroughAnnotation;
      dispatch({ type: "COPY_TO_CLIPBOARD", annotation: { type: "strikethrough", data } });
      return;
    }

    const redactionAnnotation = state.redactionAnnotations.find((a) => a.id === id);
    if (redactionAnnotation) {
      const { id: _, ...data } = redactionAnnotation;
      dispatch({ type: "COPY_TO_CLIPBOARD", annotation: { type: "redaction", data } });
      return;
    }
  }, [state.selectedAnnotationId, state.textAnnotations, state.signatureAnnotations, state.highlightAnnotations, state.strikethroughAnnotations, state.redactionAnnotations]);

  // Paste annotation from clipboard at the specified position
  const pasteAnnotation = useCallback(
    (pageIndex: number, position: { x: number; y: number }) => {
      if (!state.clipboard) return;

      const newId = `${state.clipboard.type}-${Date.now()}`;

      switch (state.clipboard.type) {
        case "text": {
          const data = state.clipboard.data;
          // Center the text annotation on the paste position
          const annotation: TextAnnotation = {
            ...data,
            id: newId,
            page: pageIndex,
            position: {
              x: position.x - (data.width ? data.width / 2 : 50),
              y: position.y - 10,
            },
          };
          dispatch({ type: "ADD_TEXT_ANNOTATION", annotation });
          dispatch({ type: "SELECT_ANNOTATION", id: newId });
          break;
        }
        case "signature": {
          const data = state.clipboard.data;
          // Center the signature on the paste position
          const annotation: SignatureAnnotation = {
            ...data,
            id: newId,
            page: pageIndex,
            position: {
              x: position.x - data.width / 2,
              y: position.y - data.height / 2,
            },
          };
          dispatch({ type: "ADD_SIGNATURE_ANNOTATION", annotation });
          dispatch({ type: "SELECT_ANNOTATION", id: newId });
          break;
        }
        case "highlight": {
          const data = state.clipboard.data;
          // Calculate bounding box and offset rects to center on paste position
          const bounds = data.rects.reduce(
            (acc, rect) => ({
              minX: Math.min(acc.minX, rect.x),
              minY: Math.min(acc.minY, rect.y),
              maxX: Math.max(acc.maxX, rect.x + rect.width),
              maxY: Math.max(acc.maxY, rect.y + rect.height),
            }),
            { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
          );
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerY = (bounds.minY + bounds.maxY) / 2;
          const offsetX = position.x - centerX;
          const offsetY = position.y - centerY;

          const annotation: HighlightAnnotation = {
            ...data,
            id: newId,
            page: pageIndex,
            rects: data.rects.map((rect) => ({
              ...rect,
              x: rect.x + offsetX,
              y: rect.y + offsetY,
            })),
          };
          dispatch({ type: "ADD_HIGHLIGHT", annotation });
          dispatch({ type: "SELECT_ANNOTATION", id: newId });
          break;
        }
        case "strikethrough": {
          const data = state.clipboard.data;
          const bounds = data.rects.reduce(
            (acc, rect) => ({
              minX: Math.min(acc.minX, rect.x),
              minY: Math.min(acc.minY, rect.y),
              maxX: Math.max(acc.maxX, rect.x + rect.width),
              maxY: Math.max(acc.maxY, rect.y + rect.height),
            }),
            { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
          );
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerY = (bounds.minY + bounds.maxY) / 2;
          const offsetX = position.x - centerX;
          const offsetY = position.y - centerY;

          const annotation: StrikethroughAnnotation = {
            ...data,
            id: newId,
            page: pageIndex,
            rects: data.rects.map((rect) => ({
              ...rect,
              x: rect.x + offsetX,
              y: rect.y + offsetY,
            })),
          };
          dispatch({ type: "ADD_STRIKETHROUGH", annotation });
          dispatch({ type: "SELECT_ANNOTATION", id: newId });
          break;
        }
        case "redaction": {
          const data = state.clipboard.data;
          const bounds = data.rects.reduce(
            (acc, rect) => ({
              minX: Math.min(acc.minX, rect.x),
              minY: Math.min(acc.minY, rect.y),
              maxX: Math.max(acc.maxX, rect.x + rect.width),
              maxY: Math.max(acc.maxY, rect.y + rect.height),
            }),
            { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
          );
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerY = (bounds.minY + bounds.maxY) / 2;
          const offsetX = position.x - centerX;
          const offsetY = position.y - centerY;

          const annotation: RedactionAnnotation = {
            ...data,
            id: newId,
            page: pageIndex,
            rects: data.rects.map((rect) => ({
              ...rect,
              x: rect.x + offsetX,
              y: rect.y + offsetY,
            })),
          };
          dispatch({ type: "ADD_REDACTION", annotation });
          dispatch({ type: "SELECT_ANNOTATION", id: newId });
          break;
        }
      }
    },
    [state.clipboard]
  );

  // Delete the currently selected annotation
  const deleteSelectedAnnotation = useCallback(() => {
    if (!state.selectedAnnotationId) return;

    const id = state.selectedAnnotationId;

    if (state.textAnnotations.find((a) => a.id === id)) {
      dispatch({ type: "REMOVE_TEXT_ANNOTATION", id });
    } else if (state.signatureAnnotations.find((a) => a.id === id)) {
      dispatch({ type: "REMOVE_SIGNATURE_ANNOTATION", id });
    } else if (state.highlightAnnotations.find((a) => a.id === id)) {
      dispatch({ type: "REMOVE_HIGHLIGHT", id });
    } else if (state.strikethroughAnnotations.find((a) => a.id === id)) {
      dispatch({ type: "REMOVE_STRIKETHROUGH", id });
    } else if (state.redactionAnnotations.find((a) => a.id === id)) {
      dispatch({ type: "REMOVE_REDACTION", id });
    }
  }, [state.selectedAnnotationId, state.textAnnotations, state.signatureAnnotations, state.highlightAnnotations, state.strikethroughAnnotations, state.redactionAnnotations]);

  return {
    state,
    setPdf,
    addTextAnnotation,
    updateTextAnnotation,
    removeTextAnnotation,
    addSignatureAnnotation,
    updateSignatureAnnotation,
    removeSignatureAnnotation,
    addHighlight,
    removeHighlight,
    addStrikethrough,
    removeStrikethrough,
    addRedaction,
    removeRedaction,
    toggleRedaction,
    setFormField,
    setScale,
    // Alias for zoom hook compatibility
    commitZoom: setScale,
    setActiveTool,
    selectAnnotation,
    reset,
    copySelectedAnnotation,
    pasteAnnotation,
    deleteSelectedAnnotation,
    // Undo/redo
    canUndo,
    canRedo,
    undo,
    redo,
  };
}
