import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import type { OpenAIWidget, ToolOutput } from "../types/openai";

// Subscribe to window.openai changes via openai:set_globals event
function subscribeToOpenAI(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("openai:set_globals", handler);
  return () => window.removeEventListener("openai:set_globals", handler);
}

function getOpenAISnapshot(): OpenAIWidget | undefined {
  return window.openai;
}

function getOpenAIServerSnapshot(): OpenAIWidget | undefined {
  return undefined;
}

/**
 * Hook to access window.openai with reactive updates
 */
export function useOpenAI() {
  const openai = useSyncExternalStore(
    subscribeToOpenAI,
    getOpenAISnapshot,
    getOpenAIServerSnapshot
  );

  return openai;
}

/**
 * Hook to access tool output from MCP server (structuredContent)
 */
export function useToolOutput(): ToolOutput | undefined {
  const openai = useOpenAI();
  return openai?.toolOutput as ToolOutput | undefined;
}

/**
 * Hook to access tool input parameters
 */
export function useToolInput(): Record<string, unknown> | undefined {
  const openai = useOpenAI();
  return openai?.toolInput;
}

/**
 * Hook to access and update widget state
 */
export function useWidgetState<T extends object>(
  initialState: T | (() => T)
): [T, (updater: T | ((prev: T) => T)) => void] {
  const openai = useOpenAI();

  const [state, setStateInternal] = useState<T>(() => {
    // Initialize from window.openai.widgetState if available
    const existing = openai?.widgetState as T | undefined;
    if (existing && Object.keys(existing).length > 0) {
      return existing;
    }
    return typeof initialState === "function" ? initialState() : initialState;
  });

  // Sync with window.openai.widgetState on changes
  useEffect(() => {
    if (openai?.widgetState) {
      const widgetState = openai.widgetState as unknown as T;
      if (JSON.stringify(widgetState) !== JSON.stringify(state)) {
        setStateInternal(widgetState);
      }
    }
  }, [openai?.widgetState]);

  const setState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setStateInternal((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        // Sync to window.openai
        openai?.setWidgetState(next as unknown as Record<string, unknown>);
        return next;
      });
    },
    [openai]
  );

  return [state, setState];
}

/**
 * Hook to get current theme (light/dark)
 */
export function useTheme(): "light" | "dark" {
  const openai = useOpenAI();
  return openai?.theme ?? "light";
}

/**
 * Hook to call MCP tools from the widget
 */
export function useCallTool() {
  const openai = useOpenAI();

  return useCallback(
    async (name: string, input: Record<string, unknown>) => {
      if (!openai?.callTool) {
        console.warn("window.openai.callTool not available");
        return null;
      }
      return openai.callTool(name, input);
    },
    [openai]
  );
}

/**
 * Hook to upload files
 */
export function useFileUpload() {
  const openai = useOpenAI();

  return useCallback(
    async (file: File) => {
      if (!openai?.uploadFile) {
        console.warn("window.openai.uploadFile not available");
        return null;
      }
      return openai.uploadFile(file);
    },
    [openai]
  );
}

/**
 * Hook to get file download URL from ChatGPT
 */
export function useGetFileDownloadUrl() {
  const openai = useOpenAI();

  return useCallback(
    async (fileId: string): Promise<string | null> => {
      if (!openai?.getFileDownloadUrl) {
        console.warn("window.openai.getFileDownloadUrl not available");
        return null;
      }
      return openai.getFileDownloadUrl({ fileId });
    },
    [openai]
  );
}

/**
 * Hook to get and set display mode (inline, pip, fullscreen)
 */
export function useDisplayMode() {
  const openai = useOpenAI();
  const sdkDisplayMode = openai?.displayMode;

  // Track local state for immediate UI response (and fallback when SDK unavailable)
  const [localFullscreen, setLocalFullscreen] = useState(false);

  // Sync local state with SDK when available
  useEffect(() => {
    if (sdkDisplayMode !== undefined) {
      setLocalFullscreen(sdkDisplayMode === "fullscreen");
    }
  }, [sdkDisplayMode]);

  const displayMode = sdkDisplayMode ?? (localFullscreen ? "fullscreen" : "inline");

  const requestDisplayMode = useCallback(
    async (mode: "inline" | "pip" | "fullscreen") => {
      // Update local state immediately for responsive UI
      setLocalFullscreen(mode === "fullscreen");

      if (!openai?.requestDisplayMode) {
        // Fallback: just use local state when SDK unavailable
        return;
      }
      await openai.requestDisplayMode({ mode });
    },
    [openai]
  );

  const toggleFullscreen = useCallback(async () => {
    const newMode = displayMode === "fullscreen" ? "inline" : "fullscreen";
    await requestDisplayMode(newMode);
  }, [displayMode, requestDisplayMode]);

  return {
    displayMode,
    requestDisplayMode,
    toggleFullscreen,
    isFullscreen: displayMode === "fullscreen",
  };
}

/**
 * Hook to get max height from ChatGPT
 */
export function useMaxHeight(): number | undefined {
  const openai = useOpenAI();
  return openai?.maxHeight;
}

/**
 * Hook to send a follow-up message to the AI conversation
 */
export function useSendFollowUpMessage() {
  const openai = useOpenAI();

  return useCallback(
    (prompt: string) => {
      if (!openai?.sendFollowUpMessage) {
        console.warn("window.openai.sendFollowUpMessage not available");
        return;
      }
      openai.sendFollowUpMessage({ prompt });
    },
    [openai]
  );
}
