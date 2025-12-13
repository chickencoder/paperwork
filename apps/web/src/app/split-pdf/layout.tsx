import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online Free - Extract PDF Pages | Paperwork",
  description:
    "Split PDF files online for free. Extract specific pages or divide your PDF into multiple files. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "split pdf",
    "pdf split",
    "split pdf pages",
    "extract pages from pdf",
    "split pdf online free",
    "pdf splitter",
    "split pdf online",
    "split a pdf",
    "split pdf free",
    "how to split a pdf",
    "how to split pdf pages",
    "how to split a pdf into multiple files",
  ],
  openGraph: {
    title: "Split PDF Online Free - Extract PDF Pages",
    description:
      "Split PDF files online for free. Extract specific pages or divide your PDF into multiple files. No signup required.",
    type: "website",
    url: "https://paperwork.ink/split-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online Free - Extract PDF Pages",
    description: "Split PDF files online for free. Extract pages instantly.",
  },
  alternates: {
    canonical: "https://paperwork.ink/split-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Split PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF splitter. Extract pages or split PDFs into multiple files.",
      featureList: [
        "Extract specific pages",
        "Split by page ranges",
        "Extract every nth page",
        "No file limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Split a PDF",
      description: "Learn how to split PDF files and extract pages for free.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the PDF you want to split.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Select pages to extract",
          text: "Choose specific pages, page ranges (e.g., 1-5), or extract every nth page.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download your new PDF",
          text: "Click split and download your extracted pages as a new PDF file.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I split a PDF into multiple files?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF, select the pages you want to extract using page numbers or ranges, and click split. Each extraction creates a new PDF file.",
          },
        },
        {
          "@type": "Question",
          name: "Can I extract specific pages from a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! You can extract individual pages, page ranges (like 1-5, 10-15), or even every nth page from your document.",
          },
        },
        {
          "@type": "Question",
          name: "How do I split a PDF into individual pages?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF and extract each page one at a time, or use the 'every 1 page' option to split all pages at once.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a limit to how many pages I can split?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No limits! Since all processing happens in your browser, you can split PDFs of any size.",
          },
        },
        {
          "@type": "Question",
          name: "Are my files secure when splitting?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Your files never leave your device—all splitting happens locally in your browser.",
          },
        },
      ],
    },
  ],
};

export default function SplitPdfLayout({
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
