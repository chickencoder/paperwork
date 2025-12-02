import { useEffect, useRef, useCallback, useState } from "react";
import {
  saveSession,
  clearSession,
  type PersistedSession,
  type PersistedTab,
} from "@/lib/storage/persistence";
import type { MultiDocumentState, TabId } from "@/hooks/use-multi-document-state";

interface UsePersistenceOptions {
  debounceMs?: number;
}

interface UsePersistenceReturn {
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
  clearSaved: () => Promise<void>;
}

export function usePersistence(
  multiDocState: MultiDocumentState,
  formValuesRef: React.RefObject<Map<TabId, Record<string, string | boolean>>>,
  options: UsePersistenceOptions = {}
): UsePersistenceReturn {
  const { debounceMs = 1000 } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const isSavingRef = useRef(false);

  // Build session object from current state
  const buildSession = useCallback((): PersistedSession => {
    const formValuesMap = formValuesRef.current ?? new Map();

    const tabs: PersistedTab[] = multiDocState.orderedTabs.map((tab) => ({
      id: tab.id,
      fileName: tab.fileName,
      pdfBytes: tab.pdfBytes,
      isDirty: tab.isDirty,
      editorSnapshot: tab.editorSnapshot,
      formValues: formValuesMap.get(tab.id) ?? {},
    }));

    return {
      version: 1,
      lastModified: Date.now(),
      tabs,
      activeTabId: multiDocState.activeTabId,
      tabOrder: multiDocState.tabOrder,
    };
  }, [multiDocState.orderedTabs, multiDocState.activeTabId, multiDocState.tabOrder, formValuesRef]);

  // Perform the actual save
  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      const session = buildSession();

      // Don't save empty sessions
      if (session.tabs.length === 0) {
        await clearSession();
        return;
      }

      await saveSession(session);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save session:", error);
    } finally {
      isSavingRef.current = false;
    }
  }, [buildSession]);

  // Debounced save scheduler
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      performSave();
      saveTimeoutRef.current = null;
    }, debounceMs);
  }, [performSave, debounceMs]);

  // Watch for changes and schedule saves
  const hasOpenTabs = multiDocState.orderedTabs.length > 0;
  useEffect(() => {
    // Only save if we have tabs
    if (hasOpenTabs) {
      scheduleSave();
    }
  }, [
    // Trigger save on any state change
    hasOpenTabs,
    multiDocState.tabs,
    multiDocState.tabOrder,
    multiDocState.activeTabId,
    scheduleSave,
  ]);

  // Clear storage when all tabs are closed
  useEffect(() => {
    if (multiDocState.orderedTabs.length === 0) {
      // Cancel any pending save
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      clearSession();
    }
  }, [multiDocState.orderedTabs.length]);

  // Save on beforeunload (best-effort synchronous save marker)
  const tabCount = multiDocState.orderedTabs.length;
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Attempt an immediate save
      // Note: IndexedDB operations may not complete, but the session
      // should already be saved from the debounced save
      if (tabCount > 0 && !isSavingRef.current) {
        // Can't do async in beforeunload, but our debounced saves should
        // have already captured the state
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [tabCount]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Force immediate save
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await performSave();
  }, [performSave]);

  return {
    lastSaved,
    saveNow,
    clearSaved: clearSession,
  };
}
