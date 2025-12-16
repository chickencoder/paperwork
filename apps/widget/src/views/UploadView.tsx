import { useState, useCallback, useRef } from "react";
import { Upload, FileText } from "lucide-react";

interface UploadViewProps {
  onFileSelect: (file: File) => void;
}

export function UploadView({ onFileSelect }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find((f) => f.type === "application/pdf");
      if (pdfFile) {
        onFileSelect(pdfFile);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-md p-8 rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 text-center
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className={`
            w-16 h-16 rounded-full flex items-center justify-center
            transition-colors duration-200
            ${isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
          `}
          >
            {isDragging ? (
              <FileText className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isDragging ? "Drop your PDF here" : "Upload a PDF"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop or click to browse
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Supports PDF files up to 100MB
          </div>
        </div>
      </div>
    </div>
  );
}
