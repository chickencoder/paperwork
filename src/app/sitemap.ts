import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.trypaperwork.com";

  const staticPages = [
    "",
    "/editor",
    "/pdf-to-text",
    "/image-to-text",
    "/edit-pdf",
    "/sign-pdf",
    "/highlight-pdf",
    "/merge-pdf",
    "/split-pdf",
    "/rotate-pdf",
    "/compress-pdf",
    "/fill-pdf",
    "/annotate-pdf",
    "/redact-pdf",
    "/flatten-pdf",
    "/unlock-pdf",
    "/ocr-pdf",
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
