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

  // Track actual fullscreen state (not optimistic - waits for ChatGPT)
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Track if we've requested fullscreen and are waiting for it
  const [pendingFullscreen, setPendingFullscreen] = useState(false);

  // Poll for display mode changes since the SDK may not fire events consistently
  useEffect(() => {
    // Poll when we're fullscreen (to detect exit) or when we're waiting for fullscreen
    if (!isFullscreen && !pendingFullscreen) return;

    const checkDisplayMode = () => {
      const currentMode = window.openai?.displayMode;
      if (currentMode === "fullscreen" && pendingFullscreen) {
        // ChatGPT entered fullscreen - now show editing UI
        setPendingFullscreen(false);
        setIsFullscreen(true);
      } else if (currentMode === "inline" && isFullscreen) {
        // ChatGPT closed fullscreen - reset our state
        setIsFullscreen(false);
      }
    };

    // Check frequently for responsive feel
    const interval = setInterval(checkDisplayMode, 100);
    return () => clearInterval(interval);
  }, [isFullscreen, pendingFullscreen]);

  // Use actual fullscreen state (not optimistic)
  const displayMode = isFullscreen ? "fullscreen" : "inline";

  const requestDisplayMode = useCallback(
    async (mode: "inline" | "pip" | "fullscreen") => {
      if (mode === "fullscreen") {
        // Don't set fullscreen yet - wait for ChatGPT to confirm
        setPendingFullscreen(true);
      } else {
        setIsFullscreen(false);
        setPendingFullscreen(false);
      }

      if (!openai?.requestDisplayMode) {
        // Fallback for local dev: just set it directly
        if (mode === "fullscreen") {
          setPendingFullscreen(false);
          setIsFullscreen(true);
        }
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

/**
 * Hook to notify ChatGPT of the widget's intrinsic height
 * Call this when your widget content changes size
 */
export function useNotifyIntrinsicHeight() {
  const openai = useOpenAI();

  return useCallback(
    (height: number) => {
      if (!openai?.notifyIntrinsicHeight) {
        return;
      }
      openai.notifyIntrinsicHeight(height);
    },
    [openai]
  );
}

/**
 * Hook to open external URLs in the user's browser
 * Use this for downloads or external links that can't be handled in the sandbox
 */
export function useOpenExternal() {
  const openai = useOpenAI();

  return useCallback(
    (href: string) => {
      if (!openai?.openExternal) {
        // Fallback: try to open in a new window (may be blocked by sandbox)
        window.open(href, "_blank");
        return;
      }
      openai.openExternal({ href });
    },
    [openai]
  );
}

/**
 * Check if we're running inside the ChatGPT widget sandbox
 */
export function useIsInChatGPT(): boolean {
  const openai = useOpenAI();
  return openai !== undefined;
}
