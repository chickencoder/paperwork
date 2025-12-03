"use client";

import { useState } from "react";
import { EyeOff, Shield, Zap, PenLine, Layers, Lock } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { RedactPdfHeroVisual } from "@/components/landing/hero-visuals";

const redactPdfConfig: ToolLandingConfig = {
  headline: "Redact PDF",
  description:
    "Permanently remove sensitive information from PDF documents. Blackout text and images securely.",
  buttonText: "Select PDF to Redact",
  buttonTextDragging: "Drop to redact",
  features: [
    {
      icon: EyeOff,
      title: "Permanent Removal",
      description: "Completely removes content, not just covers it.",
    },
    {
      icon: Shield,
      title: "Secure Redaction",
      description: "Flatten to prevent text extraction.",
    },
    {
      icon: Zap,
      title: "Easy to Use",
      description: "Select content and click to redact.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop the PDF containing sensitive information.",
  },
  {
    title: "Select content to redact",
    description: "Use the redaction tool to select text, images, or areas you want to permanently remove.",
  },
  {
    title: "Apply redactions and download",
    description: "Click apply to permanently remove the selected content, then download your redacted PDF.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "What's the difference between redacting and deleting?",
    answer: "Redaction permanently removes content from the PDF so it cannot be recovered. Simply covering or deleting visible elements may leave underlying data that can be extracted.",
  },
  {
    question: "Is redacted content truly unrecoverable?",
    answer: "Yes. Our redaction tool permanently removes the selected content from the PDF file. The data is completely eliminated, not just hidden.",
  },
  {
    question: "Can I redact images in a PDF?",
    answer: "Yes! You can redact both text and images. Select any area of the document to permanently remove it.",
  },
  {
    question: "Is my document secure during redaction?",
    answer: "Absolutely. All processing happens in your browser—your files never leave your device. This is the most secure way to handle sensitive documents.",
  },
  {
    question: "Can I undo a redaction?",
    answer: "Before downloading, you can undo redactions. Once you download the redacted PDF, the redactions are permanent and cannot be undone—that's the point of secure redaction.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
  { name: "Flatten PDF", href: "/flatten-pdf", icon: Layers },
  { name: "Unlock PDF", href: "/unlock-pdf", icon: Lock },
];

export default function RedactPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={redactPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<RedactPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Redact a PDF"
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
