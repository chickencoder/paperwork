import { useEffect, useState, useRef } from "react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Pencil } from "lucide-react";
import { useTheme, useDisplayMode, useMaxHeight, useSendFollowUpMessage } from "./hooks/use-openai";
import { usePDFMetadata } from "./hooks/use-pdf-metadata";
import { EditorEmptyState, PDFEditor } from "@paperwork/editor";

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

function AppContent() {
  const theme = useTheme();
  const { isFullscreen, requestDisplayMode } = useDisplayMode();
  const maxHeight = useMaxHeight();
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { summary } = usePDFMetadata(file);
  const sendFollowUp = useSendFollowUpMessage();
  const metadataSentRef = useRef(false);

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Send metadata to ChatGPT when PDF is loaded
  useEffect(() => {
    if (summary && !metadataSentRef.current) {
      metadataSentRef.current = true;
      sendFollowUp(summary);
    }
  }, [summary, sendFollowUp]);

  // Reset state when file changes
  useEffect(() => {
    if (!file) {
      metadataSentRef.current = false;
      setIsEditing(false);
    }
  }, [file]);

  // Exit editing mode when leaving fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setIsEditing(false);
    }
  }, [isFullscreen]);

  // Apply height constraint to html element so window scrolling works correctly
  useEffect(() => {
    const inlineMaxHeight = 500;
    const height = isFullscreen
      ? "100vh"
      : `${Math.min(maxHeight ?? inlineMaxHeight, inlineMaxHeight)}px`;
    document.documentElement.style.height = height;
    document.documentElement.style.overflow = "auto";
    document.body.style.height = "100%";
    document.body.style.minHeight = "unset";

    return () => {
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
      document.body.style.height = "";
      document.body.style.minHeight = "";
    };
  }, [isFullscreen, maxHeight]);

  // Handle edit button click - go fullscreen and enable editing
  const handleEditClick = async () => {
    setIsEditing(true);
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
    <>
      {showEditButton && <EditButton onClick={handleEditClick} />}
      <PDFEditor
        file={file}
        hasTabBar={false}
        disableMicroApps={true}
        hideToolbar={!isEditing}
      />
    </>
  );
}

export function App() {
  return (
    <NuqsAdapter>
      <AppContent />
    </NuqsAdapter>
  );
}
