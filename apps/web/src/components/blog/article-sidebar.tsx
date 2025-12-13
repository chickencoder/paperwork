"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableOfContents } from "./table-of-contents";

export function ArticleSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-8">
        {/* Table of Contents */}
        <div className="pb-6 border-b border-border">
          <TableOfContents />
        </div>

        {/* CTA Card */}
        <div className="bg-muted/50 rounded-xl p-6 border border-border">
          <h3
            className="text-lg font-medium text-foreground mb-2"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Try Paperwork Free
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Edit, sign, and annotate PDFs directly in your browser. No signup required.
          </p>
          <Button asChild className="w-full rounded-full">
            <Link href="/editor" className="flex items-center justify-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
