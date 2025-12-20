"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@paperwork/ui/utils";
import type { RedactionAnnotation } from "@paperwork/pdf-lib/types";

interface RedactionOverlayProps {
  annotation: RedactionAnnotation;
  scale: number;
  cssScale?: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const RedactionOverlay = memo(function RedactionOverlay({
  annotation,
  scale,
  cssScale = 1,
  isSelected,
  onSelect,
  onRemove,
}: RedactionOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get the bounds of all rects for positioning the buttons
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
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const showControls = isSelected || isHovered;

  return (
    <div
      data-annotation="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: showControls ? 15 : 11 }}
    >
      {/* Render each redaction rect */}
      {annotation.rects.map((rect, index) => (
        <div
          key={index}
          className={cn(
            "absolute pointer-events-auto cursor-pointer rounded-sm",
            "transition-all duration-150",
            annotation.enabled
              ? "bg-black"
              : "bg-black/20 border-2 border-dashed border-black/40",
            isSelected && "ring-2 ring-destructive ring-offset-1",
            isHovered && !isSelected && "ring-1 ring-destructive/60"
          )}
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
        />
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
