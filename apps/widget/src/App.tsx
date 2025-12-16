import { useEffect, useState } from "react";
import { useTheme } from "./hooks/use-openai";
import { UploadView } from "./views/UploadView";
import { EditorView } from "./views/EditorView";

interface AppState {
  pdfData: Uint8Array | null;
  fileName: string | null;
}

export function App() {
  const theme = useTheme();
  const [state, setState] = useState<AppState>({
    pdfData: null,
    fileName: null,
  });

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Handle file selection from upload view
  const handleFileSelect = async (file: File) => {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);

    setState({
      pdfData,
      fileName: file.name,
    });
  };

  // Handle going back to upload view
  const handleBack = () => {
    setState({
      pdfData: null,
      fileName: null,
    });
  };

  // Show upload view if no PDF loaded
  if (!state.pdfData) {
    return <UploadView onFileSelect={handleFileSelect} />;
  }

  // Show editor view with full capabilities
  return (
    <EditorView
      pdfData={state.pdfData}
      fileName={state.fileName}
      onBack={handleBack}
    />
  );
}
