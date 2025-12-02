import type { TabId, EditorSnapshot } from "@/hooks/use-multi-document-state";

// Database configuration
const DB_NAME = "paperwork-db";
const DB_VERSION = 1;
const STORE_NAME = "sessions";
const SESSION_KEY = "current-session";
const LOCAL_STORAGE_MARKER = "paperwork-session-exists";

// Persisted data structures
export interface PersistedTab {
  id: TabId;
  fileName: string;
  pdfBytes: Uint8Array;
  isDirty: boolean;
  editorSnapshot: EditorSnapshot;
  formValues: Record<string, string | boolean>;
}

export interface PersistedSession {
  version: number;
  lastModified: number;
  tabs: PersistedTab[];
  activeTabId: TabId | null;
  tabOrder: TabId[];
}

// Open or create the IndexedDB database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Save session to IndexedDB
export async function saveSession(session: PersistedSession): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put(session, SESSION_KEY);

      request.onerror = () => {
        reject(new Error("Failed to save session"));
      };

      request.onsuccess = () => {
        // Set localStorage marker for quick session detection
        try {
          localStorage.setItem(LOCAL_STORAGE_MARKER, "true");
        } catch {
          // localStorage might be unavailable, but we can continue
        }
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Failed to save session:", error);
    throw error;
  }
}

// Load session from IndexedDB
export async function loadSession(): Promise<PersistedSession | null> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(SESSION_KEY);

      request.onerror = () => {
        reject(new Error("Failed to load session"));
      };

      request.onsuccess = () => {
        const data = request.result as PersistedSession | undefined;

        if (!data) {
          resolve(null);
          return;
        }

        // Validate structure
        if (
          typeof data.version !== "number" ||
          !Array.isArray(data.tabs) ||
          !Array.isArray(data.tabOrder)
        ) {
          console.warn("Invalid session structure, clearing");
          clearSession().then(() => resolve(null));
          return;
        }

        // Filter out corrupted tabs
        const validTabs = data.tabs.filter((tab) => {
          return (
            typeof tab.id === "string" &&
            typeof tab.fileName === "string" &&
            tab.pdfBytes instanceof Uint8Array &&
            tab.pdfBytes.length > 0 &&
            tab.editorSnapshot !== undefined
          );
        });

        if (validTabs.length === 0) {
          clearSession().then(() => resolve(null));
          return;
        }

        // Also filter tabOrder to only include valid tab IDs
        const validTabIds = new Set(validTabs.map((t) => t.id));
        const validTabOrder = data.tabOrder.filter((id) => validTabIds.has(id));

        // Ensure activeTabId is valid
        const activeTabId = data.activeTabId && validTabIds.has(data.activeTabId)
          ? data.activeTabId
          : validTabs[0]?.id ?? null;

        resolve({
          ...data,
          tabs: validTabs,
          tabOrder: validTabOrder,
          activeTabId,
        });
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Failed to load session:", error);
    // Clear potentially corrupted data
    await clearSession();
    return null;
  }
}

// Clear all stored session data
export async function clearSession(): Promise<void> {
  try {
    // Clear localStorage marker
    try {
      localStorage.removeItem(LOCAL_STORAGE_MARKER);
    } catch {
      // Ignore localStorage errors
    }

    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(SESSION_KEY);

      request.onerror = () => {
        reject(new Error("Failed to clear session"));
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Failed to clear session:", error);
    // Don't throw - clearing should be best-effort
  }
}

// Quick check if a persisted session exists (uses localStorage for speed)
export function hasPersistedSession(): boolean {
  try {
    return localStorage.getItem(LOCAL_STORAGE_MARKER) === "true";
  } catch {
    // localStorage unavailable, need to check IndexedDB
    return false;
  }
}

// Check if IndexedDB is available
export function isStorageAvailable(): boolean {
  try {
    if (typeof indexedDB === "undefined") return false;
    // Quick test to ensure we can open a database
    const testRequest = indexedDB.open("test-availability");
    testRequest.onerror = () => {
      // Storage not available (e.g., incognito mode)
    };
    return true;
  } catch {
    return false;
  }
}
