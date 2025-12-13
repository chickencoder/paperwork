import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flatten PDF Online Free - Merge Layers & Forms | Paperwork",
  description:
    "Flatten PDF files online for free. Merge all layers, form fields, and annotations into a single flat layer. No signup, no watermarks, 100% private.",
  keywords: [
    "flatten pdf",
    "how to flatten a pdf",
    "pdf flatten",
    "flatten pdf online",
    "flatten pdf free",
    "merge pdf layers",
    "flatten pdf form",
    "flatten annotations",
  ],
  openGraph: {
    title: "Flatten PDF Online Free - Merge Layers & Forms",
    description:
      "Flatten PDF files online for free. Merge all layers into one uneditable document. No signup required.",
    type: "website",
    url: "https://paperwork.ink/flatten-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flatten PDF Online Free - Merge Layers & Forms",
    description: "Flatten PDFs online for free. Merge layers and forms into one.",
  },
  alternates: {
    canonical: "https://paperwork.ink/flatten-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Flatten PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF flattening tool. Merge all layers, form fields, and annotations.",
      featureList: [
        "Merge all layers into one",
        "Flatten form fields",
        "Lock annotations",
        "Prevent future edits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Flatten a PDF",
      description: "Learn how to flatten PDF files and merge all layers.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the PDF you want to flatten.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Review and flatten",
          text: "Preview your document and click flatten to merge all layers, form fields, and annotations.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download flattened PDF",
          text: "Download your flattened PDF with all content merged into a single, uneditable layer.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What does flattening a PDF do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Flattening merges all layers, form fields, annotations, and interactive elements into a single flat layer. The content becomes part of the page and cannot be edited.",
          },
        },
        {
          "@type": "Question",
          name: "Why would I flatten a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Flatten PDFs to finalize documents, prevent future edits, ensure consistent printing, reduce file size, or prepare for archival.",
          },
        },
        {
          "@type": "Question",
          name: "Will flattening remove form fields?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, form fields become static content. The filled-in data remains visible but can no longer be edited.",
          },
        },
        {
          "@type": "Question",
          name: "Can I undo flattening?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No, flattening is permanent. Keep a copy of your original PDF if you might need to edit it later.",
          },
        },
        {
          "@type": "Question",
          name: "Does flattening reduce file size?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Often yes. Removing interactive elements and merging layers can reduce file size, especially for PDFs with many annotations or form fields.",
          },
        },
      ],
    },
  ],
};

export default function FlattenPdfLayout({
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
