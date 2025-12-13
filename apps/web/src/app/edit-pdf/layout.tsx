import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF Editor Online - Edit PDF Files | Paperwork",
  description:
    "Edit PDF files online for free. Add text, images, signatures, highlights, annotations, and more. No signup, no watermarks, 100% private - your files never leave your browser.",
  keywords: [
    "pdf editor",
    "edit pdf",
    "free pdf editor",
    "edit pdf online",
    "pdf editor free",
    "edit pdf free",
    "online pdf editor",
    "pdf editor online free",
    "how to edit a pdf",
    "how to edit pdf",
    "edit pdf online free",
    "how to edit a pdf on mac",
    "how to edit a pdf for free",
  ],
  openGraph: {
    title: "Free PDF Editor Online - Edit PDF Files",
    description:
      "Edit PDF files online for free. Add text, images, signatures, and more. No signup required.",
    type: "website",
    url: "https://paperwork.ink/edit-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Editor Online - Edit PDF Files",
    description:
      "Edit PDF files online for free. Add text, images, signatures, and more.",
  },
  alternates: {
    canonical: "https://paperwork.ink/edit-pdf",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "PDF Editor - Paperwork",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Free online PDF editor. Add text, signatures, highlights, and annotations to PDFs in your browser.",
      featureList: [
        "Add and edit text",
        "Insert signatures",
        "Highlight text",
        "Add annotations",
        "Fill form fields",
        "100% private - files stay local",
        "No watermarks",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to Edit a PDF",
      description:
        "Learn how to edit PDF files for free using our online PDF editor.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your PDF",
          text: "Click the upload button or drag and drop your PDF file onto the page to open it in the editor.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Make your edits",
          text: "Use the toolbar to add text, signatures, highlights, annotations, or fill out form fields.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download your edited PDF",
          text: "When done, click download to save your edited PDF with all changes embedded.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I edit a PDF for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF using the button above, make your edits using our toolbar (add text, signatures, highlights, etc.), and download the edited file. It's completely free with no watermarks.",
          },
        },
        {
          "@type": "Question",
          name: "Can I add text to a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Click anywhere on the PDF to add a text box. You can customize the font, size, and color of your text.",
          },
        },
        {
          "@type": "Question",
          name: "How do I edit a PDF on Mac?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our PDF editor works in any web browser on Mac. Simply visit this page, upload your PDF, and start editing. No software download required.",
          },
        },
        {
          "@type": "Question",
          name: "Can I edit a PDF without Adobe Acrobat?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. Our free online PDF editor provides all the essential editing features without needing Adobe Acrobat or any other paid software.",
          },
        },
        {
          "@type": "Question",
          name: "Are my PDF files secure?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, completely. Your files never leave your device—all editing happens locally in your browser. We don't upload or store any of your documents.",
          },
        },
      ],
    },
  ],
};

export default function EditPdfLayout({
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
