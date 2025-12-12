"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ArticleFrontmatter } from "@/lib/blog/types";
import { TagBadge } from "./tag-badge";

interface ArticleCardProps {
  article: ArticleFrontmatter;
  index?: number;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/blog/${article.slug}`} className="group block">
        <div className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-border/80 hover:shadow-lg">
          {/* Hero Image */}
          <div className="relative aspect-[16/9] bg-muted overflow-hidden">
            {article.heroImage?.src ? (
              <Image
                src={article.heroImage.src}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-foreground/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.slice(0, 2).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>

            {/* Title */}
            <h3 className="text-lg font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {article.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {article.author && (
                <span className="font-medium">{article.author.name}</span>
              )}
              <span>·</span>
              <time dateTime={article.publishedAt}>{formattedDate}</time>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
