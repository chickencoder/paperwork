"use client";

import { useState, useEffect, useRef } from "react";
import { Highlighter, Strikethrough, ChevronDown, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HighlightColor, StrikethroughColor } from "@/lib/pdf/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Note: These are intentionally hardcoded Tailwind colors for the highlighting feature
// They represent specific highlight marker colors, not design system colors
const HIGHLIGHT_COLORS: { color: HighlightColor; bg: string; label: string }[] = [
  { color: "yellow", bg: "bg-yellow-300", label: "Yellow" },
  { color: "green", bg: "bg-green-300", label: "Green" },
  { color: "blue", bg: "bg-blue-300", label: "Blue" },
  { color: "pink", bg: "bg-pink-300", label: "Pink" },
  { color: "orange", bg: "bg-orange-300", label: "Orange" },
];

const STRIKETHROUGH_COLORS: { color: StrikethroughColor; bg: string; label: string }[] = [
  { color: "red", bg: "bg-red-500", label: "Red" },
  { color: "black", bg: "bg-stone-800", label: "Black" },
];

interface SelectionToolbarProps {
  position: { x: number; y: number };
  onHighlight: (color: HighlightColor) => void;
  onStrikethrough: (color: StrikethroughColor) => void;
  onRedact: () => void;
}

export function SelectionToolbar({
  position,
  onHighlight,
  onStrikethrough,
  onRedact,
}: SelectionToolbarProps) {
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showStrikethroughPicker, setShowStrikethroughPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Update position directly via DOM, including on scroll
  useEffect(() => {
    const updatePosition = () => {
      if (!toolbarRef.current) return;

      // Get fresh position from the current selection
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const rects = Array.from(range.getClientRects()).filter(r => r.width > 1 && r.height > 1);
      if (rects.length === 0) return;

      const firstRect = rects[0];
      toolbarRef.current.style.left = `${firstRect.left + firstRect.width / 2}px`;
      toolbarRef.current.style.top = `${firstRect.top - 44}px`;
    };

    // Initial position from props
    if (toolbarRef.current) {
      toolbarRef.current.style.left = `${position.x}px`;
      toolbarRef.current.style.top = `${position.y - 44}px`;
    }

    // Update on scroll - direct DOM manipulation, no React state
    window.addEventListener("scroll", updatePosition, true);
    return () => window.removeEventListener("scroll", updatePosition, true);
  }, [position]);

  // Close dropdowns when clicking outside
  const closeDropdowns = () => {
    setShowHighlightPicker(false);
    setShowStrikethroughPicker(false);
  };

  // Prevent clicks from clearing selection
  const preventSelectionLoss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <TooltipProvider>
      <div
        ref={toolbarRef}
        className="fixed z-[100]"
        style={{
          left: position.x,
          top: position.y - 44,
          transform: "translateX(-50%)",
        }}
        onMouseDown={preventSelectionLoss}
        onClick={preventSelectionLoss}
      >
        <div className="flex items-center gap-0.5 px-2 py-1 bg-popover rounded-full shadow-lg border border-border">
          {/* Highlight button with color picker */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                    showHighlightPicker && "bg-accent text-foreground"
                  )}
                  onMouseDown={preventSelectionLoss}
                  onClick={(e) => {
                    preventSelectionLoss(e);
                    setShowHighlightPicker(!showHighlightPicker);
                    setShowStrikethroughPicker(false);
                  }}
                >
                  <Highlighter className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Highlight</TooltipContent>
            </Tooltip>

            {/* Highlight color picker dropdown */}
            {showHighlightPicker && (
              <div
                className="absolute top-full left-0 mt-1 p-1.5 bg-popover rounded-full shadow-lg border border-border flex gap-1"
                onMouseDown={preventSelectionLoss}
                onClick={preventSelectionLoss}
              >
                {HIGHLIGHT_COLORS.map(({ color, bg, label }) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform hover:scale-110",
                      bg
                    )}
                    onMouseDown={preventSelectionLoss}
                    onClick={(e) => {
                      preventSelectionLoss(e);
                      onHighlight(color);
                      closeDropdowns();
                    }}
                    title={label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Strikethrough button with color picker */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors",
                    "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                    showStrikethroughPicker && "bg-destructive/10 text-destructive"
                  )}
                  onMouseDown={preventSelectionLoss}
                  onClick={(e) => {
                    preventSelectionLoss(e);
                    setShowStrikethroughPicker(!showStrikethroughPicker);
                    setShowHighlightPicker(false);
                  }}
                >
                  <Strikethrough className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Strikethrough</TooltipContent>
            </Tooltip>

            {/* Strikethrough color picker dropdown */}
            {showStrikethroughPicker && (
              <div
                className="absolute top-full right-0 mt-1 p-1.5 bg-popover rounded-full shadow-lg border border-border flex gap-1"
                onMouseDown={preventSelectionLoss}
                onClick={preventSelectionLoss}
              >
                {STRIKETHROUGH_COLORS.map(({ color, bg, label }) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform hover:scale-110",
                      bg
                    )}
                    onMouseDown={preventSelectionLoss}
                    onClick={(e) => {
                      preventSelectionLoss(e);
                      onStrikethrough(color);
                      closeDropdowns();
                    }}
                    title={label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Redact button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors",
                  "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                )}
                onMouseDown={preventSelectionLoss}
                onClick={(e) => {
                  preventSelectionLoss(e);
                  onRedact();
                  closeDropdowns();
                }}
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Redact</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
