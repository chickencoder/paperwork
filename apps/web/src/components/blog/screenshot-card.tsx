import Image from "next/image";
import Link from "next/link";

interface ScreenshotCardProps {
  src: string;
  alt: string;
  href: string;
  name: string;
  description: string;
}

export function ScreenshotCard({
  src,
  alt,
  href,
  name,
  description,
}: ScreenshotCardProps) {
  const isExternal = href.startsWith("http");

  const LinkWrapper = isExternal
    ? ({ children }: { children: React.ReactNode }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <Link href={href} className="block">
          {children}
        </Link>
      );

  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <LinkWrapper>
        <div className="overflow-hidden">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={450}
            className="w-full transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>
      </LinkWrapper>
      <figcaption className="border-t border-border bg-muted/30 px-4 py-2.5 text-center text-xs">
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            {name}
          </a>
        ) : (
          <Link href={href} className="font-medium text-foreground hover:underline">
            {name}
          </Link>
        )}
        <span className="text-muted-foreground"> / {description}</span>
      </figcaption>
    </figure>
  );
}
