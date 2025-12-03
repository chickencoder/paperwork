"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Unlock, Shield, Zap } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";

const unlockPdfConfig: ToolLandingConfig = {
  headline: "Unlock PDF",
  description:
    "Remove password protection from your PDF files. Unlock documents to enable printing, copying, and editing—all processed securely in your browser.",
  buttonText: "Select PDF to Unlock",
  buttonTextDragging: "Drop to unlock",
  tool: "unlock-pdf",
  features: [
    {
      icon: Unlock,
      title: "Remove Restrictions",
      description: "Unlock PDFs to enable printing, copying, and editing.",
    },
    {
      icon: Zap,
      title: "Fast & Free",
      description: "Remove passwords instantly with no file size limits.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your device. No uploads, no servers.",
    },
  ],
};

export default function UnlockPdfPage() {
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
        config={unlockPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
      />
    </main>
  );
}
