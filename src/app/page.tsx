"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LandingDialog } from "@/components/landing/landing-dialog";

export default function LandingPage() {
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

      {/* Landing dialog overlay */}
      <LandingDialog onTransitionStart={() => setIsTransitioning(true)} />
    </main>
  );
}
