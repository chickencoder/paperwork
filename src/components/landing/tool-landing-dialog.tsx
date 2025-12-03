"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { savePendingPdf } from "@/lib/storage/persistence";
import type { LucideIcon } from "lucide-react";

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

export interface ToolFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ToolLandingConfig {
  headline: string;
  description: string;
  buttonText: string;
  buttonTextDragging?: string;
  features: ToolFeature[];
  tool?: string; // Tool query param to pass to the editor
}

export function ToolLandingDialog({
  config,
  onTransitionStart,
}: {
  config: ToolLandingConfig;
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

        // Save to IndexedDB (avoids sessionStorage quota limits for large PDFs)
        await savePendingPdf({
          sessionId,
          name: file.name,
          bytes: new Uint8Array(bytes),
        });

        // Delay navigation to allow exit animation to play
        setTimeout(() => {
          const toolParam = config.tool ? `?tool=${config.tool}` : "";
          router.push(`/editor/${sessionId}${toolParam}`);
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
            className="absolute top-8 text-3xl text-white font-medium"
            style={{
              fontFamily: "'Fraunces', serif",
              letterSpacing: "-0.02em",
            }}
          >
            Paperwork
          </motion.h2>

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
              style={{
                aspectRatio: "1 / 1.2",
              }}
            >
              <motion.div
                className="h-full flex flex-col justify-between p-10 sm:p-12"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Header section */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
                    {config.headline}
                  </h1>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {config.description}
                  </p>
                </div>

                {/* CTA section */}
                <div className="-mt-6 -mb-4">
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
                    {isDragOver ? (config.buttonTextDragging || "Drop to open") : config.buttonText}
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    or drag and drop a file anywhere on this page
                  </p>
                </div>

                {/* Features section */}
                <div className="space-y-4">
                  {config.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                        <feature.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{feature.title}</p>
                        <p className="text-gray-500 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
