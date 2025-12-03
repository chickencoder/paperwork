import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free - Reduce PDF File Size | Paperwork",
  description:
    "Compress PDF files online for free. Reduce PDF file size without losing quality. No signup, no watermarks, 100% private - your files never leave your browser.",
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
  ],
  openGraph: {
    title: "Compress PDF Online Free - Reduce PDF File Size",
    description:
      "Compress PDF files online for free. Reduce file size without losing quality. No signup required.",
    type: "website",
  },
};

export default function CompressPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
