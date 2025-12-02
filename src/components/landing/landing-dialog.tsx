"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
export function generateSessionId(): string {
  return `session-${nanoid(12)}`;
}

export function LandingDialog({
  onTransitionStart,
}: {
  onTransitionStart?: () => void;
}) {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogCardRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const pdfFiles = Array.from(files).filter(
        (f) => f.type === "application/pdf"
      );

      if (pdfFiles.length === 0) return;

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
        const byteArray = Array.from(new Uint8Array(bytes));

        sessionStorage.setItem(
          "pendingPdf",
          JSON.stringify({
            sessionId,
            name: file.name,
            bytes: byteArray,
          })
        );

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
          {/* Logo - centered at top */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="absolute top-8 text-3xl"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            Paperwork
          </motion.h2>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.25, ease: "easeIn" } }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative z-10 w-full max-w-lg"
          >
            <div
              ref={dialogCardRef}
              className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <motion.div
                className="p-8 sm:p-10"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Primary headline - SEO optimized for "Free PDF editor" */}
                <h1 className="text-3xl sm:text-4xl font-semibold text-center tracking-tight mb-3">
                  Free PDF Editor
                </h1>

                {/* Subheadline */}
                <p className="text-muted-foreground text-center text-sm mb-8">
                  Sign, highlight, annotate, and merge PDFs in your browser.
                  No signup, no watermarks.
                </p>

                {/* Drop Zone */}
                <div
                  onClick={handleClick}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`
                    relative cursor-pointer rounded-xl border-2 border-dashed p-8
                    transition-all duration-200 ease-out
                    ${
                      isDragOver
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10"
                    }
                  `}
                  role="button"
                  tabIndex={0}
                  aria-label="Drop PDF here or click to browse"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClick();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileInputChange}
                    aria-hidden="true"
                  />

                  <motion.div
                    animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <Upload
                      className={`w-5 h-5 ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
                    />

                    <div className="text-center">
                      <p className="font-medium text-foreground text-lg">
                        {isDragOver ? "Release to open" : "Drop your PDFs here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse files
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Privacy note */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                  100% private — your files never leave your device
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
