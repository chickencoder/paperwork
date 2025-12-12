import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
  icons: {
    icon: [
      {
        url: "/favicon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
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
    <html lang="en" suppressHydrationWarning>
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
        {/* Detect Safari and add class to html for conditional CSS */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var ua=navigator.userAgent;if(ua.indexOf('Safari')>-1&&ua.indexOf('Chrome')===-1&&ua.indexOf('Chromium')===-1){document.documentElement.classList.add('safari')}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
