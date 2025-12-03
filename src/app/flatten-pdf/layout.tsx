import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flatten PDF Online Free - Merge Layers & Forms | Paperwork",
  description:
    "Flatten PDF files online for free. Merge all layers, form fields, and annotations into a single flat layer. No signup, no watermarks, 100% private.",
  keywords: [
    "flatten pdf",
    "how to flatten a pdf",
    "pdf flatten",
    "flatten pdf online",
    "flatten pdf free",
    "merge pdf layers",
    "flatten pdf form",
    "flatten annotations",
  ],
  openGraph: {
    title: "Flatten PDF Online Free - Merge Layers & Forms",
    description:
      "Flatten PDF files online for free. Merge all layers into one uneditable document. No signup required.",
    type: "website",
  },
};

export default function FlattenPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
