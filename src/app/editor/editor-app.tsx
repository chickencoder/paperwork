"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PDFEditor } from "@/components/editor/pdf-editor";
import { TabBar } from "@/components/editor/tab-bar";
import { AddFileDialog } from "@/components/editor/add-file-dialog";
import { CloseTabDialog } from "@/components/editor/close-tab-dialog";
import { DropZoneOverlay } from "@/components/editor/drop-zone-overlay";
import { RestoreSessionDialog } from "@/components/restore-session-dialog";
import {
  useMultiDocumentState,
  type TabId,
  type InitialPersistedState,
} from "@/hooks/use-multi-document-state";
import { usePersistence } from "@/hooks/use-persistence";
import {
  hasPersistedSession,
  loadSession,
  clearSession,
  loadPendingPdf,
  type PersistedSession,
} from "@/lib/storage/persistence";
import { mergePDFs } from "@/lib/pdf/pdf-merger";
import type { EditorSnapshot } from "@/hooks/use-editor-state";
import type { TransitionState } from "@/components/landing/landing-dialog";

// App state machine for restore flow
type AppState =
  | { status: "checking" }
  | { status: "asking"; session: PersistedSession }
  | { status: "ready"; initialState?: InitialPersistedState };

function EditorContent({
  sessionId,
  initialState,
  initialFormValues,
  pendingPdf,
  onPendingPdfHandled,
  isEntering,
  entryRect,
  onEnterComplete,
}: {
  sessionId: string;
  initialState?: InitialPersistedState;
  initialFormValues?: Map<TabId, Record<string, string | boolean>>;
  pendingPdf?: { name: string; bytes: Uint8Array } | null;
  onPendingPdfHandled?: () => void;
  isEntering?: boolean;
  entryRect?: TransitionState["dialogRect"];
  onEnterComplete?: () => void;
}) {
  const multiDocState = useMultiDocumentState(initialState);
  const {
    orderedTabs,
    activeTabId,
    activeTab,
    addTab,
    closeTab,
    switchTab,
    reorderTabs,
    updateTabSnapshot,
  } = multiDocState;

  // Track form values for persistence
  const formValuesRef = useRef<Map<TabId, Record<string, string | boolean>>>(
    initialFormValues ?? new Map()
  );

  // Integrate persistence
  usePersistence(sessionId, multiDocState, formValuesRef);

  // Dialog states
  const [addFileDialogOpen, setAddFileDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [closeConfirmTabId, setCloseConfirmTabId] = useState<TabId | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Hidden file input ref for add button
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track drag enter/leave count to handle nested elements
  const dragCounterRef = useRef(0);

  // Track if we've already handled the pending PDF (prevents double-add in StrictMode)
  const pendingPdfHandledRef = useRef(false);

  // Handle pending PDF from landing page
  useEffect(() => {
    if (pendingPdf && pendingPdf.bytes.length > 0 && !pendingPdfHandledRef.current) {
      pendingPdfHandledRef.current = true;
      const file = new File([pendingPdf.bytes as BlobPart], pendingPdf.name, {
        type: "application/pdf",
      });
      addTab(file, pendingPdf.bytes);
      onPendingPdfHandled?.();
    }
  }, [pendingPdf, addTab, onPendingPdfHandled]);

  // Handle initial upload from Upload component
  const handleInitialUpload = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        addTab(file, bytes);
      }
    },
    [addTab]
  );

  // Handle request to add files (from toolbar, drop, or file input)
  const handleAddFilesRequest = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      // If only one file and no existing tabs, just open it directly
      if (files.length === 1 && orderedTabs.length === 0) {
        handleInitialUpload(files);
        return;
      }

      // Show dialog for user to choose action
      setPendingFiles(files);
      setAddFileDialogOpen(true);
    },
    [orderedTabs.length, handleInitialUpload]
  );

  // Handle tab close request
  const handleTabCloseRequest = useCallback(
    (tabId: TabId) => {
      const tab = orderedTabs.find((t) => t.id === tabId);
      if (tab?.isDirty) {
        setCloseConfirmTabId(tabId);
      } else {
        closeTab(tabId);
      }
    },
    [orderedTabs, closeTab]
  );

  // Handle edit separately action
  const handleEditSeparately = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        addTab(file, bytes);
      }
    },
    [addTab]
  );

  // Handle merge action
  const handleMerge = useCallback(
    async (sources: { file: File; bytes: Uint8Array }[]) => {
      try {
        const { mergedBytes, fileName } = await mergePDFs(
          sources.map((s) => ({ bytes: s.bytes, fileName: s.file.name }))
        );
        const mergedFile = new File([mergedBytes as BlobPart], fileName, {
          type: "application/pdf",
        });

        // If we're merging with the current document, close it first
        if (
          activeTab &&
          sources.some((s) => s.file.name === activeTab.fileName)
        ) {
          closeTab(activeTab.id);
        }

        addTab(mergedFile, mergedBytes);
      } catch (error) {
        console.error("Failed to merge PDFs:", error);
      }
    },
    [addTab, activeTab, closeTab]
  );

  // Handle editor state changes
  const handleEditorStateChange = useCallback(
    (snapshot: EditorSnapshot, isDirty: boolean) => {
      if (activeTabId) {
        updateTabSnapshot(activeTabId, snapshot, isDirty);
      }
    },
    [activeTabId, updateTabSnapshot]
  );

  // Handle form values change from editor (for persistence)
  const handleFormValuesChange = useCallback(
    (values: Record<string, string | boolean>) => {
      if (activeTabId) {
        formValuesRef.current.set(activeTabId, values);
      }
    },
    [activeTabId]
  );

  // Handle add file button click
  const handleAddFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(
        (f) => f.type === "application/pdf"
      );
      if (files.length > 0) {
        handleAddFilesRequest(files);
      }
      e.target.value = "";
    },
    [handleAddFilesRequest]
  );

  // Global drag-and-drop handlers for the editor
  useEffect(() => {
    // Only enable drop overlay when we have tabs open
    if (orderedTabs.length === 0) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounterRef.current++;
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer?.files || []).filter(
        (f) => f.type === "application/pdf"
      );
      if (files.length > 0) {
        handleAddFilesRequest(files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [orderedTabs.length, handleAddFilesRequest]);

  // No tabs: redirect to landing page
  const router = useRouter();
  useEffect(() => {
    if (orderedTabs.length === 0 && !pendingPdf) {
      router.replace("/");
    }
  }, [orderedTabs.length, pendingPdf, router]);

  if (orderedTabs.length === 0) {
    return <div className="min-h-screen bg-muted" />;
  }

  // Has tabs: show editor with tab bar (only when multiple tabs)
  return (
    <div className="min-h-screen bg-background flex flex-col overscroll-none">
      {orderedTabs.length > 1 && (
        <TabBar
          tabs={orderedTabs}
          activeTabId={activeTabId}
          onTabSelect={switchTab}
          onTabClose={handleTabCloseRequest}
          onTabReorder={reorderTabs}
          onAddFile={handleAddFileClick}
        />
      )}

      {activeTab && (
        <PDFEditor
          key={activeTab.id}
          file={activeTab.file}
          initialSnapshot={activeTab.editorSnapshot}
          initialFormValues={initialFormValues?.get(activeTab.id)}
          onStateChange={handleEditorStateChange}
          onFormValuesChange={handleFormValuesChange}
          onAddTab={addTab}
          hasTabBar={orderedTabs.length > 1}
          isEntering={isEntering}
          entryRect={entryRect}
          onEnterComplete={onEnterComplete}
        />
      )}

      {/* Hidden file input for add button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <AddFileDialog
        open={addFileDialogOpen}
        onOpenChange={setAddFileDialogOpen}
        pendingFiles={pendingFiles}
        currentDocument={
          activeTab
            ? { fileName: activeTab.fileName, bytes: activeTab.pdfBytes }
            : undefined
        }
        onEditSeparately={handleEditSeparately}
        onMerge={handleMerge}
      />

      <CloseTabDialog
        open={closeConfirmTabId !== null}
        fileName={
          orderedTabs.find((t) => t.id === closeConfirmTabId)?.fileName || ""
        }
        onDiscard={() => {
          if (closeConfirmTabId) closeTab(closeConfirmTabId);
          setCloseConfirmTabId(null);
        }}
        onCancel={() => setCloseConfirmTabId(null)}
      />

      <DropZoneOverlay visible={isDragOver} />
    </div>
  );
}

// Main Editor App component with restore flow
export default function EditorApp({ sessionId }: { sessionId: string }) {
  const [appState, setAppState] = useState<AppState>({ status: "checking" });
  const [restoredFormValues, setRestoredFormValues] = useState<
    Map<TabId, Record<string, string | boolean>> | undefined
  >(undefined);
  const [pendingPdf, setPendingPdf] = useState<{
    name: string;
    bytes: Uint8Array;
  } | null>(null);

  // Transition animation state from homepage
  const [isEntering, setIsEntering] = useState(false);
  const [entryRect, setEntryRect] = useState<TransitionState["dialogRect"]>(null);

  // Check for pending PDF and persisted session on mount
  useEffect(() => {
    async function initialize() {
      // First, check for pending PDF from landing page (stored in IndexedDB)
      let hasPendingPdf = false;
      try {
        const pending = await loadPendingPdf();
        if (pending) {
          setPendingPdf({
            name: pending.name,
            bytes: pending.bytes,
          });
          hasPendingPdf = true;
        }
      } catch (e) {
        console.error("Failed to load pending PDF:", e);
      }

      // Check for transition state from homepage
      const transitionStateStr = sessionStorage.getItem("transitionState");
      if (transitionStateStr) {
        try {
          const transitionState: TransitionState = JSON.parse(transitionStateStr);
          // Only use if fresh (within last 2 seconds) and from homepage
          if (
            transitionState.fromHomepage &&
            Date.now() - transitionState.timestamp < 2000
          ) {
            setIsEntering(true);
            setEntryRect(transitionState.dialogRect);
          }
        } catch (e) {
          console.error("Failed to parse transition state:", e);
        }
        sessionStorage.removeItem("transitionState");
      }

      // If we have a pending PDF, skip restore dialog (it's a new session)
      if (hasPendingPdf) {
        setRestoredFormValues(undefined);
        setAppState({ status: "ready" });
        return;
      }

      // Otherwise, check for persisted session with this sessionId
      try {
        if (hasPersistedSession(sessionId)) {
          const session = await loadSession(sessionId);
          if (session && session.tabs.length > 0) {
            // Store form values for later injection
            const formValues = new Map<
              TabId,
              Record<string, string | boolean>
            >();
            for (const tab of session.tabs) {
              if (tab.formValues && Object.keys(tab.formValues).length > 0) {
                formValues.set(tab.id, tab.formValues);
              }
            }
            setRestoredFormValues(formValues);
            setAppState({ status: "asking", session });
          } else {
            setAppState({ status: "ready" });
          }
        } else {
          setAppState({ status: "ready" });
        }
      } catch (error) {
        console.error("Failed to check session:", error);
        await clearSession(sessionId);
        setAppState({ status: "ready" });
      }
    }
    initialize().catch((error) => {
      console.error("Failed to initialize editor:", error);
      setAppState({ status: "ready" });
    });
  }, [sessionId]);

  // Handle restore confirmation
  const handleRestore = useCallback(() => {
    if (appState.status !== "asking") return;

    const session = appState.session;
    const initialState: InitialPersistedState = {
      tabs: session.tabs.map((tab) => ({
        id: tab.id,
        fileName: tab.fileName,
        pdfBytes: tab.pdfBytes,
        isDirty: tab.isDirty,
        editorSnapshot: tab.editorSnapshot,
      })),
      tabOrder: session.tabOrder,
      activeTabId: session.activeTabId,
    };

    setAppState({ status: "ready", initialState });
  }, [appState]);

  // Handle start fresh
  const handleStartFresh = useCallback(async () => {
    await clearSession(sessionId);
    setRestoredFormValues(undefined);
    setAppState({ status: "ready" });
  }, [sessionId]);

  // Handle pending PDF consumed
  const handlePendingPdfHandled = useCallback(() => {
    setPendingPdf(null);
  }, []);

  // Handle enter animation complete
  const handleEnterComplete = useCallback(() => {
    setIsEntering(false);
    setEntryRect(null);
  }, []);

  // Show loading state while checking
  if (appState.status === "checking") {
    return <div className="min-h-screen bg-muted" />;
  }

  // Show restore dialog with restored session visible in background
  if (appState.status === "asking") {
    const session = appState.session;
    const previewState: InitialPersistedState = {
      tabs: session.tabs.map((tab) => ({
        id: tab.id,
        fileName: tab.fileName,
        pdfBytes: tab.pdfBytes,
        isDirty: tab.isDirty,
        editorSnapshot: tab.editorSnapshot,
      })),
      tabOrder: session.tabOrder,
      activeTabId: session.activeTabId,
    };

    return (
      <>
        <div className="pointer-events-none">
          <EditorContent
            sessionId={sessionId}
            initialState={previewState}
            initialFormValues={restoredFormValues}
          />
        </div>
        <RestoreSessionDialog
          open={true}
          documentCount={appState.session.tabs.length}
          onRestore={handleRestore}
          onStartFresh={handleStartFresh}
        />
      </>
    );
  }

  // Ready state - render the app
  return (
    <EditorContent
      sessionId={sessionId}
      initialState={appState.initialState}
      initialFormValues={appState.initialState ? restoredFormValues : undefined}
      pendingPdf={pendingPdf}
      onPendingPdfHandled={handlePendingPdfHandled}
      isEntering={isEntering}
      entryRect={entryRect}
      onEnterComplete={handleEnterComplete}
    />
  );
}
