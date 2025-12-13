import Link from "next/link";

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={`
          px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
          ${
            activeTag === null
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }
        `}
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/blog?tag=${tag}`}
          className={`
            px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
            ${
              activeTag === tag
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }
          `}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
