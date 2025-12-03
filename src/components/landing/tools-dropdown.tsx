"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PenLine,
  Layers,
  Scissors,
  FileArchive,
  RotateCw,
  PenTool,
  FormInput,
  Highlighter,
  MessageSquare,
  EyeOff,
  FileOutput,
  LockOpen,
  ScanText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tool {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface ToolCategory {
  label: string;
  tools: Tool[];
}

const toolCategories: ToolCategory[] = [
  {
    label: "Edit & Annotate",
    tools: [
      { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
      { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
      { name: "Fill PDF Forms", href: "/fill-pdf", icon: FormInput },
      { name: "Annotate PDF", href: "/annotate-pdf", icon: MessageSquare },
      { name: "Highlight PDF", href: "/highlight-pdf", icon: Highlighter },
      { name: "Redact PDF", href: "/redact-pdf", icon: EyeOff },
    ],
  },
  {
    label: "Organize",
    tools: [
      { name: "Merge PDF", href: "/merge-pdf", icon: Layers },
      { name: "Split PDF", href: "/split-pdf", icon: Scissors },
      { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
    ],
  },
  {
    label: "Convert",
    tools: [
      { name: "Compress PDF", href: "/compress-pdf", icon: FileArchive },
      { name: "Flatten PDF", href: "/flatten-pdf", icon: FileOutput },
      { name: "OCR / Extract Text", href: "/ocr-pdf", icon: ScanText },
      { name: "Unlock PDF", href: "/unlock-pdf", icon: LockOpen },
    ],
  },
];

export function ToolsNavigation() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-muted/50">
          Tools
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {toolCategories.map((category, categoryIndex) => (
          <div key={category.label}>
            {categoryIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {category.label}
            </DropdownMenuLabel>
            {category.tools.map((tool) => (
              <DropdownMenuItem key={tool.href} asChild>
                <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                  <tool.icon className="w-4 h-4" />
                  {tool.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Keep for backward compatibility
export { toolCategories };
