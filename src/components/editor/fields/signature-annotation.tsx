"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Trash2, RotateCw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SignatureAnnotation, SignatureColor } from "@/lib/pdf/types";

// Color options for signatures
const SIGNATURE_COLOR_OPTIONS: { color: SignatureColor; hex: string; label: string }[] = [
  { color: "black", hex: "#1a1a1a", label: "Black" },
  { color: "navy", hex: "#1a3380", label: "Navy" },
  { color: "blue", hex: "#3366cc", label: "Blue" },
  { color: "dark-red", hex: "#991a1a", label: "Dark Red" },
  { color: "dark-green", hex: "#1a6633", label: "Dark Green" },
  { color: "purple", hex: "#8033a6", label: "Purple" },
];

// Helper to get hex color from color key
export function getSignatureColorHex(colorKey: SignatureColor): string {
  return SIGNATURE_COLOR_OPTIONS.find((c) => c.color === colorKey)?.hex ?? "#1a1a1a";
}

// CSS filter to colorize a black image to a target color
// This uses a combination of filters to recolor black content
function getColorFilter(hex: string): string {
  // For black, no filter needed
  if (hex === "#1a1a1a" || hex === "#000000") {
    return "none";
  }

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Use SVG filter approach via CSS - we'll use brightness and sepia with hue-rotate
  // This is an approximation that works well for signature coloring
  const brightness = Math.max(r, g, b);
  const sepia = brightness > 0.5 ? 1 : 0.5;

  // Calculate hue rotation based on target color
  // Red = 0deg, Green = 120deg, Blue = 240deg
  let hue = 0;
  if (r >= g && r >= b) {
    // Red-ish
    hue = g > b ? (g - b) / (r - Math.min(g, b)) * 60 : 360 - (b - g) / (r - Math.min(g, b)) * 60;
  } else if (g >= r && g >= b) {
    // Green-ish
    hue = 120 + (b - r) / (g - Math.min(r, b)) * 60;
  } else {
    // Blue-ish
    hue = 240 + (r - g) / (b - Math.min(r, g)) * 60;
  }

  // Handle NaN from division
  if (isNaN(hue)) hue = 0;

  // Saturation based on color intensity
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max > 0 ? ((max - min) / max) * 100 + 100 : 100;

  return `brightness(0) saturate(100%) invert(${Math.round(brightness * 30)}%) sepia(${Math.round(sepia * 100)}%) saturate(${Math.round(saturation * 10)}%) hue-rotate(${Math.round(hue)}deg)`;
}

interface SignatureAnnotationOverlayProps {
  annotation: SignatureAnnotation;
  scale: number;
  cssScale?: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Omit<SignatureAnnotation, "id" | "page" | "dataUrl">>) => void;
  onRemove: () => void;
}

