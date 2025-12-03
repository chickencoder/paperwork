"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Zap, Shield } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";

const pdfToTextConfig: ToolLandingConfig = {
  headline: "PDF to Text",
  description:
    "Convert any PDF to plain text. Extract text from scanned documents, images, and regular PDFs—instantly in your browser.",
  buttonText: "Select PDF to Convert",
  buttonTextDragging: "Drop to convert",
  tool: "ocr-pdf",
  features: [
    {
      icon: FileText,
      title: "Universal Text Extraction",
      description: "Works with scanned documents, photos, and regular PDFs alike.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Copy text to clipboard or download as a .txt file in seconds.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your device. No uploads, no servers.",
    },
  ],
};

export default function PdfToTextPage() {
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
        config={pdfToTextConfig}
        onTransitionStart={() => setIsTransitioning(true)}
      />
    </main>
  );
}
