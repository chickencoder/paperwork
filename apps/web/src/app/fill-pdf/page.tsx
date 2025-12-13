"use client";

import { useState } from "react";
import { FormInput, PenTool, Shield, PenLine, Layers, FileArchive } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { FillPdfHeroVisual } from "@/components/landing/hero-visuals";

const fillPdfConfig: ToolLandingConfig = {
  headline: "Fill PDF Forms",
  description:
    "Fill out PDF forms online for free. Type into form fields, check boxes, and add signatures—no downloads required.",
  buttonText: "Select PDF to Fill",
  buttonTextDragging: "Drop to fill",
  features: [
    {
      icon: FormInput,
      title: "Smart Form Detection",
      description: "Automatically detects fillable fields.",
    },
    {
      icon: PenTool,
      title: "Add Signatures",
      description: "Sign your completed forms instantly.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your data never leaves your browser.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF form",
    description: "Click the button above or drag and drop your PDF form. Our tool automatically detects fillable fields.",
  },
  {
    title: "Fill in the fields",
    description: "Click on any form field to type your information. Check boxes and select dropdown options as needed.",
  },
  {
    title: "Sign and download",
    description: "Add your signature if required, then download your completed form ready to submit.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I fill out a PDF form?",
    answer: "Upload your PDF form using the button above. Click on any field to type your information, check boxes, or select options. Download when complete.",
  },
  {
    question: "How do I make a PDF fillable?",
    answer: "Our tool works with PDFs that already have form fields. If your PDF doesn't have fillable fields, you can use our Edit PDF tool to add text anywhere on the document.",
  },
  {
    question: "Can I fill and sign a PDF?",
    answer: "Yes! After filling out the form fields, you can add your signature using our built-in signature tool. Draw or type your signature and place it on the document.",
  },
  {
    question: "Will the filled form save my data?",
    answer: "When you download the completed form, all your filled information is embedded in the PDF. Your data is never stored on our servers—everything stays in your browser.",
  },
  {
    question: "Can I fill PDF forms on mobile?",
    answer: "Yes! Our PDF filler works on any device with a web browser, including smartphones and tablets.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
];

export default function FillPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={fillPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<FillPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Fill Out a PDF Form"
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
