"use client";

import Link from "next/link";
import {
  Layers,
  Scissors,
  RotateCw,
  PenLine,
  PenTool,
  FileArchive,
  Highlighter,
  MessageSquare,
  EyeOff,
  FormInput,
  Unlock,
  ScanText,
} from "lucide-react";

const toolGroups = [
  {
    title: "Edit & Annotate",
    tools: [
      { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
      { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
      { name: "Fill PDF", href: "/fill-pdf", icon: FormInput },
      { name: "Annotate PDF", href: "/annotate-pdf", icon: MessageSquare },
      { name: "Highlight PDF", href: "/highlight-pdf", icon: Highlighter },
      { name: "Redact PDF", href: "/redact-pdf", icon: EyeOff },
    ],
  },
  {
    title: "Organize",
    tools: [
      { name: "Merge PDF", href: "/merge-pdf", icon: Layers },
      { name: "Split PDF", href: "/split-pdf", icon: Scissors },
      { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
      { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
    ],
  },
  {
    title: "Convert",
    tools: [
      { name: "OCR PDF", href: "/ocr-pdf", icon: ScanText },
      { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock },
      { name: "Flatten PDF", href: "/flatten-pdf", icon: Layers },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h2
                className="text-2xl text-foreground font-medium"
                style={{
                  fontFamily: "'Fraunces', serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Paperwork
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Free PDF tools that run entirely in your browser. No uploads, no signups, complete privacy.
            </p>
          </div>

          {/* Tool groups */}
          {toolGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-foreground font-medium mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.tools.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <tool.icon className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                      <span className="text-sm">{tool.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground/70 text-sm">
            © {currentYear} Paperwork. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-muted-foreground/70 hover:text-muted-foreground text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/" className="text-muted-foreground/70 hover:text-muted-foreground text-sm transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/70 hover:text-muted-foreground text-sm transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
