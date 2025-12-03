"use client";

import { useState } from "react";
import { PenLine, Zap, Shield, PenTool, Layers, Highlighter } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { EditPdfHeroVisual } from "@/components/landing/hero-visuals";

const editPdfConfig: ToolLandingConfig = {
  headline: "Edit PDF",
  description:
    "Edit PDF files online for free. Add text, images, signatures, highlights, and more—no software to install.",
  buttonText: "Select PDF to Edit",
  buttonTextDragging: "Drop to edit",
  features: [
    {
      icon: PenLine,
      title: "Full Editing Tools",
      description: "Add text, annotations, signatures, and more.",
    },
    {
      icon: Zap,
      title: "Fast & Free",
      description: "No signup, no watermarks, no limits.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Everything happens in your browser.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop your PDF file onto the page to open it in the editor.",
  },
  {
    title: "Make your edits",
    description: "Use the toolbar to add text, signatures, highlights, annotations, or fill out form fields. All changes are visible in real-time.",
  },
  {
    title: "Download your edited PDF",
    description: "When you're done, click download to save your edited PDF. All changes are embedded in the file.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I edit a PDF for free?",
    answer: "Upload your PDF using the button above, make your edits using our toolbar (add text, signatures, highlights, etc.), and download the edited file. It's completely free with no watermarks.",
  },
  {
    question: "Can I add text to a PDF?",
    answer: "Yes! Click anywhere on the PDF to add a text box. You can customize the font, size, and color of your text.",
  },
  {
    question: "How do I edit a PDF on Mac?",
    answer: "Our PDF editor works in any web browser on Mac. Simply visit this page, upload your PDF, and start editing. No software download required.",
  },
  {
    question: "Can I edit a PDF without Adobe Acrobat?",
    answer: "Absolutely. Our free online PDF editor provides all the essential editing features without needing Adobe Acrobat or any other paid software.",
  },
  {
    question: "Are my PDF files secure?",
    answer: "Yes, completely. Your files never leave your device—all editing happens locally in your browser. We don't upload or store any of your documents.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
  { name: "Merge PDF", href: "/merge-pdf", icon: Layers },
  { name: "Highlight PDF", href: "/highlight-pdf", icon: Highlighter },
];

export default function EditPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      {/* Hero section */}
      <ToolLandingDialog
        config={editPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<EditPdfHeroVisual />}
      />

      {/* SEO Content below the fold */}
      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Edit a PDF"
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
