import Link from "next/link";

interface TagBadgeProps {
  tag: string;
  href?: string;
}

export function TagBadge({ tag, href }: TagBadgeProps) {
  const className =
    "inline-block px-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-full transition-colors hover:bg-muted/80";

  if (href) {
    return (
      <Link href={href} className={className}>
        {tag}
      </Link>
    );
  }

  return <span className={className}>{tag}</span>;
}
