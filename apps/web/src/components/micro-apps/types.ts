import { LucideIcon } from "lucide-react";

export interface MicroApp {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: MicroAppCategory;
  /** Whether the micro app requires an open document */
  requiresDocument?: boolean;
  /** Keywords for search matching */
  keywords?: string[];
}

export type MicroAppCategory =
  | "transform"
  | "organize"
  | "convert"
  | "security";

export const categoryLabels: Record<MicroAppCategory, string> = {
  transform: "Transform",
  organize: "Organize",
  convert: "Convert",
  security: "Security",
};
