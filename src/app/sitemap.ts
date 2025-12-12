import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog/mdx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.trypaperwork.com";

  const staticPages = [
    "",
    "/editor",
    "/blog",
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

  const staticRoutes = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Add blog articles
  const articles = await getAllArticles();
  const blogRoutes = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
