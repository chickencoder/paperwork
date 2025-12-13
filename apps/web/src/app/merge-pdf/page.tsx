"use client";

import { useState } from "react";
import { Layers, ArrowUpDown, Shield, Scissors, FileArchive, RotateCw } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { MergePdfHeroVisual } from "@/components/landing/hero-visuals";

const mergePdfConfig: ToolLandingConfig = {
  headline: "Merge PDF",
  description:
    "Combine multiple PDF files into one document. Drag, drop, and merge—free and completely private.",
  buttonText: "Select PDFs to Merge",
  buttonTextDragging: "Drop to merge",
  features: [
    {
      icon: Layers,
      title: "Combine Any PDFs",
      description: "Merge unlimited PDF files into one document.",
    },
    {
      icon: ArrowUpDown,
      title: "Reorder Pages",
      description: "Arrange your files in any order before merging.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your browser.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF files",
    description: "Click the button above or drag and drop your PDF files onto the page. You can select multiple files at once.",
  },
  {
    title: "Arrange the order",
    description: "Once uploaded, arrange your PDFs in the order you want them to appear in the final merged document.",
  },
  {
    title: "Merge and download",
    description: "Click merge to combine all PDFs into a single document. Your merged PDF will download automatically.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I combine PDF files into one?",
    answer: "Simply upload your PDF files using the button above, arrange them in your preferred order, and click merge. The combined PDF will download automatically to your device.",
  },
  {
    question: "Is there a limit to how many PDFs I can merge?",
    answer: "No, you can merge as many PDF files as you need. All processing happens in your browser, so there are no server-side limits.",
  },
  {
    question: "Are my files secure when merging PDFs?",
    answer: "Yes, completely. Your files never leave your device. All PDF processing happens locally in your browser—we don't upload anything to any server.",
  },
  {
    question: "Can I merge PDFs on my phone or tablet?",
    answer: "Yes! Our PDF merger works on any device with a modern web browser, including smartphones and tablets.",
  },
  {
    question: "Will merging affect the quality of my PDFs?",
    answer: "No, the merge process preserves the original quality of all your documents. Text, images, and formatting remain unchanged.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Split PDF", href: "/split-pdf", icon: Scissors },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
  { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
];

export default function MergePdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={mergePdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<MergePdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Merge PDFs"
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
