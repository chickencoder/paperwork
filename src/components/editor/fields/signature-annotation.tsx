import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SignatureAnnotation } from "@/lib/pdf/types";

interface SignatureAnnotationOverlayProps {
  annotation: SignatureAnnotation;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Omit<SignatureAnnotation, "id" | "page" | "dataUrl">>) => void;
  onRemove: () => void;
}

export function SignatureAnnotationOverlay({
  annotation,
  scale,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: SignatureAnnotationOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectRatio = annotation.width / annotation.height;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isResizing) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - annotation.position.x * scale,
        y: e.clientY - annotation.position.y * scale,
      });
    },
    [isResizing, annotation.position, scale, onSelect]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: annotation.width,
        height: annotation.height,
      });
    },
    [annotation.width, annotation.height]
  );

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = (e.clientX - dragStart.x) / scale;
      const newY = (e.clientY - dragStart.y) / scale;
      onUpdate({ position: { x: Math.max(0, newX), y: Math.max(0, newY) } });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, scale, onUpdate]);

  // Handle resizing (maintain aspect ratio)
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizeStart.x) / scale;
      const deltaY = (e.clientY - resizeStart.y) / scale;

      // Use the larger delta to determine resize amount
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

      const newWidth = Math.max(40, resizeStart.width + delta);
      const newHeight = newWidth / aspectRatio;

      onUpdate({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart, scale, aspectRatio, onUpdate]);

  return (
    <div
      ref={containerRef}
      data-annotation="signature"
      className={cn(
        "absolute group",
        "transition-shadow duration-200",
        isSelected && "ring-2 ring-amber-400 rounded"
      )}
      style={{
        left: annotation.position.x * scale,
        top: annotation.position.y * scale,
        width: annotation.width * scale,
        height: annotation.height * scale,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 50 : 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Signature image */}
      <img
        src={annotation.dataUrl}
        alt="Signature"
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />

      {/* Delete button - shows when selected */}
      {isSelected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute -top-8 left-1/2 -translate-x-1/2",
            "flex items-center gap-1 px-2 py-1",
            "bg-white rounded-md shadow-lg border border-stone-200",
            "text-stone-600 hover:text-red-600 hover:bg-red-50",
            "transition-colors z-50"
          )}
          title="Delete signature"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Resize handle - bottom right corner */}
      {isSelected && (
        <div
          onMouseDown={handleResizeMouseDown}
          className={cn(
            "absolute -bottom-1.5 -right-1.5",
            "w-4 h-4 rounded-full",
            "bg-amber-400 hover:bg-amber-500",
            "cursor-se-resize",
            "transition-colors",
            "border-2 border-white shadow"
          )}
        />
      )}
    </div>
  );
}
