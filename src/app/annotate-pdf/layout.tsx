import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Annotate PDF Online Free - Mark Up Documents | Paperwork",
  description:
    "Annotate PDF files online for free. Add highlights, notes, comments, and drawings to your documents. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "annotate pdf",
    "how to annotate a pdf",
    "annotate pdf online",
    "pdf annotation",
    "markup pdf",
    "annotate a pdf",
    "how to annotate pdf",
    "pdf annotator",
    "annotate pdf free",
  ],
  openGraph: {
    title: "Annotate PDF Online Free - Mark Up Documents",
    description:
      "Annotate PDF files online for free. Add highlights, notes, and comments to your documents. No signup required.",
    type: "website",
    url: "https://paperwork.ink/annotate-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annotate PDF Online Free - Mark Up Documents",
    description: "Annotate PDFs online for free. Add highlights, notes, and drawings.",
  },
  alternates: {
    canonical: "https://paperwork.ink/annotate-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Annotate PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF annotation tool. Add highlights, notes, and comments to documents.",
      featureList: [
        "Highlight text in multiple colors",
        "Add sticky notes and comments",
        "Draw freehand annotations",
        "No file limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Annotate a PDF",
      description: "Learn how to add annotations to PDF files for free.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the PDF you want to annotate.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Add your annotations",
          text: "Use the annotation tools to highlight text, add notes, draw shapes, or insert comments.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download annotated PDF",
          text: "Save your annotated document and download it with all your markups included.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I annotate a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF, then use the annotation tools to highlight text, add notes, draw on the document, or insert comments. Download when finished.",
          },
        },
        {
          "@type": "Question",
          name: "Can I add notes to a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! You can add sticky notes and comments anywhere on the document. Click where you want the note and start typing.",
          },
        },
        {
          "@type": "Question",
          name: "What annotation tools are available?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can highlight text in multiple colors, add sticky notes, draw freehand, insert shapes, and add text comments.",
          },
        },
        {
          "@type": "Question",
          name: "Will recipients see my annotations?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, all annotations are embedded in the PDF. Anyone who opens the document will see your highlights, notes, and other markups.",
          },
        },
        {
          "@type": "Question",
          name: "Can I remove annotations later?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Before downloading, you can edit or remove any annotation. Most PDF viewers also allow editing annotations in the downloaded file.",
          },
        },
      ],
    },
  ],
};

export default function AnnotatePdfLayout({
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
