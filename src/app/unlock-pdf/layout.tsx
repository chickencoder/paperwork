import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unlock PDF Online Free - Remove Password Protection | Paperwork",
  description:
    "Unlock PDF files online for free. Remove password protection to enable printing, copying, and editing. No signup, no watermarks, 100% private.",
  keywords: [
    "unlock pdf",
    "remove password from pdf",
    "pdf unlock",
    "unlock pdf online",
    "unlock pdf free",
    "pdf password remover",
    "remove pdf password",
    "how to remove password from pdf",
  ],
  openGraph: {
    title: "Unlock PDF Online Free - Remove Password Protection",
    description:
      "Unlock PDF files online for free. Remove passwords to enable printing and editing. No signup required.",
    type: "website",
    url: "https://paperwork.ink/unlock-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock PDF Online Free - Remove Password Protection",
    description: "Unlock PDFs online for free. Remove password protection instantly.",
  },
  alternates: {
    canonical: "https://paperwork.ink/unlock-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Unlock PDF - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Free online PDF password remover. Unlock PDFs to enable printing, copying, and editing.",
      featureList: [
        "Remove permission passwords",
        "Enable printing and copying",
        "Enable editing",
        "No file limits",
        "100% private",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Unlock a PDF",
      description: "Learn how to remove password protection from PDF files.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop the password-protected PDF.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Enter password if required",
          text: "If the PDF requires a password to open, enter it. Permission-only passwords are removed automatically.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download unlocked PDF",
          text: "Download your PDF with restrictions removed—you can now print, copy, and edit.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What types of PDF passwords can be removed?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We can remove permission passwords (restrictions on printing, copying, editing). For open passwords (required to view the document), you'll need to enter the password first.",
          },
        },
        {
          "@type": "Question",
          name: "Is it legal to unlock a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Only unlock PDFs you own or have permission to modify. Removing restrictions from others' copyrighted materials may violate copyright laws.",
          },
        },
        {
          "@type": "Question",
          name: "Will unlocking change the PDF content?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Unlocking only removes restrictions—your document content, formatting, and quality remain exactly the same.",
          },
        },
        {
          "@type": "Question",
          name: "Can I unlock a PDF without the password?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Permission-only restrictions (no-print, no-copy, no-edit) can be removed without a password. Open passwords (needed to view) must be entered.",
          },
        },
        {
          "@type": "Question",
          name: "Is my PDF secure during unlocking?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All processing happens in your browser—your files and passwords never leave your device.",
          },
        },
      ],
    },
  ],
};

export default function UnlockPdfLayout({
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
