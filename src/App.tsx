import { useState, useCallback } from "react";
import { Upload } from "@/components/upload";
import { PDFEditor } from "@/components/editor/pdf-editor";

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
  }, []);

  if (selectedFile) {
    return <PDFEditor file={selectedFile} onReset={handleReset} />;
  }

  return <Upload onFileSelect={handleFileSelect} />;
}
