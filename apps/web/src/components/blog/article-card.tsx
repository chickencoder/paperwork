import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ArticleFrontmatter } from "@/lib/blog/types";

interface ArticleCardProps {
  article: ArticleFrontmatter;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <article>
      <Link href={`/blog/${article.slug}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[16/9] mb-4 rounded-lg overflow-hidden bg-muted">
          {article.heroImage?.src ? (
            <Image
              src={article.heroImage.src}
              alt={article.heroImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground/40"
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
        <div>
          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <time dateTime={article.publishedAt}>{formattedDate}</time>
            {article.tags.length > 0 && (
              <>
                <span className="text-border">/</span>
                <span>{article.tags[0]}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-foreground mb-2 line-clamp-2">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.description}
          </p>

          {/* Read more link */}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Read article
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
