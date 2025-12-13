import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free - Turn PDF Pages | Paperwork",
  description:
    "Rotate PDF pages online for free. Turn pages 90°, 180°, or 270° clockwise. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "rotate pdf",
    "pdf rotate",
    "how to rotate a pdf",
    "rotate pdf pages",
    "rotate pdf online",
    "rotate pdf and save",
    "rotate a pdf",
    "rotate pdf free",
    "how to rotate pdf",
    "rotate pdf online free",
  ],
  openGraph: {
    title: "Rotate PDF Online Free - Turn PDF Pages",
    description:
      "Rotate PDF pages online for free. Turn pages 90°, 180°, or 270° clockwise. No signup required.",
    type: "website",
    url: "https://paperwork.ink/rotate-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Online Free - Turn PDF Pages",
    description: "Rotate PDF pages online for free. Turn pages any direction.",
  },
  alternates: {
    canonical: "https://paperwork.ink/rotate-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Rotate PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF rotator. Turn PDF pages 90°, 180°, or 270° clockwise.",
      featureList: [
        "Rotate 90°, 180°, or 270°",
        "Rotate all or specific pages",
        "Fix upside-down scans",
        "No file limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Rotate a PDF",
      description: "Learn how to rotate PDF pages for free.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the PDF you want to rotate.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Choose rotation angle",
          text: "Select 90°, 180°, or 270° clockwise rotation. Apply to all pages or select specific pages.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download rotated PDF",
          text: "Click rotate and download your correctly oriented PDF file.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I rotate a PDF and save it?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF, select the rotation angle (90°, 180°, or 270°), click rotate, and download. The rotated PDF is automatically saved when you download.",
          },
        },
        {
          "@type": "Question",
          name: "Can I rotate just one page in a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! You can select specific pages to rotate while leaving other pages unchanged. Perfect for fixing individual upside-down scans.",
          },
        },
        {
          "@type": "Question",
          name: "How do I rotate a PDF from portrait to landscape?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Use a 90° or 270° rotation to switch between portrait and landscape orientation. The direction depends on which way your content faces.",
          },
        },
        {
          "@type": "Question",
          name: "Can I rotate a scanned PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely! Our tool works with all PDFs including scanned documents. Just upload, rotate, and download.",
          },
        },
        {
          "@type": "Question",
          name: "Is rotating a PDF free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, completely free with no limits. All processing happens in your browser—no signup or payment required.",
          },
        },
      ],
    },
  ],
};

export default function RotatePdfLayout({
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
