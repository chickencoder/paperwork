"use client";

import { useState } from "react";
import { Shield, Sparkles, Zap } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { HomepageContent } from "@/components/landing/homepage-content";
import { Footer } from "@/components/landing/footer";
import { HomepageHeroVisual } from "@/components/landing/hero-visuals";

const homepageConfig: ToolLandingConfig = {
  headline: "AI-Powered PDF Editor",
  description: "Edit, sign, and transform your documents with intelligent tools that understand your content. Runs entirely in your browser—your files never leave your device.",
  buttonText: "Open PDF",
  buttonTextDragging: "Drop to open",
  eyebrow: "Free & Private",
  features: [
    { icon: Sparkles, title: "AI-Powered", description: "Smart tools that understand your documents" },
    { icon: Shield, title: "100% Private", description: "Files never leave your device" },
    { icon: Zap, title: "No Signup", description: "Start editing immediately" },
  ],
};

export default function HomePage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={homepageConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<HomepageHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <HomepageContent />
          <Footer />
        </>
      )}
    </main>
  );
}
