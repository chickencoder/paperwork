import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export const mdxComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1
      className="text-3xl sm:text-4xl font-medium text-foreground mt-12 mb-6 tracking-tight"
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => {
    const text = typeof children === "string" ? children : "";
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h2
        id={id}
        className="text-2xl font-medium text-foreground mt-10 mb-4 tracking-tight scroll-mt-24"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: ReactNode }) => {
    const text = typeof children === "string" ? children : "";
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h3
        id={id}
        className="text-xl font-medium text-foreground mt-8 mb-3 tracking-tight scroll-mt-24"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {children}
      </h3>
    );
  },
  p: ({ children }: { children?: ReactNode }) => (
    <p className="text-foreground/90 leading-relaxed mb-6">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href || "#"}
        className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      >
        {children}
      </Link>
    );
  },
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-foreground/90">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-foreground/90">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-l-4 border-primary/30 pl-6 my-6 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto mb-6 text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-border my-10" />,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <span className="block my-8">
      <Image
        src={src || ""}
        alt={alt || ""}
        width={800}
        height={450}
        className="rounded-lg w-full"
      />
    </span>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
};
