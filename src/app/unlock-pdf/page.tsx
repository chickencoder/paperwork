"use client";

import { useState } from "react";
import { Unlock, Shield, Zap, PenLine, Layers, FileArchive } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { UnlockPdfHeroVisual } from "@/components/landing/hero-visuals";

const unlockPdfConfig: ToolLandingConfig = {
  headline: "Unlock PDF",
  description:
    "Remove password protection from your PDF files. Unlock documents to enable printing, copying, and editing—all processed securely in your browser.",
  buttonText: "Select PDF to Unlock",
  buttonTextDragging: "Drop to unlock",
  tool: "unlock-pdf",
  features: [
    {
      icon: Unlock,
      title: "Remove Restrictions",
      description: "Unlock PDFs to enable printing, copying, and editing.",
    },
    {
      icon: Zap,
      title: "Fast & Free",
      description: "Remove passwords instantly with no file size limits.",
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
    description: "Click the button above or drag and drop the password-protected PDF.",
  },
  {
    title: "Enter password if required",
    description: "If the PDF requires a password to open, enter it. Permission-only passwords are removed automatically.",
  },
  {
    title: "Download unlocked PDF",
    description: "Download your PDF with restrictions removed—you can now print, copy, and edit.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "What types of PDF passwords can be removed?",
    answer: "We can remove permission passwords (restrictions on printing, copying, editing). For open passwords (required to view the document), you'll need to enter the password first.",
  },
  {
    question: "Is it legal to unlock a PDF?",
    answer: "Only unlock PDFs you own or have permission to modify. Removing restrictions from others' copyrighted materials may violate copyright laws.",
  },
  {
    question: "Will unlocking change the PDF content?",
    answer: "No. Unlocking only removes restrictions—your document content, formatting, and quality remain exactly the same.",
  },
  {
    question: "Can I unlock a PDF without the password?",
    answer: "Permission-only restrictions (no-print, no-copy, no-edit) can be removed without a password. Open passwords (needed to view) must be entered.",
  },
  {
    question: "Is my PDF secure during unlocking?",
    answer: "Yes. All processing happens in your browser—your files and passwords never leave your device.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
  { name: "Flatten PDF", href: "/flatten-pdf", icon: Layers },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
];

export default function UnlockPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={unlockPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<UnlockPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Unlock a PDF"
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
