"use client";

import { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";
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
          className="min-h-screen p-4 bg-background"
        >
          <motion.div
            ref={dropzoneRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`
              h-full min-h-[calc(100vh-2rem)] flex items-center justify-center
              rounded-lg border-2 border-dashed transition-colors duration-200
              ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20"
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
              className="text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
                aria-hidden="true"
              />
              <Button size="lg" className="text-lg !px-12 !py-7" onClick={handleClick}>
                <Upload className="w-5 h-5" />
                {isDragOver ? "Drop to open" : "Upload a PDF"}
              </Button>
              {fileSizeError ? (
                <p className="text-xs text-destructive mt-3">{fileSizeError}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-3">
                  or drag and drop anywhere
                </p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
