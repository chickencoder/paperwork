"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrikethroughAnnotation, StrikethroughColor } from "@/lib/pdf/types";

const COLOR_MAP: Record<StrikethroughColor, { base: string; selected: string; hover: string }> = {
  red: { base: "bg-red-500", selected: "bg-red-600", hover: "bg-red-600" },
  black: { base: "bg-stone-800", selected: "bg-stone-900", hover: "bg-stone-900" },
};

interface StrikethroughOverlayProps {
  annotation: StrikethroughAnnotation;
  scale: number;
  cssScale?: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const StrikethroughOverlay = memo(function StrikethroughOverlay({
  annotation,
  scale,
  cssScale = 1,
  isSelected,
  onSelect,
  onRemove,
}: StrikethroughOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get the bounds of all rects for positioning the delete button
  const bounds = annotation.rects.reduce(
    (acc, rect) => ({
      minX: Math.min(acc.minX, rect.x),
      minY: Math.min(acc.minY, rect.y),
      maxX: Math.max(acc.maxX, rect.x + rect.width),
      maxY: Math.max(acc.maxY, rect.y + rect.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const centerX = (bounds.minX + bounds.maxX) / 2;

  // Cleanup timeout on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Delay hiding to allow moving to the delete button
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const showControls = isSelected || isHovered;

  return (
    <div
      data-annotation="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: showControls ? 15 : 10 }}
    >
      {/* Render each strikethrough line */}
      {annotation.rects.map((rect, index) => (
        <div
          key={index}
          className="absolute pointer-events-auto cursor-pointer"
          style={{
            left: rect.x * scale,
            top: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* The strikethrough line itself */}
          <div
            className={cn(
              "absolute left-0 right-0 top-1/2 -translate-y-1/2",
              "h-[2px] transition-all duration-150",
              COLOR_MAP[annotation.color].base,
              isSelected && cn("h-[3px]", COLOR_MAP[annotation.color].selected),
              isHovered && !isSelected && COLOR_MAP[annotation.color].hover
            )}
          />
          {/* Invisible hit area for selection */}
          <div
            className={cn(
              "absolute inset-0",
              isSelected && "ring-2 ring-ring ring-offset-1 rounded-sm",
              isHovered && !isSelected && "ring-1 ring-ring/60 rounded-sm"
            )}
          />
        </div>
      ))}

      {/* Delete button - appears when selected or hovered */}
      {showControls && (
        <div
          className={cn(
            "absolute pointer-events-auto",
            "flex items-center justify-center",
            "bg-popover rounded-full shadow-lg border border-border",
            "w-8 h-8"
          )}
          style={{
            left: centerX * scale,
            top: bounds.minY * scale - 40 * cssScale,
            transform: `translateX(-50%) scale(${1 / cssScale})`,
            transformOrigin: "center bottom",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={cn(
              "flex items-center justify-center w-full h-full rounded-full",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-colors"
            )}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});
