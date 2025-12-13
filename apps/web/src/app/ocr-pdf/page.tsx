"use client";

import { useState } from "react";
import { ScanText, Globe, Shield, Highlighter, PenLine, FileText } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { OcrPdfHeroVisual } from "@/components/landing/hero-visuals";

const ocrPdfConfig: ToolLandingConfig = {
  headline: "OCR PDF",
  description:
    "Extract text from scanned PDFs and images using optical character recognition. Works entirely in your browser—no uploads, complete privacy.",
  buttonText: "Select PDF to OCR",
  buttonTextDragging: "Drop to extract text",
  tool: "ocr-pdf",
  features: [
    {
      icon: ScanText,
      title: "Scanned Document Support",
      description: "Extract text from scanned documents, photos, and image-based PDFs.",
    },
    {
      icon: Globe,
      title: "Multiple Languages",
      description: "Recognize text in English and many other languages with high accuracy.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your files never leave your device. All processing happens locally.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your scanned PDF",
    description: "Click the button above or drag and drop the scanned PDF or image you want to OCR.",
  },
  {
    title: "Process with OCR",
    description: "Our OCR engine analyzes the document and recognizes all text, even from scanned images.",
  },
  {
    title: "Copy or download text",
    description: "Copy the extracted text to your clipboard or download it as a text file.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "What is OCR?",
    answer: "OCR (Optical Character Recognition) is technology that converts images of text into machine-readable text. It allows you to extract and edit text from scanned documents and photos.",
  },
  {
    question: "Can OCR extract text from any PDF?",
    answer: "OCR works best on scanned documents and image-based PDFs. If your PDF already has selectable text, you can copy it directly without OCR.",
  },
  {
    question: "What languages does the OCR support?",
    answer: "Our OCR engine supports English and many other languages with high accuracy. The engine automatically detects the language in most cases.",
  },
  {
    question: "How accurate is the OCR?",
    answer: "Accuracy depends on image quality. Clear, high-resolution scans achieve near-perfect accuracy. Lower quality images may have some errors that need manual correction.",
  },
  {
    question: "Is my document secure during OCR?",
    answer: "Yes. All OCR processing happens in your browser—your documents never leave your device. This is the most secure way to OCR sensitive documents.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "PDF to Text", href: "/pdf-to-text", icon: FileText },
  { name: "Highlight PDF", href: "/highlight-pdf", icon: Highlighter },
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
];

export default function OcrPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={ocrPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<OcrPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="OCR a PDF"
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
