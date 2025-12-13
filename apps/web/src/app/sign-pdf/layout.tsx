import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - Electronic Signature | Paperwork",
  description:
    "Sign PDF documents online for free. Draw, type, or create your electronic signature. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "sign pdf",
    "how to sign a pdf",
    "sign pdf online",
    "sign pdf free",
    "electronic signature pdf",
    "esign pdf",
    "sign a pdf",
    "pdf sign",
    "sign pdf online free",
    "how to electronically sign a pdf",
    "how to digitally sign a pdf",
    "how to sign a pdf document",
  ],
  openGraph: {
    title: "Sign PDF Online Free - Electronic Signature",
    description:
      "Sign PDF documents online for free. Draw, type, or create your electronic signature. No signup required.",
    type: "website",
    url: "https://paperwork.ink/sign-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online Free - Electronic Signature",
    description: "Sign PDF documents online for free. Draw or type your signature.",
  },
  alternates: {
    canonical: "https://paperwork.ink/sign-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Sign PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF signing tool. Add electronic signatures to PDF documents.",
      featureList: [
        "Draw signature with mouse or touch",
        "Type signature",
        "Place signature anywhere",
        "Legally valid e-signatures",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Sign a PDF",
      description: "Learn how to electronically sign PDF documents for free.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop your PDF document that needs to be signed.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Create your signature",
          text: "Draw your signature using your mouse or touchscreen, or type your name to generate a signature.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Place and download",
          text: "Click where you want your signature to appear, resize if needed, then download your signed PDF.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I sign a PDF online?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF, create your signature by drawing or typing, then click anywhere on the document to place it. Download your signed PDF when you're done.",
          },
        },
        {
          "@type": "Question",
          name: "Is an electronic signature legally valid?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, electronic signatures are legally binding in most countries, including the US (ESIGN Act), EU (eIDAS), and many others.",
          },
        },
        {
          "@type": "Question",
          name: "How do I digitally sign a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our tool creates electronic signatures that you can place on any PDF. Simply draw your signature or type your name, position it on the document, and download.",
          },
        },
        {
          "@type": "Question",
          name: "Can I sign a PDF on my phone?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Our signature tool works on any device. You can draw your signature using your finger on a touchscreen.",
          },
        },
        {
          "@type": "Question",
          name: "Is my signature secure?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. Your signature and documents never leave your device. All processing happens locally in your browser.",
          },
        },
      ],
    },
  ],
};

export default function SignPdfLayout({
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
