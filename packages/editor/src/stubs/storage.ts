/**
 * Stub module for storage/persistence.
 * These are web-app specific features not available in widget mode.
 */

import type { EditorSnapshot } from "../hooks/use-editor-state";

export interface PersistedTab {
  id: string;
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
  activeTabId: string | null;
  tabOrder: string[];
}

/** No-op persistence functions for widget mode */
export async function saveSession(
  _sessionId: string,
  _session: Omit<PersistedSession, "timestamp">
): Promise<void> {
  // No persistence in widget mode
}

export async function clearSession(_sessionId: string): Promise<void> {
  // No persistence in widget mode
}

export async function loadSession(_sessionId: string): Promise<PersistedSession | null> {
  return null;
}

export async function savePendingPdf(_data: {
  sessionId: string;
  name: string;
  bytes: Uint8Array;
}): Promise<void> {
  // No persistence in widget mode
}

export async function loadPendingPdf(_sessionId: string): Promise<{
  name: string;
  bytes: Uint8Array;
} | null> {
  return null;
}
