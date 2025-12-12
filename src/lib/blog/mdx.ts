import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ArticleFrontmatter, Article, TableOfContentsItem } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export async function getAllArticles(): Promise<ArticleFrontmatter[]> {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR);

  const articles = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContent);
      return data as ArticleFrontmatter;
    })
    .filter((article) => !article.draft)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!fs.existsSync(CONTENT_DIR)) {
    return null;
  }

  const files = fs.readdirSync(CONTENT_DIR);
  const file = files.find((f) => {
    if (!f.endsWith(".mdx")) return false;
    const filePath = path.join(CONTENT_DIR, f);
    const { data } = matter(fs.readFileSync(filePath, "utf8"));
    return data.slug === slug;
  });

  if (!file) return null;

  const filePath = path.join(CONTENT_DIR, file);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);
  const headings = extractHeadings(content);
  const readingTime = calculateReadingTime(content);

  return {
    ...(data as ArticleFrontmatter),
    content,
    headings,
    readingTime,
  };
}

export function extractHeadings(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text, level });
  }

  return headings;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  const tagSet = new Set<string>();

  articles.forEach((article) => {
    article.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

export async function getArticlesByTag(tag: string): Promise<ArticleFrontmatter[]> {
  const articles = await getAllArticles();
  return articles.filter((article) => article.tags.includes(tag));
}
