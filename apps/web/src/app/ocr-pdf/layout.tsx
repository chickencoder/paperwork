import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR PDF Online Free - Extract Text from Scanned PDFs | Paperwork",
  description:
    "Free online OCR tool to extract text from scanned PDFs and images. No upload required - works entirely in your browser. Support for multiple languages.",
  keywords: [
    "ocr pdf",
    "pdf ocr",
    "ocr pdf online",
    "ocr pdf free",
    "extract text from pdf",
    "scanned pdf to text",
    "pdf text extraction",
    "optical character recognition",
    "ocr online",
    "free ocr",
  ],
  openGraph: {
    title: "OCR PDF Online Free - Extract Text from Scanned PDFs",
    description:
      "Free online OCR tool to extract text from scanned PDFs. No upload required - works in your browser.",
    type: "website",
    url: "https://paperwork.ink/ocr-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCR PDF Online Free - Extract Text from Scanned PDFs",
    description: "OCR scanned PDFs online for free. Extract text instantly.",
  },
  alternates: {
    canonical: "https://paperwork.ink/ocr-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "OCR PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online OCR tool. Extract text from scanned PDFs and images using optical character recognition.",
      featureList: [
        "Extract text from scanned PDFs",
        "Support for multiple languages",
        "High accuracy recognition",
        "No file limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to OCR a PDF",
      description: "Learn how to extract text from scanned PDFs using OCR.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your scanned PDF",
          text: "Click the upload button or drag and drop the scanned PDF or image you want to OCR.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Process with OCR",
          text: "Our OCR engine analyzes the document and recognizes all text, even from scanned images.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Copy or download text",
          text: "Copy the extracted text to your clipboard or download it as a text file.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is OCR?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "OCR (Optical Character Recognition) is technology that converts images of text into machine-readable text. It allows you to extract and edit text from scanned documents and photos.",
          },
        },
        {
          "@type": "Question",
          name: "Can OCR extract text from any PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "OCR works best on scanned documents and image-based PDFs. If your PDF already has selectable text, you can copy it directly without OCR.",
          },
        },
        {
          "@type": "Question",
          name: "What languages does the OCR support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our OCR engine supports English and many other languages with high accuracy. The engine automatically detects the language in most cases.",
          },
        },
        {
          "@type": "Question",
          name: "How accurate is the OCR?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Accuracy depends on image quality. Clear, high-resolution scans achieve near-perfect accuracy. Lower quality images may have some errors that need manual correction.",
          },
        },
        {
          "@type": "Question",
          name: "Is my document secure during OCR?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All OCR processing happens in your browser—your documents never leave your device. This is the most secure way to OCR sensitive documents.",
          },
        },
      ],
    },
  ],
};

export default function OcrPdfLayout({
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
