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
  },
};

export default function UnlockPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
