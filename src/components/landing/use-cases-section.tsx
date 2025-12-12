"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Receipt,
  FileCheck,
  BookOpen,
  User,
  Ticket,
  Check,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UseCase {
  id: string;
  label: string;
  icon: LucideIcon;
  headline: string;
  description: string;
  benefits: string[];
  ctaText: string;
  ctaHref: string;
}

const useCases: UseCase[] = [
  {
    id: "contracts",
    label: "Contracts",
    icon: FileText,
    headline: "Sign contracts and agreements in seconds",
    description:
      "Close deals faster with legally binding electronic signatures. Highlight important clauses, redact confidential information, and share secure PDFs—all without printing a single page.",
    benefits: [
      "Draw, type, or upload your signature for instant e-signing",
      "Highlight key terms so nothing gets overlooked",
      "Redact sensitive clauses before sharing externally",
      "Flatten documents to lock in all changes permanently",
    ],
    ctaText: "Sign a Contract",
    ctaHref: "/editor",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: Receipt,
    headline: "Create and manage invoices effortlessly",
    description:
      "Fill in payment details, add your company logo or stamp, and compress files for easy email delivery. Keep your billing workflow paperless and professional.",
    benefits: [
      "Fill in client details and payment terms directly",
      "Add your business stamp or signature for authenticity",
      "Compress large invoices for faster email delivery",
      "Merge multiple invoices into a single document",
    ],
    ctaText: "Edit an Invoice",
    ctaHref: "/editor",
  },
  {
    id: "tax-forms",
    label: "Tax Forms",
    icon: FileCheck,
    headline: "Complete tax forms and government documents",
    description:
      "Fill out W-9s, 1099s, and other official forms digitally. Extract data from scanned documents with OCR, and rest easy knowing your sensitive financial data never leaves your device.",
    benefits: [
      "Fill out any PDF form field digitally—no printing required",
      "Extract text from scanned forms using built-in OCR",
      "Your data stays private—processed locally in your browser",
      "Save completed forms instantly to your device",
    ],
    ctaText: "Fill a Tax Form",
    ctaHref: "/editor",
  },
  {
    id: "ebooks",
    label: "E-books",
    icon: BookOpen,
    headline: "Annotate e-books and study materials",
    description:
      "Highlight key passages, add margin notes, and bookmark important pages. Perfect for students, researchers, and anyone who wants to engage deeply with digital reading material.",
    benefits: [
      "Highlight text in multiple colors for easy reference",
      "Add sticky notes and margin annotations",
      "Merge chapters or excerpts into custom study guides",
      "Extract quotes and passages as plain text",
    ],
    ctaText: "Annotate an E-book",
    ctaHref: "/editor",
  },
  {
    id: "resumes",
    label: "Resumes",
    icon: User,
    headline: "Polish and update your resume instantly",
    description:
      "Make last-minute edits to your CV, remove hidden metadata before sending to recruiters, and flatten the document to ensure your formatting stays perfect on any device.",
    benefits: [
      "Edit text directly to update job titles and dates",
      "Remove metadata that could reveal editing history",
      "Flatten to prevent recruiters from making changes",
      "Compress file size for applicant tracking systems",
    ],
    ctaText: "Edit Your Resume",
    ctaHref: "/editor",
  },
  {
    id: "tickets",
    label: "Tickets",
    icon: Ticket,
    headline: "Manage tickets and boarding passes",
    description:
      "Rotate incorrectly scanned tickets, compress for mobile wallets, and extract event details to add to your calendar. Never fumble at the gate again.",
    benefits: [
      "Rotate pages scanned sideways or upside down",
      "Compress files for faster loading on mobile",
      "Extract event details with OCR for calendar entries",
      "Merge multiple tickets into one convenient document",
    ],
    ctaText: "Fix a Ticket",
    ctaHref: "/editor",
  },
];

