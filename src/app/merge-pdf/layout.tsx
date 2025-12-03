import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Online Free - Combine PDF Files | Paperwork",
  description:
    "Merge and combine PDF files online for free. Join multiple PDFs into one document instantly. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "merge pdf",
    "combine pdf",
    "pdf merger",
    "pdf combiner",
    "merge pdf files",
    "combine pdf files",
    "merge pdf free",
    "merge pdf online",
    "join pdf",
    "pdf merge",
    "combine pdf online",
    "merge pdf online free",
    "how to merge pdf files",
    "how to combine pdf files",
  ],
  openGraph: {
    title: "Merge PDF Online Free - Combine PDF Files",
    description:
      "Merge and combine PDF files online for free. Join multiple PDFs into one document instantly. No signup required.",
    type: "website",
    url: "https://paperwork.ink/merge-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Online Free - Combine PDF Files",
    description:
      "Merge and combine PDF files online for free. Join multiple PDFs into one document instantly.",
  },
  alternates: {
    canonical: "https://paperwork.ink/merge-pdf",
  },
};

// Structured data for the merge PDF tool
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Merge PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Free online PDF merger. Combine multiple PDF files into one document instantly in your browser.",
      featureList: [
        "Merge unlimited PDFs",
        "Reorder pages before merging",
        "No file size limits",
        "100% private - files stay local",
        "No signup required",
        "Works on all devices",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Merge PDF Files",
      description:
        "Learn how to combine multiple PDF files into one document using our free online tool.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF files",
          text: "Click the upload button or drag and drop your PDF files onto the page. You can select multiple files at once.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Arrange the order",
          text: "Once uploaded, arrange your PDFs in the order you want them to appear in the final merged document.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Merge and download",
          text: "Click merge to combine all PDFs into a single document. Your merged PDF will download automatically.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I combine PDF files into one?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Simply upload your PDF files using the button above, arrange them in your preferred order, and click merge. The combined PDF will download automatically to your device.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a limit to how many PDFs I can merge?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No, you can merge as many PDF files as you need. All processing happens in your browser, so there are no server-side limits.",
          },
        },
        {
          "@type": "Question",
          name: "Are my files secure when merging PDFs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, completely. Your files never leave your device. All PDF processing happens locally in your browser—we don't upload anything to any server.",
          },
        },
        {
          "@type": "Question",
          name: "Can I merge PDFs on my phone or tablet?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Our PDF merger works on any device with a modern web browser, including smartphones and tablets.",
          },
        },
        {
          "@type": "Question",
          name: "Will merging affect the quality of my PDFs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No, the merge process preserves the original quality of all your documents. Text, images, and formatting remain unchanged.",
          },
        },
      ],
    },
  ],
};

export default function MergePdfLayout({
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
