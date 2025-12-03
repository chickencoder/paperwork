"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minimize2, Shield, Zap } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";

const compressPdfConfig: ToolLandingConfig = {
  headline: "Compress PDF",
  description:
    "Reduce your PDF file size without losing quality. Perfect for email attachments, faster uploads, and saving storage space—all processed entirely in your browser.",
  buttonText: "Select PDF to Compress",
  buttonTextDragging: "Drop to compress",
  tool: "compress-pdf",
  features: [
    {
      icon: Minimize2,
      title: "Reduce File Size",
      description: "Shrink large PDFs by up to 90% while maintaining readability.",
    },
    {
      icon: Zap,
      title: "Fast & Free",
      description: "Compress PDFs instantly with no file size limits or hidden fees.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your device. No uploads, no servers.",
    },
  ],
};

export default function CompressPdfPage() {
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
        config={compressPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
      />
    </main>
  );
}
