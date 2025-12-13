import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ScreenshotCard } from "./screenshot-card";

export const mdxComponents = {
  ScreenshotCard,
  h1: ({ children }: { children?: ReactNode }) => (
    <h1
      className="text-4xl sm:text-5xl font-medium text-foreground mt-12 mb-6 tracking-tight first:mt-0"
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      {children}
    </h1>
  ),
  h2: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h2
      id={id}
      className="text-2xl sm:text-3xl font-medium text-foreground mt-12 mb-4 tracking-tight scroll-mt-24"
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h3
      id={id}
      className="text-xl sm:text-2xl font-medium text-foreground mt-8 mb-3 tracking-tight scroll-mt-24"
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      {children}
    </h3>
  ),
  h4: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h4
      id={id}
      className="text-lg sm:text-xl font-medium text-foreground mt-6 mb-2 tracking-tight scroll-mt-24"
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      {children}
    </h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="text-muted-foreground leading-7 mb-6 [&:not(:first-child)]:mt-6 first:mt-0">
      {children}
    </p>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href || "#"}
        className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
      >
        {children}
      </Link>
    );
  },
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-7">{children}</li>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="mt-6 border-l-2 border-border pl-6 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border border-border bg-muted p-4">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-border" />,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <span className="block my-6">
      <Image
        src={src || ""}
        alt={alt || ""}
        width={800}
        height={450}
        className="rounded-t-lg border border-b-0 border-border w-full"
      />
    </span>
  ),
  figure: ({ children }: { children?: ReactNode }) => (
    <figure className="my-8">{children}</figure>
  ),
  figcaption: ({ children }: { children?: ReactNode }) => (
    <figcaption className="text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-b-lg border border-t-0 border-border -mt-6">
      {children}
    </figcaption>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="border-b border-border">{children}</thead>
  ),
  tbody: ({ children }: { children?: ReactNode }) => (
    <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
  ),
  tr: ({ children }: { children?: ReactNode }) => (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      {children}
    </tr>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="p-4 align-middle text-muted-foreground">{children}</td>
  ),
};
