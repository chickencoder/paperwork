import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to Text - Free Online OCR | Paperwork",
  description:
    "Extract text from images and scanned documents using advanced OCR technology. Free, private, and works entirely in your browser.",
  keywords: [
    "image to text",
    "ocr image",
    "extract text from image",
    "photo to text",
    "scan to text",
    "picture to text",
    "image text extractor",
    "convert image to text",
    "scanned document to text",
    "free image to text",
  ],
  openGraph: {
    title: "Image to Text - Free Online OCR",
    description:
      "Extract text from images and scanned documents. Free OCR tool that works in your browser.",
    type: "website",
  },
};

export default function ImageToTextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
