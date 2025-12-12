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
  tags,
  readingTime,
}: ArticleHeaderProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="mb-10">
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
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
    </header>
  );
}

interface ArticleHeroImageProps {
  heroImage?: {
    src: string;
    alt: string;
  };
}

export function ArticleHeroImage({ heroImage }: ArticleHeroImageProps) {
  return (
    <div className="relative w-full aspect-[2/1] bg-muted rounded-xl overflow-hidden mb-10">
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
    </div>
  );
}
