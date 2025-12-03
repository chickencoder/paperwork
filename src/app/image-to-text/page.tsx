"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Copy, Shield } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";

const imageToTextConfig: ToolLandingConfig = {
  headline: "Image to Text",
  description:
    "Extract text from images and scanned documents using advanced OCR technology. Perfect for digitizing printed documents and capturing text from photos.",
  buttonText: "Select File",
  buttonTextDragging: "Drop to extract text",
  tool: "ocr-pdf",
  features: [
    {
      icon: Image,
      title: "Scanned Documents",
      description: "Convert scanned PDFs and photos of documents into editable text.",
    },
    {
      icon: Copy,
      title: "Easy Export",
      description: "Copy extracted text to clipboard or download as a text file.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "All processing happens locally. Your files never leave your device.",
    },
  ],
};

export default function ImageToTextPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative min-h-screen">
      {/* Background image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/lark.png')" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Dark overlay for better contrast */}
      <motion.div
        className="absolute inset-0 bg-black/30"
        initial={{ opacity: 1 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Tool landing dialog */}
      <ToolLandingDialog
        config={imageToTextConfig}
        onTransitionStart={() => setIsTransitioning(true)}
      />
    </main>
  );
}
