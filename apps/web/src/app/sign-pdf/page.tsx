"use client";

import { useState } from "react";
import { PenTool, Type, Shield, PenLine, FormInput, FileArchive } from "lucide-react";
import { ToolLandingDialog, type ToolLandingConfig } from "@/components/landing/tool-landing-dialog";
import { SEOContent, type HowToStep, type FAQItem, type RelatedTool } from "@/components/landing/seo-content";
import { Footer } from "@/components/landing/footer";
import { SignPdfHeroVisual } from "@/components/landing/hero-visuals";

const signPdfConfig: ToolLandingConfig = {
  headline: "Sign PDF",
  description:
    "Add your signature to any PDF document. Draw, type, or upload your signature—free and completely private.",
  buttonText: "Select PDF to Sign",
  buttonTextDragging: "Drop to sign",
  features: [
    {
      icon: PenTool,
      title: "Draw Your Signature",
      description: "Use your mouse or touchscreen to sign naturally.",
    },
    {
      icon: Type,
      title: "Type Your Name",
      description: "Create a signature from typed text.",
    },
    {
      icon: Shield,
      title: "Legally Valid",
      description: "Electronic signatures accepted worldwide.",
    },
  ],
};

const howToSteps: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Click the button above or drag and drop your PDF document that needs to be signed.",
  },
  {
    title: "Create your signature",
    description: "Draw your signature using your mouse or touchscreen, or type your name to generate a signature.",
  },
  {
    title: "Place and download",
    description: "Click where you want your signature to appear, resize if needed, then download your signed PDF.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "How do I sign a PDF online?",
    answer: "Upload your PDF, create your signature by drawing or typing, then click anywhere on the document to place it. Download your signed PDF when you're done.",
  },
  {
    question: "Is an electronic signature legally valid?",
    answer: "Yes, electronic signatures are legally binding in most countries, including the US (ESIGN Act), EU (eIDAS), and many others. They're accepted for most business and personal documents.",
  },
  {
    question: "How do I digitally sign a PDF?",
    answer: "Our tool creates electronic signatures that you can place on any PDF. Simply draw your signature or type your name, position it on the document, and download.",
  },
  {
    question: "Can I sign a PDF on my phone?",
    answer: "Yes! Our signature tool works on any device. You can draw your signature using your finger on a touchscreen.",
  },
  {
    question: "Is my signature secure?",
    answer: "Absolutely. Your signature and documents never leave your device. All processing happens locally in your browser—we don't upload or store anything.",
  },
];

const relatedTools: RelatedTool[] = [
  { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
  { name: "Fill PDF Forms", href: "/fill-pdf", icon: FormInput },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
];

export default function SignPdfPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <main className="relative">
      <ToolLandingDialog
        config={signPdfConfig}
        onTransitionStart={() => setIsTransitioning(true)}
        heroVisual={<SignPdfHeroVisual />}
      />

      {!isTransitioning && (
        <>
          <SEOContent
            toolName="Sign a PDF"
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