export const SignatureAnnotationOverlay = memo(function SignatureAnnotationOverlay({
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
  const [isRotating, setIsRotating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotateStart, setRotateStart] = useState({ angle: 0, startAngle: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const aspectRatio = annotation.width / annotation.height;

  // Effective scale combines the PDF render scale and CSS transform scale
  const effectiveScale = scale * cssScale;

  // Get rotation value (default to 0)
  const rotation = annotation.rotation ?? 0;

  // Get color value (default to black)
  const color = annotation.color ?? "black";
  const colorHex = getSignatureColorHex(color);

  // Close color picker when clicking outside
  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

  // Unified handler for both mouse and touch
  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (isResizing || isRotating) return;
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: clientX - annotation.position.x * effectiveScale,
        y: clientY - annotation.position.y * effectiveScale,
      });
    },
    [isResizing, isRotating, annotation.position, effectiveScale, onSelect]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isResizing || isRotating) return;
      e.preventDefault();
      e.stopPropagation();
      handleDragStart(e.clientX, e.clientY);
    },
    [isResizing, isRotating, handleDragStart]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isResizing || isRotating) return;
      e.stopPropagation();
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    },
    [isResizing, isRotating, handleDragStart]
  );

  // Get center of the element for rotation calculations
  const getElementCenter = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  // Rotation handlers
  const handleRotateStart = useCallback(
    (clientX: number, clientY: number) => {
      const center = getElementCenter();
      const startAngle = Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
      setIsRotating(true);
      setRotateStart({
        angle: rotation,
        startAngle,
      });
    },
    [getElementCenter, rotation]
  );

  const handleRotateMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleRotateStart(e.clientX, e.clientY);
    },
    [handleRotateStart]
  );

  const handleRotateTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      handleRotateStart(touch.clientX, touch.clientY);
    },
    [handleRotateStart]
  );

  // Unified resize handler
  const handleResizeStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsResizing(true);
      setResizeStart({
        x: clientX,
        y: clientY,
        width: annotation.width,
        height: annotation.height,
      });
    },
    [annotation.width, annotation.height]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleResizeStart(e.clientX, e.clientY);
    },
    [handleResizeStart]
  );

  const handleResizeTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      handleResizeStart(touch.clientX, touch.clientY);
    },
    [handleResizeStart]
  );

  // Handle dragging (mouse and touch)
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      const newX = (clientX - dragStart.x) / effectiveScale;
      const newY = (clientY - dragStart.y) / effectiveScale;
      onUpdate({ position: { x: Math.max(0, newX), y: Math.max(0, newY) } });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragStart, effectiveScale, onUpdate]);

  // Handle resizing (maintain aspect ratio, mouse and touch)
  useEffect(() => {
    if (!isResizing) return;

    const handleResize = (clientX: number, clientY: number) => {
      const deltaX = (clientX - resizeStart.x) / effectiveScale;
      const deltaY = (clientY - resizeStart.y) / effectiveScale;

      // Use the larger delta to determine resize amount
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

      const newWidth = Math.max(40, resizeStart.width + delta);
      const newHeight = newWidth / aspectRatio;

      onUpdate({ width: newWidth, height: newHeight });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleResize(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleResize(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isResizing, resizeStart, effectiveScale, aspectRatio, onUpdate]);

  // Handle rotation (mouse and touch)
  useEffect(() => {
    if (!isRotating) return;

    const handleRotate = (clientX: number, clientY: number) => {
      const center = getElementCenter();
      const currentAngle = Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
      const deltaAngle = currentAngle - rotateStart.startAngle;
      let newRotation = (rotateStart.angle + deltaAngle) % 360;
      if (newRotation < 0) newRotation += 360;

      onUpdate({ rotation: Math.round(newRotation) });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleRotate(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleRotate(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsRotating(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isRotating, rotateStart, getElementCenter, onUpdate]);

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
        cursor: isDragging ? "grabbing" : isRotating ? "grabbing" : "grab",
        zIndex: isSelected ? 50 : 10,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: "center center",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Signature image */}
      <img
        src={annotation.dataUrl}
        alt="Signature"
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
        style={{
          filter: getColorFilter(colorHex),
        }}
      />

      {/* Rotation handle - shows when selected */}
      {isSelected && (
        <div
          className="absolute left-1/2 flex flex-col items-center"
          style={{
            top: -40 / cssScale,
            transform: `translateX(-50%) scale(${1 / cssScale}) rotate(${-rotation}deg)`,
            transformOrigin: "center bottom",
          }}
        >
          {/* Connector line */}
          <div className="w-px h-4 bg-border" />
          {/* Rotation handle */}
          <div
            onMouseDown={handleRotateMouseDown}
            onTouchStart={handleRotateTouchStart}
            className={cn(
              "w-5 h-5 rounded-full",
              "bg-popover hover:bg-accent",
              "border-2 border-border shadow",
              "cursor-grab active:cursor-grabbing",
              "flex items-center justify-center",
              "touch-none"
            )}
            title={`Rotation: ${rotation}°`}
          >
            <RotateCw className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Toolbar - shows when selected */}
      {isSelected && (
        <div
          className={cn(
            "absolute left-1/2",
            "flex items-center gap-1 px-2 py-1.5",
            "bg-popover rounded-full shadow-lg border border-border",
            "z-50"
          )}
          style={{
            bottom: "100%",
            marginBottom: 48 / cssScale,
            transform: `translateX(-50%) scale(${1 / cssScale}) rotate(${-rotation}deg)`,
            transformOrigin: "center bottom",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Color Picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className={cn(
                "flex items-center gap-1 p-1.5 rounded-full hover:bg-accent",
                "text-muted-foreground hover:text-foreground",
                "transition-colors"
              )}
              title="Signature color"
            >
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: colorHex }}
              />
              <ChevronDown className="w-3 h-3" />
            </button>

            {showColorPicker && (
              <div
                className={cn(
                  "absolute top-full left-0 mt-1 p-3",
                  "bg-popover rounded-xl shadow-lg border border-border",
                  "z-[60]"
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-3 gap-2" style={{ width: 96 }}>
                  {SIGNATURE_COLOR_OPTIONS.map(({ color: c, hex, label }) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full transition-transform hover:scale-110",
                        color === c && "ring-2 ring-ring ring-offset-1 ring-offset-popover"
                      )}
                      style={{ backgroundColor: hex }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ color: c });
                        setShowColorPicker(false);
                      }}
                      title={label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              "p-1.5 rounded-full hover:bg-destructive/10",
              "text-muted-foreground hover:text-destructive",
              "transition-colors"
            )}
            title="Delete signature"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Resize handle - bottom right corner */}
      {isSelected && (
        <div
          onMouseDown={handleResizeMouseDown}
          onTouchStart={handleResizeTouchStart}
          className={cn(
            "absolute",
            "w-4 h-4 md:w-4 md:h-4 w-6 h-6 rounded-full",
            "bg-primary hover:bg-primary/80",
            "cursor-se-resize",
            "transition-colors",
            "border-2 border-white shadow",
            "touch-none"
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
});
