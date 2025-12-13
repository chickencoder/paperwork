"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Is this PDF editor really free to use?",
    answer:
      "Yes, Paperwork is 100% free with no hidden costs, premium tiers, or watermarks. Edit unlimited PDFs without any restrictions or subscriptions.",
  },
  {
    question: "Is it safe to edit PDFs online?",
    answer:
      "Absolutely. Unlike other online PDF editors, Paperwork processes everything locally in your browser. Your files never leave your device and are never uploaded to any server, ensuring complete privacy and security.",
  },
  {
    question: "Do I need to create an account or sign up?",
    answer:
      "No registration required. Start editing PDFs immediately—just upload your file and begin. No email, no account, no hassle.",
  },
  {
    question: "What can I do with this PDF editor?",
    answer:
      "Edit text and images, add electronic signatures, fill out forms, highlight and annotate, merge multiple PDFs, split pages, compress file size, rotate pages, redact sensitive information, and extract text with OCR.",
  },
  {
    question: "Does it work on Mac, Windows, and mobile devices?",
    answer:
      "Yes, Paperwork works on any device with a modern web browser—Mac, Windows, Linux, iPhone, iPad, and Android. No software installation needed.",
  },
  {
    question: "How do I download my edited PDF?",
    answer:
      "Click the download button in the toolbar when you're done editing. You can choose to flatten the document (permanently apply all changes) or keep annotations editable.",
  },
];

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

export function HomepageFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 lg:px-12">
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
              Everything you need to know about editing PDFs with Paperwork.
            </p>
          </motion.div>

          {/* Right side - accordion */}
          <div>
            {faqs.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
