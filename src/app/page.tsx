"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LandingDialog } from "@/components/landing/landing-dialog";

export default function LandingPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative min-h-screen bg-background">
      {/* Grid background - fades out during transition */}
      <motion.div
        className="absolute inset-0 bg-grid-pattern"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: isTransitioning ? 0 : 0.4 }}
        transition={{ duration: 0.3 }}
      />

      {/* Noise texture overlay for paper feel */}
      <motion.div
        className="absolute inset-0 bg-noise pointer-events-none"
        initial={{ opacity: 0.03 }}
        animate={{ opacity: isTransitioning ? 0 : 0.03 }}
        transition={{ duration: 0.3 }}
      />

      {/* Background transitions to muted during exit */}
      <motion.div
        className="absolute inset-0 bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Landing dialog overlay */}
      <LandingDialog onTransitionStart={() => setIsTransitioning(true)} />
    </main>
  );
}
