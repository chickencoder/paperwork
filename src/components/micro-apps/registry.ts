import {
  FileArchive,
  Languages,
  Scissors,
  LockOpen,
  FileOutput,
  RotateCw,
} from "lucide-react";
import { MicroApp } from "./types";

/**
 * Registry of all available micro apps.
 * Add new micro apps here to make them available in the toolbar.
 */
export const microApps: MicroApp[] = [
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    icon: FileArchive,
    category: "transform",
    requiresDocument: true,
    keywords: ["shrink", "reduce", "size", "smaller", "optimize"],
  },
  {
    id: "translate-pdf",
    name: "Translate PDF",
    description: "Translate document to another language",
    icon: Languages,
    category: "transform",
    requiresDocument: true,
    keywords: ["language", "convert", "localize", "translation"],
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Extract pages or split into multiple files",
    icon: Scissors,
    category: "organize",
    requiresDocument: true,
    keywords: ["extract", "pages", "separate", "divide"],
  },
  {
    id: "unlock-pdf",
    name: "Unlock PDF",
    description: "Remove password protection from PDF",
    icon: LockOpen,
    category: "security",
    requiresDocument: true,
    keywords: ["password", "remove", "decrypt", "unprotect"],
  },
  {
    id: "flatten-pdf",
    name: "Flatten PDF",
    description: "Convert pages to images, make annotations permanent",
    icon: FileOutput,
    category: "transform",
    requiresDocument: true,
    keywords: ["rasterize", "image", "permanent", "non-editable"],
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate pages 90°, 180°, or 270°",
    icon: RotateCw,
    category: "organize",
    requiresDocument: true,
    keywords: ["turn", "orientation", "landscape", "portrait"],
  },
];

/**
 * Get a micro app by its ID
 */
export function getMicroApp(id: string): MicroApp | undefined {
  return microApps.find((app) => app.id === id);
}

/**
 * Get micro apps by category
 */
export function getMicroAppsByCategory(
  category: MicroApp["category"]
): MicroApp[] {
  return microApps.filter((app) => app.category === category);
}

/**
 * Search micro apps by query string
 */
export function searchMicroApps(query: string): MicroApp[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return microApps;

  return microApps.filter((app) => {
    const searchText = [
      app.name,
      app.description,
      ...(app.keywords || []),
    ]
      .join(" ")
      .toLowerCase();
    return searchText.includes(lowerQuery);
  });
}
