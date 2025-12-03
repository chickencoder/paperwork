import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Highlight PDF Online Free - Mark Text in PDF | Paperwork",
  description:
    "Highlight text in PDF files online for free. Choose from multiple colors to mark important passages. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "highlight pdf",
    "how to highlight a pdf",
    "highlight pdf online",
    "pdf highlighter",
    "highlight text in pdf",
    "highlight a pdf",
    "highlight pdf free",
    "how to highlight pdf",
  ],
  openGraph: {
    title: "Highlight PDF Online Free - Mark Text in PDF",
    description:
      "Highlight text in PDF files online for free. Choose from multiple colors to mark important passages. No signup required.",
    type: "website",
    url: "https://paperwork.ink/highlight-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Highlight PDF Online Free - Mark Text in PDF",
    description: "Highlight PDF text online for free. Multiple colors available.",
  },
  alternates: {
    canonical: "https://paperwork.ink/highlight-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Highlight PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF highlighter. Mark important text in multiple colors.",
      featureList: [
        "Multiple highlight colors",
        "Yellow, green, blue, pink, orange",
        "Instant text highlighting",
        "No file limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Highlight a PDF",
      description: "Learn how to highlight text in PDF files for free.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the PDF you want to highlight.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Select and highlight text",
          text: "Choose a highlight color, then select the text you want to highlight. The highlight is applied instantly.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download highlighted PDF",
          text: "Save and download your PDF with all highlights included.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I highlight text in a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF, select the highlight tool and choose a color, then click and drag over the text you want to highlight. It's applied instantly.",
          },
        },
        {
          "@type": "Question",
          name: "What colors can I use to highlight?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We offer yellow, green, blue, pink, and orange highlight colors. Choose the color that best fits your needs.",
          },
        },
        {
          "@type": "Question",
          name: "Can I highlight a scanned PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Highlighting works best on PDFs with selectable text. For scanned documents, use our OCR tool first to make the text selectable.",
          },
        },
        {
          "@type": "Question",
          name: "Will the highlights be visible to others?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Highlights are embedded in the PDF and visible to anyone who opens the document in any PDF viewer.",
          },
        },
        {
          "@type": "Question",
          name: "Can I remove highlights?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, you can remove highlights before downloading. Most PDF viewers also allow you to remove or edit highlights in the downloaded file.",
          },
        },
      ],
    },
  ],
};

export default function HighlightPdfLayout({
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
