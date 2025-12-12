"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FileText, Upload, Download, MousePointer, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface HowToStep {
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface RelatedTool {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface SEOContentProps {
  toolName: string;
  howToSteps: HowToStep[];
  faqs: FAQItem[];
  relatedTools?: RelatedTool[];
}

// Step illustration component - shows a stylized document with the action
function StepIllustration({ stepIndex, title }: { stepIndex: number; title: string }) {
  const icons = [Upload, MousePointer, Download];
  const Icon = icons[stepIndex] || FileText;

  // Different visual states for each step
  const states = [
    { rotation: -3, scale: 0.95, pageCount: 1 }, // Upload - single page arriving
    { rotation: 0, scale: 1, pageCount: 2 },     // Edit - pages being worked on
    { rotation: 3, scale: 0.95, pageCount: 1 },  // Download - finished document
  ];

  const state = states[stepIndex] || states[0];

  return (
    <div className="relative w-full aspect-[4/3] flex items-center justify-center">
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-40"
        style={{
          background: `radial-gradient(ellipse at center, hsl(var(--muted)) 0%, transparent 70%)`,
        }}
      />

      {/* Stacked pages effect */}
      {state.pageCount > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute w-[70%] h-[85%] bg-muted/30 rounded-lg border border-border"
          style={{ transform: 'rotate(-6deg) translateX(-8px)' }}
        />
      )}

      {/* Main document page */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: state.rotation - 5 }}
        whileInView={{ opacity: 1, y: 0, rotate: state.rotation }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
        className="relative w-[70%] h-[85%] bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-2xl overflow-hidden"
        style={{
          transformOrigin: 'center center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Document header bar */}
        <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>

        {/* Document content - stylized lines */}
        <div className="p-4 space-y-3">
          {/* Title line */}
          <div className="h-3 bg-gray-300 rounded-full w-3/4" />

          {/* Content lines */}
          <div className="space-y-2 pt-2">
            <div className="h-2 bg-gray-200 rounded-full w-full" />
            <div className="h-2 bg-gray-200 rounded-full w-5/6" />
            <div className="h-2 bg-gray-200 rounded-full w-4/5" />
          </div>

          {/* Highlighted area for step 2 (editing) */}
          {stepIndex === 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="h-4 bg-amber-300/80 rounded-sm w-2/3 mt-2"
              style={{ transformOrigin: 'left' }}
            />
          )}

          {/* Signature for step 3 */}
          {stepIndex === 2 && (
            <motion.div
              initial={{ opacity: 0, pathLength: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-3 pt-2 border-t border-gray-200"
            >
              <svg viewBox="0 0 100 30" className="w-20 h-6">
                <motion.path
                  d="M5 20 Q 15 5, 30 15 T 55 12 T 80 18 T 95 10"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </svg>
            </motion.div>
          )}
        </div>

        {/* Action icon overlay */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
          className="absolute bottom-3 right-3 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-lg"
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      {/* Floating particles/decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute top-4 right-8 w-3 h-3 bg-muted-foreground/30 rounded-full blur-[1px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 0.4, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute bottom-6 left-6 w-2 h-2 bg-muted-foreground/20 rounded-full blur-[1px]"
      />
    </div>
  );
}

// FAQ Item component with accordion
function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left group"
        aria-expanded={isOpen}
      >
        <div
          className={`
            flex items-start justify-between gap-4 py-6
            border-b border-border transition-colors
            ${isOpen ? "border-transparent" : ""}
          `}
        >
          <h3 className="text-foreground font-medium text-lg pr-4 group-hover:text-primary transition-colors">
            {question}
          </h3>
          <div
            className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isOpen ? "bg-primary text-primary-foreground rotate-0" : "bg-muted text-muted-foreground"}
            `}
          >
            {isOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground leading-relaxed pb-6 pr-12">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SEOContent({
  toolName,
  howToSteps,
  faqs,
  relatedTools,
}: SEOContentProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="relative w-full overflow-hidden bg-background">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">

        {/* Metrics Section - Direct on page, no cards */}
        <section className="mb-16 sm:mb-32">
          <div className="flex justify-center gap-8 sm:gap-16">
            {[
              { label: "Processing", value: "Instant", subtext: "In your browser" },
              { label: "Privacy", value: "100%", subtext: "Files never uploaded" },
              { label: "Cost", value: "Free", subtext: "No limits" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p
                  className="text-2xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-0.5 sm:mb-1"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.subtext}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How-To Section */}
        <section className="mb-24">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 lg:mb-20"
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-5 tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              How to {toolName}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Three simple steps. No account needed.
            </p>
          </motion.div>

          {/* Steps grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {howToSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full bg-muted/30 backdrop-blur-sm rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:bg-muted/50 hover:border-border">
                  {/* Step number - top left */}
                  <div className="absolute top-5 left-5 z-10">
                    <span
                      className="text-[80px] lg:text-[100px] font-bold leading-none text-muted-foreground/10"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* Illustration */}
                  <div className="relative pt-6 px-6">
                    <StepIllustration stepIndex={index} title={step.title} />
                  </div>

                  {/* Content */}
                  <div className="relative p-6 pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-medium text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                      {step.description}
                    </p>
                  </div>

                  {/* Connecting arrow (between cards on desktop) */}
                  {index < howToSteps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section - Homepage style with two columns */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-[1fr,1.5fr] gap-12 lg:gap-16">
              {/* Left side - heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="lg:self-start"
              >
                <h2
                  className="text-3xl sm:text-4xl font-medium text-foreground mb-4"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Questions?
                  <br />
                  We&apos;ve got answers.
                </h2>
                <p className="text-muted-foreground">
                  Everything you need to know about this tool.
                </p>
              </motion.div>

              {/* Right side - accordion */}
              <div>
                {faqs.map((faq, index) => (
                  <FaqItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFaqIndex === index}
                    onToggle={() => handleFaqToggle(index)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Final CTA Section - like homepage */}
      <section className="py-24 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-6"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Start Editing PDFs for Free
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto text-balance">
              No account needed. No software to install. Your files stay private on your device.
            </p>
            <Button asChild size="lg" className="!px-10 !py-6 text-base rounded-full">
              <Link href="/editor" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/**
 * Generate JSON-LD structured data for a tool page
 */
export function generateToolStructuredData({
  toolName,
  toolDescription,
  toolUrl,
  howToSteps,
  faqs,
}: {
  toolName: string;
  toolDescription: string;
  toolUrl: string;
  howToSteps: HowToStep[];
  faqs: FAQItem[];
}) {
  const structuredData = [
    // SoftwareApplication schema
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: `${toolName} - Paperwork`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: toolDescription,
    },
    // HowTo schema
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to ${toolName}`,
      description: toolDescription,
      step: howToSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
    },
    // FAQ schema
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return structuredData;
}
