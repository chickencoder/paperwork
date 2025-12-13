"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Upload, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { savePendingPdf } from "@/lib/storage/persistence";
import { HomepageNavbar } from "./homepage-navbar";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

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
  tool?: string;
  eyebrow?: string | null; // Custom eyebrow text, null to hide, undefined for default
}

export function ToolLandingDialog({
  config,
  onTransitionStart,
  heroVisual,
}: {
  config: ToolLandingConfig;
  onTransitionStart?: () => void;
  heroVisual?: ReactNode;
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
        const sessionId = generateSessionId();

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

        setIsTransitioning(true);
        onTransitionStart?.();

        const bytes = await file.arrayBuffer();

        await savePendingPdf({
          sessionId,
          name: file.name,
          bytes: new Uint8Array(bytes),
        });

        setTimeout(() => {
          const toolParam = config.tool ? `?tool=${config.tool}` : "";
          router.push(`/editor/${sessionId}${toolParam}`);
        }, 300);
      } catch (error) {
        console.error("Failed to process PDF:", error);
        setIsTransitioning(false);
      }
    },
    [router, onTransitionStart, config.tool]
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

  // Default visual - the lark image
  const defaultVisual = (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
        style={{ backgroundImage: "url('/lark.png')" }}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {!isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-40 bg-background"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Navbar - same as homepage */}
          <HomepageNavbar />

          {/* Main content - Two column hero */}
          <div className="flex items-center">
            <div className="w-full max-w-6xl mx-auto px-6 pt-24 sm:pt-32 pb-8 sm:pb-12">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* Left column - Content */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  ref={dialogCardRef}
                >
                  {/* Eyebrow */}
                  {config.eyebrow !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <span className="inline-block px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground border border-border rounded-full mb-6">
                        {config.eyebrow ?? "Free PDF Tool"}
                      </span>
                    </motion.div>
                  )}

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-medium text-foreground mb-6 tracking-tight leading-[1.1]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {config.headline}
                  </motion.h1>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md"
                  >
                    {config.description}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                  >
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
                      onClick={handleClick}
                      className={`
                        group relative overflow-hidden
                        px-8 py-6 text-base font-medium rounded-full
                        transition-all duration-300
                        ${isDragOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]" : ""}
                      `}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <Upload className="w-5 h-5" />
                        {isDragOver ? (config.buttonTextDragging || "Drop to open") : config.buttonText}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                    <p className="text-sm text-muted-foreground/70 mt-4">
                      100% free · No signup · Private
                    </p>
                  </motion.div>
                </motion.div>

                {/* Right column - Visual */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative"
                >
                  {heroVisual || defaultVisual}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
