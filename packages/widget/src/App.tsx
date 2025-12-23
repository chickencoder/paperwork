import { useEffect, useState, useCallback } from "react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Pencil } from "lucide-react";
import { useTheme, useDisplayMode, useNotifyIntrinsicHeight, useOpenExternal, useIsInChatGPT } from "./hooks/use-openai";
import { EditorEmptyState, PDFEditor } from "@paperwork/editor";

// MCP server URL for PDF downloads
const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || "https://mcp.paperwork.ing";

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-3 right-3 z-50 flex items-center gap-2 px-5 py-2 rounded-full bg-background text-foreground shadow-sm hover:bg-background/80 transition-colors font-medium text-sm border border-border"
    >
      <Pencil className="w-4 h-4" />
      Edit
    </button>
  );
}

// Heights for inline mode
const UPLOAD_SCREEN_HEIGHT = 500;
const EDITOR_INLINE_HEIGHT = 500;

function AppContent() {
  const theme = useTheme();
  const { isFullscreen, requestDisplayMode } = useDisplayMode();
  const [file, setFile] = useState<File | null>(null);
  const notifyIntrinsicHeight = useNotifyIntrinsicHeight();
  const openExternal = useOpenExternal();
  const isInChatGPT = useIsInChatGPT();

  // Editing mode is simply: we're in fullscreen
  // When ChatGPT closes fullscreen, isFullscreen becomes false, and we exit editing mode
  const isEditing = isFullscreen;

  // Custom download handler for ChatGPT widget sandbox
  // Uploads PDF to MCP server and opens download URL externally
  const handleDownload = useCallback(async (pdfBytes: Uint8Array, filename: string) => {
    // Convert bytes to base64
    const base64 = btoa(
      Array.from(pdfBytes)
        .map((byte) => String.fromCharCode(byte))
        .join("")
    );

    // Upload to MCP server
    const response = await fetch(`${MCP_SERVER_URL}/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: base64, filename }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload PDF for download");
    }

    const { downloadUrl } = await response.json();

    // Open the download URL (will trigger browser download)
    openExternal(downloadUrl);
  }, [openExternal]);

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Notify ChatGPT of intrinsic height and apply height constraints
  useEffect(() => {
    const root = document.getElementById("root");

    if (isFullscreen) {
      // Fullscreen: use viewport height
      document.documentElement.style.height = "100vh";
      document.documentElement.style.overflow = "auto";
      document.body.style.height = "100%";
      if (root) root.style.height = "100%";
    } else if (!file) {
      // Upload screen: fixed height, no scroll
      document.documentElement.style.height = `${UPLOAD_SCREEN_HEIGHT}px`;
      document.documentElement.style.overflow = "hidden";
      document.body.style.height = `${UPLOAD_SCREEN_HEIGHT}px`;
      if (root) root.style.height = `${UPLOAD_SCREEN_HEIGHT}px`;
      notifyIntrinsicHeight(UPLOAD_SCREEN_HEIGHT);
    } else {
      // PDF viewer inline: fixed height, no scroll
      document.documentElement.style.height = `${EDITOR_INLINE_HEIGHT}px`;
      document.documentElement.style.overflow = "hidden";
      document.body.style.height = `${EDITOR_INLINE_HEIGHT}px`;
      if (root) root.style.height = `${EDITOR_INLINE_HEIGHT}px`;
      notifyIntrinsicHeight(EDITOR_INLINE_HEIGHT);
    }

    document.body.style.minHeight = "unset";

    return () => {
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
      document.body.style.height = "";
      document.body.style.minHeight = "";
      if (root) root.style.height = "";
    };
  }, [isFullscreen, file, notifyIntrinsicHeight]);

  // Handle edit button click - go fullscreen (which enables editing)
  const handleEditClick = async () => {
    await requestDisplayMode("fullscreen");
  };

  // Show upload view if no file loaded
  if (!file) {
    return <EditorEmptyState onFileSelect={setFile} />;
  }

  // Show editor with optional Edit button
  // Edit button shows when: file is loaded AND not in editing mode
  const showEditButton = !isEditing;

  return (
    <div
      className="overflow-auto"
      style={{ height: isFullscreen ? "100vh" : `${EDITOR_INLINE_HEIGHT}px` }}
    >
      {showEditButton && <EditButton onClick={handleEditClick} />}
      <PDFEditor
        file={file}
        hasTabBar={false}
        disableMicroApps={true}
        hideToolbar={!isEditing}
        onDownload={isInChatGPT ? handleDownload : undefined}
      />
    </div>
  );
}

export function App() {
  return (
    <NuqsAdapter>
      <AppContent />
    </NuqsAdapter>
  );
}
