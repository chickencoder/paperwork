import Image from "next/image";
import type { ArticleFrontmatter } from "@/lib/blog/types";
import { TagBadge } from "./tag-badge";

interface ArticleHeaderProps extends ArticleFrontmatter {
  readingTime: number;
}

export function ArticleHeader({
  title,
  description,
  publishedAt,
  author,
  heroImage,
  tags,
  readingTime,
}: ArticleHeaderProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header>
      {/* Hero Image */}
      <div className="relative w-full aspect-[21/9] bg-muted">
        {heroImage?.src ? (
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
        )}
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 -mt-24 relative z-10">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} href={`/blog?tag=${tag}`} />
          ))}
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4 tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {title}
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
          {description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pb-8 border-b border-border">
          {author && (
            <div className="flex items-center gap-2">
              {author.avatar && (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="font-medium text-foreground">{author.name}</span>
            </div>
          )}
          <span>·</span>
          <time dateTime={publishedAt}>{formattedDate}</time>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
    </header>
  );
}
