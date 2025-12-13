"use client";

import { useState } from "react";
import { Highlighter, Zap, Shield, MessageSquare, PenLine, ScanText } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { HighlightPdfHeroVisual } from "@/components/landing/hero-visuals";

const highlightPdfConfig: ToolLandingConfig = {
  headline: "Highlight PDF",
  description:
    "Highlight text in any PDF document. Choose from multiple colors to mark important passages.",
  buttonText: "Select PDF to Highlight",
  buttonTextDragging: "Drop to highlight",
  features: [
    {
      icon: Highlighter,
      title: "Multiple Colors",
      description: "Yellow, green, blue, pink, and orange highlights.",
    },
    {
      icon: Zap,
      title: "Instant Highlighting",
      description: "Just select text and click to highlight.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your highlights stay on your device.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop the PDF you want to highlight.",
  },
  {
    title: "Select and highlight text",
    description: "Choose a highlight color, then select the text you want to highlight. The highlight is applied instantly.",
  },
  {
    title: "Download highlighted PDF",
    description: "Save and download your PDF with all highlights included.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I highlight text in a PDF?",
    answer: "Upload your PDF, select the highlight tool and choose a color, then click and drag over the text you want to highlight. It's applied instantly.",
  },
  {
    question: "What colors can I use to highlight?",
    answer: "We offer yellow, green, blue, pink, and orange highlight colors. Choose the color that best fits your needs.",
  },
  {
    question: "Can I highlight a scanned PDF?",
    answer: "Highlighting works best on PDFs with selectable text. For scanned documents, use our OCR tool first to make the text selectable.",
  },
  {
    question: "Will the highlights be visible to others?",
    answer: "Yes! Highlights are embedded in the PDF and visible to anyone who opens the document in any PDF viewer.",
  },
  {
    question: "Can I remove highlights?",
    answer: "Yes, you can remove highlights before downloading. Most PDF viewers also allow you to remove or edit highlights in the downloaded file.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Annotate PDF", href: "/annotate-pdf", icon: MessageSquare },
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
  { name: "OCR PDF", href: "/ocr-pdf", icon: ScanText },
];

export default function HighlightPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={highlightPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<HighlightPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Highlight a PDF"
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
