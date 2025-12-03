"use client";

import { useState } from "react";
import { Scissors, Zap, Shield, Layers, RotateCw, FileArchive } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { SplitPdfHeroVisual } from "@/components/landing/hero-visuals";

const splitPdfConfig: ToolLandingConfig = {
  headline: "Split PDF",
  description:
    "Extract specific pages or split your PDF into multiple files. Fast, free, and private—all processing happens in your browser.",
  buttonText: "Select PDF to Split",
  buttonTextDragging: "Drop to split",
  tool: "split-pdf",
  features: [
    {
      icon: Scissors,
      title: "Extract Any Pages",
      description: "Select specific pages or ranges to extract.",
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Split PDFs in seconds, no upload required.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your device.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop the PDF you want to split.",
  },
  {
    title: "Select pages to extract",
    description: "Choose specific pages, page ranges (e.g., 1-5), or extract every nth page.",
  },
  {
    title: "Download your new PDF",
    description: "Click split and download your extracted pages as a new PDF file.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I split a PDF into multiple files?",
    answer: "Upload your PDF, select the pages you want to extract using page numbers or ranges, and click split. Each extraction creates a new PDF file.",
  },
  {
    question: "Can I extract specific pages from a PDF?",
    answer: "Yes! You can extract individual pages, page ranges (like 1-5, 10-15), or even every nth page from your document.",
  },
  {
    question: "How do I split a PDF into individual pages?",
    answer: "Upload your PDF and extract each page one at a time, or use the 'every 1 page' option to split all pages at once.",
  },
  {
    question: "Is there a limit to how many pages I can split?",
    answer: "No limits! Since all processing happens in your browser, you can split PDFs of any size.",
  },
  {
    question: "Are my files secure when splitting?",
    answer: "Yes, completely. Your files never leave your device—all splitting happens locally in your browser.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Merge PDF", href: "/merge-pdf", icon: Layers },
  { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
];

export default function SplitPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={splitPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<SplitPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Split a PDF"
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
