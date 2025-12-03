import type { TabId, EditorSnapshot } from "@/hooks/use-multi-document-state";

// Database configuration
const DB_NAME = "paperwork-db";
const DB_VERSION = 2;
const STORE_NAME = "sessions";
const PENDING_PDF_STORE = "pending-pdfs";

// Helper to get localStorage key for a session
function getSessionMarkerKey(sessionId: string): string {
  return `paperwork-session-${sessionId}`;
}

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
      if (!db.objectStoreNames.contains(PENDING_PDF_STORE)) {
        db.createObjectStore(PENDING_PDF_STORE);
      }
    };
  });
}

// Custom error types for better handling
export class StorageQuotaError extends Error {
  constructor(message: string = "Storage quota exceeded") {
    super(message);
    this.name = "StorageQuotaError";
  }
}

// Save session to IndexedDB
export async function saveSession(sessionId: string, session: PersistedSession): Promise<void> {
  const db = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put(session, sessionId);

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        if (error?.name === "QuotaExceededError") {
          reject(new StorageQuotaError("Storage quota exceeded. Please clear some browser data."));
        } else {
          reject(new Error("Failed to save session"));
        }
      };

      request.onsuccess = () => {
        // Set localStorage marker for quick session detection
        try {
          localStorage.setItem(getSessionMarkerKey(sessionId), "true");
        } catch {
          // localStorage might be unavailable, but we can continue
        }
        resolve();
      };

      transaction.onerror = (event) => {
        const error = (event.target as IDBTransaction).error;
        if (error?.name === "QuotaExceededError") {
          reject(new StorageQuotaError("Storage quota exceeded. Please clear some browser data."));
        } else {
          reject(new Error("Transaction failed"));
        }
      };

      transaction.oncomplete = () => {
        // Cleanup handled in finally
      };
    });
  } finally {
    db.close();
  }
}

// Load session from IndexedDB
export async function loadSession(sessionId: string): Promise<PersistedSession | null> {
  let db: IDBDatabase | null = null;

  try {
    db = await openDatabase();

    return await new Promise((resolve, reject) => {
      const transaction = db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(sessionId);

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
          clearSession(sessionId).then(() => resolve(null));
          return;
        }

        // Filter out corrupted tabs (with safe Uint8Array check)
        const validTabs = data.tabs.filter((tab) => {
          try {
            // Ensure pdfBytes is a Uint8Array (may need conversion after deserialization)
            if (tab.pdfBytes && !(tab.pdfBytes instanceof Uint8Array)) {
              tab.pdfBytes = new Uint8Array(tab.pdfBytes as ArrayLike<number>);
            }
            return (
              typeof tab.id === "string" &&
              typeof tab.fileName === "string" &&
              tab.pdfBytes instanceof Uint8Array &&
              tab.pdfBytes.length > 0 &&
              tab.editorSnapshot !== undefined
            );
          } catch {
            return false;
          }
        });

        if (validTabs.length === 0) {
          clearSession(sessionId).then(() => resolve(null));
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

      transaction.onerror = () => {
        reject(new Error("Transaction failed"));
      };
    });
  } catch (error) {
    console.error("Failed to load session:", error);
    // Clear potentially corrupted data
    await clearSession(sessionId);
    return null;
  } finally {
    db?.close();
  }
}

// Clear stored session data for a specific session
export async function clearSession(sessionId: string): Promise<void> {
  // Clear localStorage marker
  try {
    localStorage.removeItem(getSessionMarkerKey(sessionId));
  } catch {
    // Ignore localStorage errors
  }

  let db: IDBDatabase | null = null;

  try {
    db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(sessionId);

      request.onerror = () => {
        reject(new Error("Failed to clear session"));
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error("Transaction failed"));
      };
    });
  } catch (error) {
    console.error("Failed to clear session:", error);
    // Don't throw - clearing should be best-effort
  } finally {
    db?.close();
  }
}

// Quick check if a persisted session exists (uses localStorage for speed)
export function hasPersistedSession(sessionId: string): boolean {
  try {
    return localStorage.getItem(getSessionMarkerKey(sessionId)) === "true";
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

// Pending PDF storage (for transferring between pages without sessionStorage limits)
export interface PendingPdf {
  sessionId: string;
  name: string;
  bytes: Uint8Array;
}

// Save pending PDF to IndexedDB (for cross-page navigation)
export async function savePendingPdf(pdf: PendingPdf): Promise<void> {
  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PENDING_PDF_STORE, "readwrite");
      const store = transaction.objectStore(PENDING_PDF_STORE);

      const request = store.put(pdf, "pending");

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        if (error?.name === "QuotaExceededError") {
          reject(new StorageQuotaError("Storage quota exceeded. Please clear some browser data."));
        } else {
          reject(new Error("Failed to save pending PDF"));
        }
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.onerror = (event) => {
        const error = (event.target as IDBTransaction).error;
        if (error?.name === "QuotaExceededError") {
          reject(new StorageQuotaError("Storage quota exceeded. Please clear some browser data."));
        } else {
          reject(new Error("Transaction failed"));
        }
      };
    });
  } finally {
    db.close();
  }
}

// Load and remove pending PDF from IndexedDB
export async function loadPendingPdf(): Promise<PendingPdf | null> {
  let db: IDBDatabase | null = null;

  try {
    db = await openDatabase();

    return await new Promise((resolve, reject) => {
      const transaction = db!.transaction(PENDING_PDF_STORE, "readwrite");
      const store = transaction.objectStore(PENDING_PDF_STORE);

      const getRequest = store.get("pending");

      getRequest.onerror = () => {
        reject(new Error("Failed to load pending PDF"));
      };

      getRequest.onsuccess = () => {
        const data = getRequest.result as PendingPdf | undefined;

        if (data) {
          // Delete after reading
          store.delete("pending");
        }

        // Ensure bytes is a Uint8Array (safe conversion)
        if (data) {
          try {
            if (!(data.bytes instanceof Uint8Array)) {
              data.bytes = new Uint8Array(data.bytes as ArrayLike<number>);
            }
          } catch {
            // If conversion fails, return null
            resolve(null);
            return;
          }
        }

        resolve(data || null);
      };

      transaction.onerror = () => {
        reject(new Error("Transaction failed"));
      };
    });
  } catch (error) {
    console.error("Failed to load pending PDF:", error);
    return null;
  } finally {
    db?.close();
  }
}

// Clear pending PDF (cleanup if navigation fails)
export async function clearPendingPdf(): Promise<void> {
  let db: IDBDatabase | null = null;

  try {
    db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(PENDING_PDF_STORE, "readwrite");
      const store = transaction.objectStore(PENDING_PDF_STORE);

      const request = store.delete("pending");

      request.onerror = () => {
        reject(new Error("Failed to clear pending PDF"));
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error("Transaction failed"));
      };
    });
  } catch (error) {
    console.error("Failed to clear pending PDF:", error);
  } finally {
    db?.close();
  }
}
