"use client";

import { useState, useCallback, useRef } from "react";
import { FileUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@paperwork/ui/button";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const MAX_FILE_SIZE_MB = 100;

interface EditorEmptyStateProps {
  /** When provided, bypasses default navigation and calls this callback instead */
  onFileSelect?: (file: File) => void;
  /** Maximum file size in megabytes (default: 100) */
  maxFileSizeMB?: number;
}

export function EditorEmptyState({
  onFileSelect,
  maxFileSizeMB = MAX_FILE_SIZE_MB,
}: EditorEmptyStateProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setFileSizeError(null);

      const pdfFiles = Array.from(files).filter(
        (f) => f.type === "application/pdf"
      );

      if (pdfFiles.length === 0) return;

      const oversizedFiles = pdfFiles.filter((f) => f.size > maxFileSizeBytes);
      if (oversizedFiles.length > 0) {
        setFileSizeError(`File is too large. Maximum size is ${maxFileSizeMB}MB.`);
        return;
      }

      const file = pdfFiles[0];

      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [onFileSelect, maxFileSizeBytes, maxFileSizeMB]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  return (
    <AnimatePresence>
      {!isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full p-4 bg-background"
        >
          <motion.div
            ref={dropzoneRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={handleClick}
            className={`
              h-full flex flex-col items-center justify-center
              rounded-xl border-2 border-dashed cursor-pointer
              transition-all duration-200 ease-out
              ${
                isDragOver
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50"
              }
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col items-center gap-4 px-6 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
                aria-hidden="true"
              />

              {/* Upload icon */}
              <motion.div
                animate={isDragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`
                  p-4 rounded-2xl transition-colors duration-200
                  ${isDragOver ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
                `}
              >
                <FileUp className="w-10 h-10" strokeWidth={1.5} />
              </motion.div>

              {/* Title and description */}
              <div className="space-y-1.5">
                <h3 className={`text-lg font-medium transition-colors duration-200 ${isDragOver ? "text-primary" : "text-foreground"}`}>
                  {isDragOver ? "Drop your PDF here" : "Drop PDF here"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  or click anywhere to browse
                </p>
              </div>

              {/* Upload button */}
              <Button
                size="lg"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <FileUp className="w-4 h-4" />
                Choose file
              </Button>

              {/* Error or file size info */}
              {fileSizeError ? (
                <p className="text-xs text-destructive mt-1">{fileSizeError}</p>
              ) : (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  PDF files up to {maxFileSizeMB}MB
                </p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
