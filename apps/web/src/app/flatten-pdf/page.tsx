"use client";

import { useState } from "react";
import { Layers, Shield, Zap, EyeOff, FileArchive, FormInput } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { FlattenPdfHeroVisual } from "@/components/landing/hero-visuals";

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

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop the PDF you want to flatten.",
  },
  {
    title: "Review and flatten",
    description: "Preview your document and click flatten to merge all layers, form fields, and annotations.",
  },
  {
    title: "Download flattened PDF",
    description: "Download your flattened PDF with all content merged into a single, uneditable layer.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "What does flattening a PDF do?",
    answer: "Flattening merges all layers, form fields, annotations, and interactive elements into a single flat layer. The content becomes part of the page and cannot be edited.",
  },
  {
    question: "Why would I flatten a PDF?",
    answer: "Flatten PDFs to finalize documents, prevent future edits, ensure consistent printing, reduce file size, or prepare for archival.",
  },
  {
    question: "Will flattening remove form fields?",
    answer: "Yes, form fields become static content. The filled-in data remains visible but can no longer be edited.",
  },
  {
    question: "Can I undo flattening?",
    answer: "No, flattening is permanent. Keep a copy of your original PDF if you might need to edit it later.",
  },
  {
    question: "Does flattening reduce file size?",
    answer: "Often yes. Removing interactive elements and merging layers can reduce file size, especially for PDFs with many annotations or form fields.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Redact PDF", href: "/redact-pdf", icon: EyeOff },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
  { name: "Fill PDF", href: "/fill-pdf", icon: FormInput },
];

export default function FlattenPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={flattenPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<FlattenPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Flatten a PDF"
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
