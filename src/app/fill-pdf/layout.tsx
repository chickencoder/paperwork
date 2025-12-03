import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fill PDF Forms Online Free - PDF Filler | Paperwork",
  description:
    "Fill out PDF forms online for free. Type into form fields, check boxes, and add signatures. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "pdf filler",
    "fill pdf",
    "fill out pdf",
    "fill pdf form",
    "fillable pdf",
    "fill and sign pdf",
    "fill pdf online",
    "fill out pdf online free",
    "pdf fill",
    "fill pdf free",
    "how to fill out a pdf form",
    "how to make a pdf fillable",
  ],
  openGraph: {
    title: "Fill PDF Forms Online Free - PDF Filler",
    description:
      "Fill out PDF forms online for free. Type into form fields, check boxes, and add signatures. No signup required.",
    type: "website",
    url: "https://paperwork.ink/fill-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fill PDF Forms Online Free - PDF Filler",
    description: "Fill out PDF forms online for free. Type, check boxes, and sign.",
  },
  alternates: {
    canonical: "https://paperwork.ink/fill-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "PDF Filler - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF form filler. Fill out PDF forms and add signatures.",
      featureList: [
        "Auto-detect form fields",
        "Fill text fields",
        "Check boxes",
        "Add signatures",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Fill Out a PDF Form",
      description: "Learn how to fill PDF forms online for free.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF form",
          text: "Click the upload button or drag and drop your PDF form. Our tool automatically detects fillable fields.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Fill in the fields",
          text: "Click on any form field to type your information. Check boxes and select dropdown options as needed.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Sign and download",
          text: "Add your signature if required, then download your completed form ready to submit.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I fill out a PDF form?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF form, click on any field to type your information, check boxes, or select options. Download when complete.",
          },
        },
        {
          "@type": "Question",
          name: "How do I make a PDF fillable?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our tool works with PDFs that already have form fields. If your PDF doesn't have fillable fields, you can use our Edit PDF tool to add text anywhere on the document.",
          },
        },
        {
          "@type": "Question",
          name: "Can I fill and sign a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! After filling out the form fields, you can add your signature using our built-in signature tool.",
          },
        },
        {
          "@type": "Question",
          name: "Will the filled form save my data?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "When you download the completed form, all your filled information is embedded in the PDF. Your data is never stored on our servers.",
          },
        },
        {
          "@type": "Question",
          name: "Can I fill PDF forms on mobile?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Our PDF filler works on any device with a web browser, including smartphones and tablets.",
          },
        },
      ],
    },
  ],
};

export default function FillPdfLayout({
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
