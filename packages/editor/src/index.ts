// Main Editor Component
export { PDFEditor } from "./components/pdf-editor";

// PDF Viewer
export { PDFViewer } from "./components/pdf-viewer";

// Toolbar
export { Toolbar } from "./components/toolbar";
export { MobileToolbar } from "./components/mobile-toolbar";

// Dialogs
export { AddFileDialog } from "./components/add-file-dialog";
export { CloseTabDialog } from "./components/close-tab-dialog";

// UI Components
export { EditorEmptyState } from "./components/editor-empty-state";
export { DropZoneOverlay } from "./components/drop-zone-overlay";
export { ScrollProgress } from "./components/scroll-progress";
export { TabBar } from "./components/tab-bar";
export { PageSkeleton } from "./components/page-skeleton";
export { SelectionToolbar } from "./components/selection-toolbar";

// Hooks
export { useEditorState } from "./hooks/use-editor-state";
export { useMultiDocumentState } from "./hooks/use-multi-document-state";
export { useCurrentPage } from "./hooks/use-current-page";
export { usePersistence } from "./hooks/use-persistence";
export { useScrollProgress } from "./hooks/use-scroll-progress";
export { useTextSelection } from "./hooks/use-text-selection";
export { useVirtualizedPages } from "./hooks/use-virtualized-pages";
export { useZoom } from "./hooks/use-zoom";
