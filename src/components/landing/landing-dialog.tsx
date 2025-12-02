"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, PenLine, Highlighter, Shield, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingDialog() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const pdfFiles = Array.from(files).filter(
        (f) => f.type === "application/pdf"
      );

      if (pdfFiles.length === 0) return;

      const file = pdfFiles[0];

      try {
        setIsTransitioning(true);

        const bytes = await file.arrayBuffer();
        const byteArray = Array.from(new Uint8Array(bytes));

        sessionStorage.setItem(
          "pendingPdf",
          JSON.stringify({
            name: file.name,
            bytes: byteArray,
          })
        );

        router.push("/editor");
      } catch (error) {
        console.error("Failed to process PDF:", error);
        setIsTransitioning(false);
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

  const features = [
    { icon: PenLine, label: "Sign & annotate" },
    { icon: Highlighter, label: "Highlight & redact" },
    { icon: Layers, label: "Merge PDFs" },
    { icon: Shield, label: "100% private" },
  ];

  return (
    <AnimatePresence>
      {!isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative z-10 w-full max-w-lg"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8 sm:p-10">
                {/* Logo - Fraunces wordmark */}
                <h2
                  className="text-2xl text-center mb-2"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Paperwork
                </h2>

                {/* Primary headline - SEO optimized for "Free PDF editor" */}
                <h1 className="text-3xl sm:text-4xl font-semibold text-center tracking-tight mb-3">
                  Free PDF Editor
                </h1>

                {/* Subheadline */}
                <p className="text-muted-foreground text-center text-lg mb-8">
                  Edit PDFs directly in your browser. No upload, no signup, no
                  watermarks.
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
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
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
                    <div
                      className={`
                        w-14 h-14 rounded-full flex items-center justify-center transition-colors
                        ${isDragOver ? "bg-primary/20" : "bg-muted"}
                      `}
                    >
                      <Upload
                        className={`w-7 h-7 ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>

                    <div className="text-center">
                      <p className="font-medium text-foreground text-lg">
                        {isDragOver ? "Release to open" : "Drop your PDF here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse files
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  {features.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy note below card */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Your files are processed locally and never leave your device.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
