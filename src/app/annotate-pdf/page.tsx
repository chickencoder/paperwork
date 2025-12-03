"use client";

import { useState } from "react";
import { Highlighter, MessageSquare, Shield, PenLine, PenTool, EyeOff } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { AnnotatePdfHeroVisual } from "@/components/landing/hero-visuals";

const annotatePdfConfig: ToolLandingConfig = {
  headline: "Annotate PDF",
  description:
    "Mark up PDF documents with highlights, notes, and drawings. Perfect for reviewing documents and collaboration.",
  buttonText: "Select PDF to Annotate",
  buttonTextDragging: "Drop to annotate",
  features: [
    {
      icon: Highlighter,
      title: "Highlight Text",
      description: "Mark important passages in multiple colors.",
    },
    {
      icon: MessageSquare,
      title: "Add Notes",
      description: "Insert comments and annotations anywhere.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your annotations stay on your device.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop the PDF you want to annotate.",
  },
  {
    title: "Add your annotations",
    description: "Use the annotation tools to highlight text, add notes, draw shapes, or insert comments.",
  },
  {
    title: "Download annotated PDF",
    description: "Save your annotated document and download it with all your markups included.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I annotate a PDF?",
    answer: "Upload your PDF, then use the annotation tools to highlight text, add notes, draw on the document, or insert comments. Download when finished.",
  },
  {
    question: "Can I add notes to a PDF?",
    answer: "Yes! You can add sticky notes and comments anywhere on the document. Click where you want the note and start typing.",
  },
  {
    question: "What annotation tools are available?",
    answer: "You can highlight text in multiple colors, add sticky notes, draw freehand, insert shapes, and add text comments.",
  },
  {
    question: "Will recipients see my annotations?",
    answer: "Yes, all annotations are embedded in the PDF. Anyone who opens the document will see your highlights, notes, and other markups.",
  },
  {
    question: "Can I remove annotations later?",
    answer: "Before downloading, you can edit or remove any annotation. Most PDF viewers also allow editing annotations in the downloaded file.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Highlight PDF", href: "/highlight-pdf", icon: Highlighter },
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
  { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
];

export default function AnnotatePdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={annotatePdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<AnnotatePdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Annotate a PDF"
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
