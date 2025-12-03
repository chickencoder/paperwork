import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redact PDF Online Free - Remove Sensitive Information | Paperwork",
  description:
    "Redact PDF files online for free. Permanently remove sensitive text and images from documents. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "redact pdf",
    "how to redact a pdf",
    "redact pdf free",
    "pdf redaction",
    "black out text in pdf",
    "remove text from pdf",
    "redact pdf online",
    "pdf redact",
    "censor pdf",
  ],
  openGraph: {
    title: "Redact PDF Online Free - Remove Sensitive Information",
    description:
      "Redact PDF files online for free. Permanently remove sensitive text and images from documents. No signup required.",
    type: "website",
    url: "https://paperwork.ink/redact-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Online Free - Remove Sensitive Information",
    description: "Redact PDFs online for free. Permanently remove sensitive content.",
  },
  alternates: {
    canonical: "https://paperwork.ink/redact-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Redact PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF redaction tool. Permanently remove sensitive information from documents.",
      featureList: [
        "Permanent content removal",
        "Blackout text and images",
        "Flatten to prevent extraction",
        "No file limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Redact a PDF",
      description: "Learn how to permanently remove sensitive information from PDF files.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the PDF containing sensitive information.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Select content to redact",
          text: "Use the redaction tool to select text, images, or areas you want to permanently remove.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Apply redactions and download",
          text: "Click apply to permanently remove the selected content, then download your redacted PDF.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What's the difference between redacting and deleting?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Redaction permanently removes content from the PDF so it cannot be recovered. Simply covering or deleting visible elements may leave underlying data that can be extracted.",
          },
        },
        {
          "@type": "Question",
          name: "Is redacted content truly unrecoverable?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Our redaction tool permanently removes the selected content from the PDF file. The data is completely eliminated, not just hidden.",
          },
        },
        {
          "@type": "Question",
          name: "Can I redact images in a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! You can redact both text and images. Select any area of the document to permanently remove it.",
          },
        },
        {
          "@type": "Question",
          name: "Is my document secure during redaction?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. All processing happens in your browser—your files never leave your device. This is the most secure way to handle sensitive documents.",
          },
        },
        {
          "@type": "Question",
          name: "Can I undo a redaction?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Before downloading, you can undo redactions. Once you download the redacted PDF, the redactions are permanent and cannot be undone—that's the point of secure redaction.",
          },
        },
      ],
    },
  ],
};

export default function RedactPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