// Dummy PDF Document Components
function ContractDocument() {
  return (
    <div className="bg-white rounded-sm shadow-lg p-6 sm:p-8 aspect-[1/1.3] overflow-hidden text-left">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
        Service Agreement
      </h3>
      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed mb-3">
        This agreement is entered into as of the date signed below, between the
        parties identified herein for the provision of consulting services.
      </p>
      <p className="text-[10px] sm:text-xs text-gray-900 leading-relaxed mb-3">
        <span className="bg-amber-300/70 px-0.5">
          The total compensation shall not exceed $50,000 USD
        </span>{" "}
        for services rendered during the contract period.
      </p>
      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed mb-4">
        Both parties agree to the terms and conditions set forth in this
        document.
      </p>
      <div className="pt-3 border-t border-gray-200">
        <p className="text-[8px] sm:text-[10px] text-gray-400 mb-1">Signature</p>
        <svg viewBox="0 0 150 40" className="w-24 h-6">
          <path
            d="M5 30 Q 20 10, 40 25 T 70 20 T 100 28 T 130 15 T 145 25"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

function InvoiceDocument() {
  return (
    <div className="bg-white rounded-sm shadow-lg p-6 sm:p-8 aspect-[1/1.3] overflow-hidden text-left">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="w-16 h-6 bg-gray-200 rounded mb-1" />
          <p className="text-[8px] text-gray-400">Your Company</p>
        </div>
        <div className="text-right">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            INVOICE
          </h3>
          <p className="text-[10px] text-gray-500">#INV-2024-001</p>
        </div>
      </div>
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-[10px] sm:text-xs border-b border-gray-100 pb-1">
          <span className="text-gray-600">Consulting services</span>
          <span className="text-gray-900">$2,500.00</span>
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs border-b border-gray-100 pb-1">
          <span className="text-gray-600">Design work</span>
          <span className="text-gray-900">$1,200.00</span>
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs border-b border-gray-100 pb-1">
          <span className="text-gray-600">Development</span>
          <span className="text-gray-900">$3,800.00</span>
        </div>
      </div>
      <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-900 pt-2 border-t border-gray-300">
        <span>Total</span>
        <span>$7,500.00</span>
      </div>
      <p className="text-[8px] sm:text-[10px] text-gray-400 mt-4">
        Payment due within 30 days
      </p>
    </div>
  );
}

function TaxFormDocument() {
  return (
    <div className="bg-white rounded-sm shadow-lg p-6 sm:p-8 aspect-[1/1.3] overflow-hidden text-left">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-[8px] font-bold text-gray-500">IRS</span>
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            Form W-9
          </h3>
          <p className="text-[8px] text-gray-500">
            Request for Taxpayer ID
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[8px] sm:text-[10px] text-gray-500 block mb-1">
            Name (as shown on your income tax return)
          </label>
          <div className="h-6 border border-gray-300 rounded px-2 flex items-center">
            <span className="text-[10px] sm:text-xs text-gray-900">John Smith</span>
          </div>
        </div>
        <div>
          <label className="text-[8px] sm:text-[10px] text-gray-500 block mb-1">
            Business name
          </label>
          <div className="h-6 border border-gray-300 rounded px-2 flex items-center">
            <span className="text-[10px] sm:text-xs text-gray-400">Optional</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-gray-300 rounded-sm bg-primary/20" />
            <span className="text-[8px] text-gray-600">Individual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-gray-300 rounded-sm" />
            <span className="text-[8px] text-gray-600">Corporation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EbookDocument() {
  return (
    <div className="bg-white rounded-sm shadow-lg p-6 sm:p-8 aspect-[1/1.3] overflow-hidden text-left">
      <p className="text-[8px] text-gray-400 mb-2">Chapter 3</p>
      <h3 className="text-sm sm:text-base font-serif font-semibold text-gray-900 mb-3">
        The Art of Productivity
      </h3>
      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed mb-2">
        <span className="bg-yellow-200/70">
          Productivity isn&apos;t about doing more—it&apos;s about doing what matters.
        </span>{" "}
        The most effective people focus on high-impact activities.
      </p>
      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed mb-2">
        Consider the 80/20 principle: roughly 80% of results come from 20% of
        efforts. Identify your vital few tasks.
      </p>
      <div className="bg-amber-50 border-l-2 border-amber-400 pl-2 py-1 mt-3">
        <p className="text-[8px] sm:text-[10px] text-amber-800 italic">
          Note: Review this section for meeting prep
        </p>
      </div>
      <p className="text-[8px] text-gray-400 mt-4 text-center">42</p>
    </div>
  );
}

function ResumeDocument() {
  return (
    <div className="bg-white rounded-sm shadow-lg p-6 sm:p-8 aspect-[1/1.3] overflow-hidden text-left">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5">
        Sarah Johnson
      </h3>
      <p className="text-[10px] sm:text-xs text-gray-500 mb-3">
        Product Designer • san@email.com
      </p>
      <div className="mb-3">
        <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Experience
        </h4>
        <div className="mb-2">
          <p className="text-[10px] sm:text-xs text-gray-900 font-medium">
            Senior Designer, TechCorp
          </p>
          <p className="text-[8px] sm:text-[10px] text-gray-500">2021 - Present</p>
          <p className="text-[8px] sm:text-[10px] text-gray-600">
            • Led redesign of core product, increasing engagement 40%
          </p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-gray-900 font-medium">
            Designer, StartupXYZ
          </p>
          <p className="text-[8px] sm:text-[10px] text-gray-500">2019 - 2021</p>
        </div>
      </div>
      <div>
        <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Education
        </h4>
        <p className="text-[10px] sm:text-xs text-gray-900">BFA Design, State University</p>
      </div>
    </div>
  );
}

function TicketDocument() {
  return (
    <div className="bg-white rounded-sm shadow-lg p-6 sm:p-8 aspect-[1/1.3] overflow-hidden text-left">
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
        <div className="text-center mb-3">
          <p className="text-[8px] text-gray-400 uppercase tracking-wide">
            Admit One
          </p>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            Tech Conference 2024
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-600">
            March 15, 2024 • 9:00 AM
          </p>
        </div>
        <div className="flex justify-center mb-3">
          <div className="w-32 h-12 bg-gray-100 rounded flex items-center justify-center">
            <div className="flex gap-0.5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gray-800"
                  style={{ height: `${Math.random() * 24 + 12}px` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-900 font-medium">
            Convention Center, Hall A
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500">
            Seat: GA-142
          </p>
        </div>
      </div>
    </div>
  );
}

const documentComponents: Record<string, React.FC> = {
  contracts: ContractDocument,
  invoices: InvoiceDocument,
  "tax-forms": TaxFormDocument,
  ebooks: EbookDocument,
  resumes: ResumeDocument,
  tickets: TicketDocument,
};

export function UseCasesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCase = useCases[activeIndex];
  const DocumentComponent = documentComponents[activeCase.id];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            One Editor for Every Document
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re signing contracts, filing taxes, or updating your resume—Paperwork handles it all. No downloads, no accounts, completely free.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="flex gap-2 flex-wrap justify-center">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              const isActive = index === activeIndex;
              return (
                <button
                  key={useCase.id}
                  onClick={() => setActiveIndex(index)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-foreground text-background shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {useCase.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10"
        >
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Benefits */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCase.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl sm:text-2xl font-medium text-foreground mb-3">
                    {activeCase.headline}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {activeCase.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {activeCase.benefits.map((benefit, index) => (
                      <motion.li
                        key={benefit}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground text-sm sm:text-base">
                          {benefit}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  <Button asChild>
                    <Link href={activeCase.ctaHref} className="inline-flex items-center gap-2">
                      {activeCase.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* PDF Preview */}
            <div className="flex justify-center order-first md:order-last">
              <div className="w-full max-w-xs">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DocumentComponent />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
