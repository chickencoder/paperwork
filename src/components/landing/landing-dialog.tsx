"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Upload, Shield, Sparkles, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { savePendingPdf } from "@/lib/storage/persistence";
import { ToolsNavigation } from "./tools-dropdown";

// Transition state interface for cross-page animation coordination
export interface TransitionState {
  fromHomepage: boolean;
  dialogRect: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } | null;
  timestamp: number;
}

// Generate a session ID for the editor URL
// Using 21 characters for better entropy (default nanoid length)
export function generateSessionId(): string {
  return `session-${nanoid(21)}`;
}

// Maximum file size: 100MB
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const MAX_FILE_SIZE_MB = 100;

export function LandingDialog({
  onTransitionStart,
}: {
  onTransitionStart?: () => void;
}) {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogCardRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      // Clear previous errors
      setFileSizeError(null);

      const pdfFiles = Array.from(files).filter(
        (f) => f.type === "application/pdf"
      );

      if (pdfFiles.length === 0) return;

      // Check file size
      const oversizedFiles = pdfFiles.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
      if (oversizedFiles.length > 0) {
        setFileSizeError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      const file = pdfFiles[0];

      try {
        // Generate a new session ID for this editing session
        const sessionId = generateSessionId();

        // Capture dialog position for transition animation
        const rect = dialogCardRef.current?.getBoundingClientRect();
        const transitionState: TransitionState = {
          fromHomepage: true,
          dialogRect: rect
            ? {
                width: rect.width,
                height: rect.height,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2,
              }
            : null,
          timestamp: Date.now(),
        };
        sessionStorage.setItem("transitionState", JSON.stringify(transitionState));

        // Start exit animation
        setIsTransitioning(true);
        onTransitionStart?.();

        const bytes = await file.arrayBuffer();

        // Save to IndexedDB (avoids sessionStorage quota limits for large PDFs)
        await savePendingPdf({
          sessionId,
          name: file.name,
          bytes: new Uint8Array(bytes),
        });

        // Delay navigation to allow exit animation to play
        setTimeout(() => {
          router.push(`/editor/${sessionId}`);
        }, 300);
      } catch (error) {
        console.error("Failed to process PDF:", error);
        setIsTransitioning(false);
      }
    },
    [router, onTransitionStart]
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
        >
          {/* Floating Header Bar */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="fixed top-4 left-0 right-0 z-50 px-6 lg:px-12"
          >
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between bg-popover/90 backdrop-blur-md rounded-full shadow-md shadow-black/5 dark:shadow-black/20 border border-border/60 px-6 py-3">
              {/* Logo */}
              <span
                className="px-2 text-xl sm:text-2xl text-foreground font-medium"
                style={{
                  fontFamily: "'Fraunces', serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Paperwork
              </span>

              {/* Category dropdowns */}
              <ToolsNavigation />
            </div>
          </motion.header>

          {/* A4 Page style dialog */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.25, ease: "easeIn" } }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative z-10 w-full max-w-[500px]"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div
              ref={dialogCardRef}
              className={`
                bg-white rounded-sm shadow-2xl overflow-hidden
                transition-all duration-200 ease-out
                ${isDragOver ? "ring-2 ring-primary ring-offset-2 scale-[1.01]" : ""}
              `}
            >
              <motion.div
                className="flex flex-col gap-8 p-10 sm:p-12"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Header section */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
                    Free PDF Editor
                  </h1>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Edit, sign, highlight, and annotate your documents directly in
                    the browser. Merge multiple files, fill out forms, and redact
                    sensitive information—all without uploading anything to a server.
                  </p>
                </div>

                {/* CTA section */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileInputChange}
                    aria-hidden="true"
                  />
                  <Button
                    size="lg"
                    className="text-base"
                    onClick={handleClick}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isDragOver ? "Drop to open" : "Upload PDF"}
                  </Button>
                  {fileSizeError ? (
                    <p className="text-xs text-red-500 mt-2">{fileSizeError}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">
                      or drag and drop a file anywhere on this page
                    </p>
                  )}
                </div>

                {/* Features section */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                      <Shield className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">100% Private</p>
                      <p className="text-gray-500 text-sm">Your files never leave your device. Everything runs locally.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                      <Sparkles className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">No Watermarks</p>
                      <p className="text-gray-500 text-sm">Export clean, professional documents every time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">No Signup Required</p>
                      <p className="text-gray-500 text-sm">Start editing immediately. No account needed.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
