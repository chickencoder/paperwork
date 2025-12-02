"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SignatureAnnotation } from "@/lib/pdf/types";

interface SignatureAnnotationOverlayProps {
  annotation: SignatureAnnotation;
  scale: number;
  cssScale?: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Omit<SignatureAnnotation, "id" | "page" | "dataUrl">>) => void;
  onRemove: () => void;
}

export function SignatureAnnotationOverlay({
  annotation,
  scale,
  cssScale = 1,
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

  // Effective scale combines the PDF render scale and CSS transform scale
  const effectiveScale = scale * cssScale;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isResizing) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - annotation.position.x * effectiveScale,
        y: e.clientY - annotation.position.y * effectiveScale,
      });
    },
    [isResizing, annotation.position, effectiveScale, onSelect]
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
      const newX = (e.clientX - dragStart.x) / effectiveScale;
      const newY = (e.clientY - dragStart.y) / effectiveScale;
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
  }, [isDragging, dragStart, effectiveScale, onUpdate]);

  // Handle resizing (maintain aspect ratio)
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizeStart.x) / effectiveScale;
      const deltaY = (e.clientY - resizeStart.y) / effectiveScale;

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
  }, [isResizing, resizeStart, effectiveScale, aspectRatio, onUpdate]);

  return (
    <div
      ref={containerRef}
      data-annotation="signature"
      className={cn(
        "absolute group",
        "transition-shadow duration-200",
        isSelected && "ring-2 ring-ring rounded"
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
            "absolute left-1/2",
            "flex items-center gap-1 px-2 py-1",
            "bg-popover rounded-md shadow-lg border border-border",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            "transition-colors z-50"
          )}
          style={{
            bottom: "100%",
            marginBottom: 8 / cssScale,
            transform: `translateX(-50%) scale(${1 / cssScale})`,
            transformOrigin: "center bottom",
          }}
          title="Delete signature"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Resize handle - bottom right corner */}
      {isSelected && (
        <div
          onMouseDown={handleResizeMouseDown}
          className={cn(
            "absolute",
            "w-4 h-4 rounded-full",
            "bg-primary hover:bg-primary/80",
            "cursor-se-resize",
            "transition-colors",
            "border-2 border-background shadow"
          )}
          style={{
            bottom: -6 / cssScale,
            right: -6 / cssScale,
            transform: `scale(${1 / cssScale})`,
            transformOrigin: "center center",
          }}
        />
      )}
    </div>
  );
}
