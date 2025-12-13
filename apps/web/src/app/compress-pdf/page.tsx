"use client";

import { useState } from "react";
import { Minimize2, Shield, Zap, Layers, PenLine, Scissors } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { CompressPdfHeroVisual } from "@/components/landing/hero-visuals";

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

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop the PDF file you want to compress.",
  },
  {
    title: "Choose compression level",
    description: "Select from Web (maximum compression), Standard (balanced), or Print (best quality) presets.",
  },
  {
    title: "Download compressed PDF",
    description: "Click compress and your smaller PDF will download automatically. Check the file size reduction!",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I compress a PDF file?",
    answer: "Upload your PDF using the button above, choose your preferred compression level, and click compress. Your smaller PDF will download automatically.",
  },
  {
    question: "Will compression affect my PDF quality?",
    answer: "Our compression optimizes images and removes unnecessary data while preserving text clarity. The 'Print' preset maintains the highest quality, while 'Web' achieves maximum compression.",
  },
  {
    question: "How much can I reduce my PDF file size?",
    answer: "Depending on the content, you can reduce file sizes by up to 90%. PDFs with many images see the biggest reductions.",
  },
  {
    question: "Is there a file size limit?",
    answer: "No server-side limits since everything processes in your browser. Very large files may take longer to process depending on your device.",
  },
  {
    question: "Is my PDF secure during compression?",
    answer: "Yes, completely. Your files never leave your device—all compression happens locally in your browser. We don't upload or store anything.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Merge PDF", href: "/merge-pdf", icon: Layers },
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
  { name: "Split PDF", href: "/split-pdf", icon: Scissors },
];

export default function CompressPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={compressPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<CompressPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Compress a PDF"
            howToSteps={howToSteps}
            faqs={faqs}
            relatedTools={relatedTools}
          />
          <Footer />
        </>
      )}
    </main>
  );
}
