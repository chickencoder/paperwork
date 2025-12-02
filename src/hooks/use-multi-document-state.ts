import { useState, useCallback } from "react";
import type {
  TextAnnotation,
  SignatureAnnotation,
  HighlightAnnotation,
  StrikethroughAnnotation,
  RedactionAnnotation,
} from "@/lib/pdf/types";

// Unique identifier for each tab/document session
export type TabId = string;

// Clipboard annotation type (mirrored from use-editor-state)
type ClipboardAnnotation =
  | { type: "text"; data: Omit<TextAnnotation, "id"> }
  | { type: "signature"; data: Omit<SignatureAnnotation, "id"> }
  | { type: "highlight"; data: Omit<HighlightAnnotation, "id"> }
  | { type: "strikethrough"; data: Omit<StrikethroughAnnotation, "id"> }
  | { type: "redaction"; data: Omit<RedactionAnnotation, "id"> };

// Editor state snapshot (what we persist per tab)
export interface EditorSnapshot {
  scale: number;
  textAnnotations: TextAnnotation[];
  signatureAnnotations: SignatureAnnotation[];
  highlightAnnotations: HighlightAnnotation[];
  strikethroughAnnotations: StrikethroughAnnotation[];
  redactionAnnotations: RedactionAnnotation[];
  selectedAnnotationId: string | null;
  activeTool: "select" | "text-insert" | "signature";
  clipboard: ClipboardAnnotation | null;
  // History for undo/redo preserved per tab
  historyLength: number; // Track if there are undoable changes
}

// State for a single document tab
export interface DocumentTab {
  id: TabId;
  file: File;
  pdfBytes: Uint8Array;
  fileName: string;
  isDirty: boolean;
  editorSnapshot: EditorSnapshot;
}

// Generate unique tab ID
function generateTabId(): TabId {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Create default editor snapshot for new tabs
function createDefaultSnapshot(): EditorSnapshot {
  return {
    scale: 1,
    textAnnotations: [],
    signatureAnnotations: [],
    highlightAnnotations: [],
    strikethroughAnnotations: [],
    redactionAnnotations: [],
    selectedAnnotationId: null,
    activeTool: "select",
    clipboard: null,
    historyLength: 0,
  };
}

// Initial state for restoration from persistence
export interface InitialPersistedState {
  tabs: Array<{
    id: TabId;
    fileName: string;
    pdfBytes: Uint8Array;
    isDirty: boolean;
    editorSnapshot: EditorSnapshot;
  }>;
  tabOrder: TabId[];
  activeTabId: TabId | null;
}

export function useMultiDocumentState(initialState?: InitialPersistedState) {
  const [tabs, setTabs] = useState<Map<TabId, DocumentTab>>(() => {
    if (initialState) {
      const map = new Map<TabId, DocumentTab>();
      for (const tab of initialState.tabs) {
        // Reconstruct File object from bytes
        // Use slice() to get a standard ArrayBuffer from Uint8Array
        const file = new File([tab.pdfBytes.slice().buffer], tab.fileName, {
          type: "application/pdf",
        });
        map.set(tab.id, {
          id: tab.id,
          file,
          pdfBytes: tab.pdfBytes,
          fileName: tab.fileName,
          isDirty: tab.isDirty,
          editorSnapshot: tab.editorSnapshot,
        });
      }
      return map;
    }
    return new Map();
  });

  const [activeTabId, setActiveTabId] = useState<TabId | null>(
    initialState?.activeTabId ?? null
  );

  const [tabOrder, setTabOrder] = useState<TabId[]>(
    initialState?.tabOrder ?? []
  );

  // Add a new tab from a file
  const addTab = useCallback((file: File, bytes: Uint8Array): TabId => {
    const id = generateTabId();
    const newTab: DocumentTab = {
      id,
      file,
      pdfBytes: bytes,
      fileName: file.name,
      isDirty: false,
      editorSnapshot: createDefaultSnapshot(),
    };

    setTabs((prev) => new Map(prev).set(id, newTab));
    setTabOrder((prev) => [...prev, id]);
    setActiveTabId(id);

    return id;
  }, []);

  // Close a tab (caller should confirm if dirty)
  const closeTab = useCallback(
    (tabId: TabId) => {
      setTabs((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tabId);
        return newMap;
      });

      setTabOrder((prev) => {
        const newOrder = prev.filter((id) => id !== tabId);

        // If closing active tab, switch to adjacent tab
        if (activeTabId === tabId && newOrder.length > 0) {
          const currentIndex = prev.indexOf(tabId);
          const newActiveId =
            newOrder[Math.min(currentIndex, newOrder.length - 1)] || null;
          setActiveTabId(newActiveId);
        } else if (newOrder.length === 0) {
          setActiveTabId(null);
        }

        return newOrder;
      });
    },
    [activeTabId]
  );

  // Switch to a different tab
  const switchTab = useCallback((tabId: TabId) => {
    setActiveTabId(tabId);
  }, []);

  // Reorder tabs via drag-and-drop
  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabOrder((prev) => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return newOrder;
    });
  }, []);

  // Update editor snapshot for a specific tab
  const updateTabSnapshot = useCallback(
    (tabId: TabId, snapshot: EditorSnapshot, isDirty: boolean) => {
      setTabs((prev) => {
        const tab = prev.get(tabId);
        if (!tab) return prev;
        const newMap = new Map(prev);
        newMap.set(tabId, {
          ...tab,
          editorSnapshot: snapshot,
          isDirty,
        });
        return newMap;
      });
    },
    []
  );

  // Mark a tab as clean (after download/save)
  const markTabClean = useCallback((tabId: TabId) => {
    setTabs((prev) => {
      const tab = prev.get(tabId);
      if (!tab) return prev;
      const newMap = new Map(prev);
      newMap.set(tabId, { ...tab, isDirty: false });
      return newMap;
    });
  }, []);

  // Get ordered tabs array
  const orderedTabs = tabOrder
    .map((id) => tabs.get(id))
    .filter((tab): tab is DocumentTab => tab !== undefined);

  // Get active tab
  const activeTab = activeTabId ? tabs.get(activeTabId) ?? null : null;

  // Check if any tab has unsaved changes
  const hasAnyDirtyTab = orderedTabs.some((tab) => tab.isDirty);

  return {
    tabs,
    activeTabId,
    activeTab,
    orderedTabs,
    tabOrder,
    hasAnyDirtyTab,
    addTab,
    closeTab,
    switchTab,
    reorderTabs,
    updateTabSnapshot,
    markTabClean,
  };
}

export type MultiDocumentState = ReturnType<typeof useMultiDocumentState>;
