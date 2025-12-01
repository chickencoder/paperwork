import { useState, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HighlightAnnotation, HighlightColor } from "@/lib/pdf/types";

const COLOR_MAP: Record<HighlightColor, string> = {
  yellow: "bg-yellow-300/50",
  green: "bg-green-300/50",
  blue: "bg-blue-300/50",
  pink: "bg-pink-300/50",
  orange: "bg-orange-300/50",
};

interface HighlightOverlayProps {
  annotation: HighlightAnnotation;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function HighlightOverlay({
  annotation,
  scale,
  isSelected,
  onSelect,
  onRemove,
}: HighlightOverlayProps) {
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
      {/* Render each highlight rect */}
      {annotation.rects.map((rect, index) => (
        <div
          key={index}
          className={cn(
            "absolute pointer-events-auto cursor-pointer transition-all duration-150 rounded-sm",
            COLOR_MAP[annotation.color],
            isSelected && "ring-2 ring-amber-400 ring-offset-1",
            isHovered && !isSelected && "ring-1 ring-amber-300"
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
            "absolute pointer-events-auto -translate-x-1/2",
            "flex items-center justify-center",
            "bg-white rounded shadow-lg border border-stone-200",
            "w-5 h-5"
          )}
          style={{
            left: centerX * scale,
            top: bounds.minY * scale - 24,
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
              "flex items-center justify-center w-full h-full rounded",
              "text-stone-500 hover:text-red-600 hover:bg-red-50",
              "transition-colors"
            )}
            title="Delete"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
