import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free PDF Editor - Edit PDFs Online | Paperwork",
  description:
    "Free PDF editor that works in your browser. Sign, annotate, highlight, redact, and merge PDFs instantly. No upload to servers - your files stay completely private.",
  keywords: [
    "free PDF editor",
    "PDF editor",
    "online PDF editor",
    "edit PDF free",
    "sign PDF online",
    "annotate PDF",
    "highlight PDF",
    "redact PDF",
    "merge PDF",
    "PDF editor no upload",
    "private PDF editor",
    "browser PDF editor",
  ],
  authors: [{ name: "Paperwork" }],
  openGraph: {
    title: "Free PDF Editor - Edit PDFs Online | Paperwork",
    description:
      "Free PDF editor that works in your browser. Sign, annotate, highlight, redact, and merge PDFs instantly. Your files stay completely private.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Editor - Edit PDFs Online",
    description:
      "Free PDF editor in your browser. Sign, annotate, highlight, redact, and merge PDFs. No upload required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Paperwork",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "Free PDF editor that works in your browser. Sign, annotate, highlight, redact, and merge PDFs instantly.",
              featureList: [
                "Sign PDFs digitally",
                "Add text annotations",
                "Highlight text",
                "Redact sensitive information",
                "Merge multiple PDFs",
                "Fill PDF forms",
                "No file upload to servers",
                "100% private - files stay local",
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <ConvexClientProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
