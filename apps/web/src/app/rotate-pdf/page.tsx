"use client";

import { useState } from "react";
import { RotateCw, Files, Shield, Scissors, Layers, FileArchive } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { RotatePdfHeroVisual } from "@/components/landing/hero-visuals";

const rotatePdfConfig: ToolLandingConfig = {
  headline: "Rotate PDF",
  description:
    "Rotate PDF pages 90°, 180°, or 270°. Fix upside-down scans or change orientation instantly—all in your browser.",
  buttonText: "Select PDF to Rotate",
  buttonTextDragging: "Drop to rotate",
  tool: "rotate-pdf",
  features: [
    {
      icon: RotateCw,
      title: "Any Angle",
      description: "Rotate pages 90°, 180°, or 270° clockwise.",
    },
    {
      icon: Files,
      title: "All or Select Pages",
      description: "Rotate the entire document or specific pages.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files stay on your device.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop the PDF you want to rotate.",
  },
  {
    title: "Choose rotation angle",
    description: "Select 90°, 180°, or 270° clockwise rotation. Apply to all pages or select specific pages.",
  },
  {
    title: "Download rotated PDF",
    description: "Click rotate and download your correctly oriented PDF file.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I rotate a PDF and save it?",
    answer: "Upload your PDF, select the rotation angle (90°, 180°, or 270°), click rotate, and download. The rotated PDF is automatically saved when you download.",
  },
  {
    question: "Can I rotate just one page in a PDF?",
    answer: "Yes! You can select specific pages to rotate while leaving other pages unchanged. Perfect for fixing individual upside-down scans.",
  },
  {
    question: "How do I rotate a PDF from portrait to landscape?",
    answer: "Use a 90° or 270° rotation to switch between portrait and landscape orientation. The direction depends on which way your content faces.",
  },
  {
    question: "Can I rotate a scanned PDF?",
    answer: "Absolutely! Our tool works with all PDFs including scanned documents. Just upload, rotate, and download.",
  },
  {
    question: "Is rotating a PDF free?",
    answer: "Yes, completely free with no limits. All processing happens in your browser—no signup or payment required.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Split PDF", href: "/split-pdf", icon: Scissors },
  { name: "Merge PDF", href: "/merge-pdf", icon: Layers },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
];

export default function RotatePdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={rotatePdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<RotatePdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Rotate a PDF"
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
