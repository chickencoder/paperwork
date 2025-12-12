"use client";

import { useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  MousePointer2,
  Type,
  Signature,
  Shapes,
  ZoomOut,
  ZoomIn,
  Undo2,
  Redo2,
  Download,
  Sparkles,
  Star,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  generateSessionId,
  TransitionState,
} from "./tool-landing-dialog";
import { savePendingPdf } from "@/lib/storage/persistence";

function EditorDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-linked scale animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"], // start scaling when top hits viewport bottom, finish when bottom hits viewport bottom
  });

  // Transform scroll progress (0 to 1) to scale (0.9 to 1)
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      style={{ scale }}
      className="relative max-w-5xl mx-auto origin-top"
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-30 blur-3xl -z-10 scale-105"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.2), transparent 70%)",
        }}
      />

      {/* Browser window */}
      <div className="bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/40 border border-border">
        {/* Browser header */}
        <div className="h-10 sm:h-11 bg-muted border-b border-border flex items-center px-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="h-6 sm:h-7 bg-background/80 rounded-md px-3 flex items-center gap-1.5 min-w-[200px] sm:min-w-[280px]">
              <svg className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[10px] sm:text-xs text-muted-foreground/70 truncate">trypaperwork.com</span>
            </div>
          </div>
          <div className="w-[52px]" /> {/* Spacer to balance traffic lights */}
        </div>

        {/* Toolbar - floating pill style like actual editor */}
        <div className="flex justify-center pt-2 sm:pt-3 pb-1 sm:pb-2 bg-muted">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center gap-0.5 bg-popover/90 backdrop-blur-sm rounded-full shadow-lg shadow-black/10 dark:shadow-black/30 border border-border/60 px-1.5 py-1.5"
          >
            {/* Tool buttons */}
            <div className="p-2 rounded-full bg-accent">
              <MousePointer2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-foreground" />
            </div>
            <div className="p-2 rounded-full text-muted-foreground">
              <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="p-2 rounded-full text-muted-foreground">
              <Signature className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="p-2 rounded-full text-muted-foreground">
              <Shapes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Tools button */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-full text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs">Tools</span>
            </div>

            <div className="hidden sm:block w-px h-5 bg-border mx-1" />

            {/* Zoom */}
            <div className="hidden sm:flex items-center gap-0.5">
              <div className="p-2 rounded-full text-muted-foreground">
                <ZoomOut className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-center tabular-nums">100%</span>
              <div className="p-2 rounded-full text-muted-foreground">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="hidden sm:block w-px h-5 bg-border mx-1" />

            {/* Undo/Redo */}
            <div className="hidden sm:flex items-center gap-0.5">
              <div className="p-2 rounded-full text-muted-foreground/50">
                <Undo2 className="w-3.5 h-3.5" />
              </div>
              <div className="p-2 rounded-full text-muted-foreground/50">
                <Redo2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Download */}
            <div className="p-2 rounded-full text-muted-foreground">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </motion.div>
        </div>

        {/* Document area - limited height so page gets cut off */}
        <div className="bg-muted px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 lg:pt-4 pb-0 max-h-[400px] sm:max-h-[480px] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="bg-white rounded-sm shadow-xl max-w-md mx-auto p-6 sm:p-8 aspect-[1/1.4] overflow-hidden"
          >
            {/* Document title */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Service Agreement
            </h3>

            {/* Paragraph 1 */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
              This agreement is entered into as of the date signed below, between the parties identified herein for the provision of consulting services.
            </p>

            {/* Highlighted text */}
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-gray-900 leading-relaxed">
                <span className="bg-amber-300/70 px-0.5">The total compensation shall not exceed $50,000 USD</span> for services rendered during the contract period.
              </p>
            </div>

            {/* Paragraph 2 */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Both parties agree to the terms and conditions set forth in this document and acknowledge receipt of all applicable disclosures.
            </p>

            {/* Signature section */}
            <div className="pt-4 border-t border-gray-200">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-[10px] sm:text-xs text-gray-400 mb-1"
              >
                Signature
              </motion.p>
              <motion.svg
                viewBox="0 0 150 40"
                className="w-28 h-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <motion.path
                  d="M5 30 Q 20 10, 40 25 T 70 20 T 100 28 T 130 15 T 145 25"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                />
              </motion.svg>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function HomepageHero() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
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

        const rect = heroRef.current?.getBoundingClientRect();
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

        const bytes = await file.arrayBuffer();

        await savePendingPdf({
          sessionId,
          name: file.name,
          bytes: new Uint8Array(bytes),
        });

        router.push(`/editor/${sessionId}`);
      } catch (error) {
        console.error("Failed to process PDF:", error);
      }
    },
    [router]
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
    <div
      ref={heroRef}
      className="relative bg-background"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hero Content */}
      <div className="px-6 lg:px-12 pt-30 sm:pt-36 pb-16 sm:pb-20">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Social proof - stars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Loved by <span className="font-medium text-foreground">10,000+</span> users
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground mb-5 tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Free Online PDF Editor
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto text-balance"
          >
            Edit, sign, annotate, merge, and compress PDF files directly in your browser.
            No software to install, no account required. Your files stay private—they never leave your device.
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
                !px-10 !py-6 text-base font-medium rounded-full
                transition-all duration-300
                ${isDragOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]" : ""}
              `}
            >
              <Upload className="w-5 h-5" />
              {isDragOver ? "Drop to open" : "Upload PDF"}
            </Button>
            <p className="text-sm text-muted-foreground/70 mt-3">
              100% free · No signup · Private
            </p>
          </motion.div>
        </div>

        {/* Editor Demo */}
        <EditorDemo />
      </div>
    </div>
  );
}
