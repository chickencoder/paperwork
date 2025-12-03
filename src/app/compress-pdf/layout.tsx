import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free - Reduce PDF File Size | Paperwork",
  description:
    "Compress PDF files online for free. Reduce PDF file size by up to 90% without losing quality. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "compress pdf",
    "pdf compress",
    "reduce pdf size",
    "compress pdf free",
    "compress pdf online",
    "pdf compressor",
    "shrink pdf",
    "compress pdf file",
    "reduce pdf file size",
    "compress pdf online free",
    "how to compress a pdf",
    "compress pdf file size",
  ],
  openGraph: {
    title: "Compress PDF Online Free - Reduce PDF File Size",
    description:
      "Compress PDF files online for free. Reduce file size without losing quality. No signup required.",
    type: "website",
    url: "https://paperwork.ink/compress-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online Free - Reduce PDF File Size",
    description: "Compress PDF files online for free. Reduce file size by up to 90%.",
  },
  alternates: {
    canonical: "https://paperwork.ink/compress-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Compress PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF compressor. Reduce PDF file size by up to 90% without losing quality.",
      featureList: [
        "Reduce file size by up to 90%",
        "Multiple compression presets",
        "Preserve text quality",
        "No file size limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Compress a PDF",
      description: "Learn how to reduce PDF file size for free using our online compressor.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the PDF file you want to compress.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Choose compression level",
          text: "Select from Web (maximum compression), Standard (balanced), or Print (best quality) presets.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download compressed PDF",
          text: "Click compress and your smaller PDF will download automatically.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I compress a PDF file?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF, choose your preferred compression level, and click compress. Your smaller PDF will download automatically.",
          },
        },
        {
          "@type": "Question",
          name: "Will compression affect my PDF quality?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our compression optimizes images and removes unnecessary data while preserving text clarity. Choose 'Print' for highest quality or 'Web' for maximum compression.",
          },
        },
        {
          "@type": "Question",
          name: "How much can I reduce my PDF file size?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Depending on the content, you can reduce file sizes by up to 90%. PDFs with many images see the biggest reductions.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a file size limit?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No server-side limits since everything processes in your browser. Very large files may take longer to process.",
          },
        },
        {
          "@type": "Question",
          name: "Is my PDF secure during compression?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Your files never leave your device—all compression happens locally in your browser.",
          },
        },
      ],
    },
  ],
};

export default function CompressPdfLayout({
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
