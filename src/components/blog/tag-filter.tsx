"use client";

import { motion } from "framer-motion";

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagChange(null)}
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
      </button>
      {tags.map((tag) => (
        <motion.button
          key={tag}
          onClick={() => onTagChange(tag)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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
        </motion.button>
      ))}
    </div>
  );
}
