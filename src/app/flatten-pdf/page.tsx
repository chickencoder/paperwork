"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Shield, Zap } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";

const flattenPdfConfig: ToolLandingConfig = {
  headline: "Flatten PDF",
  description:
    "Merge all layers, form fields, and annotations into a single flat layer. Perfect for finalizing documents, preventing edits, and ensuring consistent printing.",
  buttonText: "Select PDF to Flatten",
  buttonTextDragging: "Drop to flatten",
  tool: "flatten-pdf",
  features: [
    {
      icon: Layers,
      title: "Merge All Layers",
      description: "Combine annotations, forms, and images into one uneditable layer.",
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Flatten your PDF in seconds with no file size limits.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your device. No uploads, no servers.",
    },
  ],
};

export default function FlattenPdfPage() {
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
        config={flattenPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
      />
    </main>
  );
}
