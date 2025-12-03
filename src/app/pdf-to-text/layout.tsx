import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Text Converter - Extract Text from PDF Free | Paperwork",
  description:
    "Convert PDF to plain text instantly. Extract text from any PDF including scanned documents. Free, no signup, works in your browser.",
  keywords: [
    "pdf to text",
    "convert pdf to text",
    "extract text from pdf",
    "pdf text extractor",
    "pdf to txt",
    "copy text from pdf",
    "pdf to text converter",
    "extract text from scanned pdf",
    "pdf text extraction",
    "free pdf to text",
  ],
  openGraph: {
    title: "PDF to Text Converter - Extract Text from PDF Free",
    description:
      "Convert PDF to plain text instantly. Extract text from any PDF including scanned documents.",
    type: "website",
  },
};

export default function PdfToTextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
