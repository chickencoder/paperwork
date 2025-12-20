"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Trash2, Minus, Plus, RotateCw } from "lucide-react";
import { cn } from "@paperwork/ui/utils";
import type { ShapeAnnotation, ShapeColor } from "@paperwork/pdf-lib/types";

// Color palette for shape annotations - includes transparent
const SHAPE_COLOR_OPTIONS: { color: ShapeColor; hex: string; label: string }[] = [
  { color: "transparent", hex: "transparent", label: "None" },
  // Grayscale
  { color: "black", hex: "#1a1a1a", label: "Black" },
  { color: "dark-gray", hex: "#4d4d4d", label: "Dark Gray" },
  { color: "gray", hex: "#808080", label: "Gray" },
  { color: "light-gray", hex: "#b3b3b3", label: "Light Gray" },
  // Blues
  { color: "navy", hex: "#1a3380", label: "Navy" },
  { color: "blue", hex: "#3366cc", label: "Blue" },
  { color: "sky", hex: "#66a6e6", label: "Sky" },
  // Reds
  { color: "dark-red", hex: "#991a1a", label: "Dark Red" },
  { color: "red", hex: "#d93333", label: "Red" },
  { color: "coral", hex: "#f2664d", label: "Coral" },
  // Greens
  { color: "dark-green", hex: "#1a6633", label: "Dark Green" },
  { color: "green", hex: "#339959", label: "Green" },
  { color: "teal", hex: "#338c8c", label: "Teal" },
  // Warm
  { color: "brown", hex: "#804d33", label: "Brown" },
  { color: "orange", hex: "#f28019", label: "Orange" },
  { color: "amber", hex: "#f2b326", label: "Amber" },
  // Cool
  { color: "purple", hex: "#8033a6", label: "Purple" },
  { color: "pink", hex: "#e6668c", label: "Pink" },
  { color: "magenta", hex: "#cc338c", label: "Magenta" },
];

// Helper to get hex color from color key
export function getShapeColorHex(colorKey: ShapeColor): string {
  return SHAPE_COLOR_OPTIONS.find((c) => c.color === colorKey)?.hex ?? "#1a1a1a";
}

interface ShapeAnnotationOverlayProps {
  annotation: ShapeAnnotation;
  scale: number;
  cssScale?: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Omit<ShapeAnnotation, "id" | "page">>) => void;
  onRemove: () => void;
}

export const ShapeAnnotationOverlay = memo(function ShapeAnnotationOverlay({
  annotation,
  scale,
  cssScale = 1,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: ShapeAnnotationOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const [rotateStart, setRotateStart] = useState({ angle: 0, startAngle: 0 });
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fillColorPickerRef = useRef<HTMLDivElement>(null);
  const strokeColorPickerRef = useRef<HTMLDivElement>(null);

  // Effective scale combines the PDF render scale and CSS transform scale
  const effectiveScale = scale * cssScale;

  // For lines/arrows, width/height represent the delta to the end point
  const isLine = annotation.shapeType === "line" || annotation.shapeType === "arrow";

  // Calculate display dimensions (always positive)
  const displayWidth = Math.abs(annotation.width);
  const displayHeight = Math.abs(annotation.height);

  // Get rotation value (default to 0)
  const rotation = annotation.rotation ?? 0;

  // Click outside to close color pickers
  useEffect(() => {
    if (!showFillColorPicker && !showStrokeColorPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        fillColorPickerRef.current &&
        !fillColorPickerRef.current.contains(e.target as Node)
      ) {
        setShowFillColorPicker(false);
      }
      if (
        strokeColorPickerRef.current &&
        !strokeColorPickerRef.current.contains(e.target as Node)
      ) {
        setShowStrokeColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFillColorPicker, showStrokeColorPicker]);

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

  // Get center of the shape for rotation calculations
  const getShapeCenter = useCallback(() => {
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
      const center = getShapeCenter();
      const startAngle = Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
      setIsRotating(true);
      setRotateStart({
        angle: rotation,
        startAngle,
      });
    },
    [getShapeCenter, rotation]
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

  // Unified resize handler for shapes
  const handleResizeStart = useCallback(
    (clientX: number, clientY: number, handle: string) => {
      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStart({
        x: clientX,
        y: clientY,
        width: annotation.width,
        height: annotation.height,
        posX: annotation.position.x,
        posY: annotation.position.y,
      });
    },
    [annotation.width, annotation.height, annotation.position]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();
      handleResizeStart(e.clientX, e.clientY, handle);
    },
    [handleResizeStart]
  );

  const handleResizeTouchStart = useCallback(
    (e: React.TouchEvent, handle: string) => {
      e.stopPropagation();
      const touch = e.touches[0];
      handleResizeStart(touch.clientX, touch.clientY, handle);
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

  // Handle resizing (mouse and touch)
  useEffect(() => {
    if (!isResizing || !resizeHandle) return;

    const handleResize = (clientX: number, clientY: number) => {
      const deltaX = (clientX - resizeStart.x) / effectiveScale;
      const deltaY = (clientY - resizeStart.y) / effectiveScale;

      if (isLine) {
        // For lines/arrows, we're moving the endpoint
        if (resizeHandle === "end") {
          onUpdate({
            width: resizeStart.width + deltaX,
            height: resizeStart.height + deltaY,
          });
        } else if (resizeHandle === "start") {
          onUpdate({
            position: {
              x: resizeStart.posX + deltaX,
              y: resizeStart.posY + deltaY,
            },
            width: resizeStart.width - deltaX,
            height: resizeStart.height - deltaY,
          });
        }
      } else {
        // For rectangles/ellipses, handle corner and edge resizing
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newPosX = resizeStart.posX;
        let newPosY = resizeStart.posY;

        if (resizeHandle.includes("e")) {
          newWidth = Math.max(20, resizeStart.width + deltaX);
        }
        if (resizeHandle.includes("w")) {
          const widthDelta = Math.min(deltaX, resizeStart.width - 20);
          newWidth = resizeStart.width - widthDelta;
          newPosX = resizeStart.posX + widthDelta;
        }
        if (resizeHandle.includes("s")) {
          newHeight = Math.max(20, resizeStart.height + deltaY);
        }
        if (resizeHandle.includes("n")) {
          const heightDelta = Math.min(deltaY, resizeStart.height - 20);
          newHeight = resizeStart.height - heightDelta;
          newPosY = resizeStart.posY + heightDelta;
        }

        onUpdate({
          position: { x: newPosX, y: newPosY },
          width: newWidth,
          height: newHeight,
        });
      }
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
      setResizeHandle(null);
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
  }, [isResizing, resizeHandle, resizeStart, effectiveScale, isLine, onUpdate]);

  // Handle rotation (mouse and touch)
  useEffect(() => {
    if (!isRotating) return;

    const handleRotate = (clientX: number, clientY: number) => {
      const center = getShapeCenter();
      const currentAngle = Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
      const deltaAngle = currentAngle - rotateStart.startAngle;
      let newRotation = (rotateStart.angle + deltaAngle) % 360;
      if (newRotation < 0) newRotation += 360;

      // Snap to 15-degree increments when holding shift (handled by rounding)
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
  }, [isRotating, rotateStart, getShapeCenter, onUpdate]);

  // Render the shape SVG
  const renderShape = () => {
    const fillHex = getShapeColorHex(annotation.fillColor);
    const strokeHex = getShapeColorHex(annotation.strokeColor);
    const fillStyle = annotation.fillColor === "transparent" ? "none" : fillHex;
    const strokeStyle = annotation.strokeColor === "transparent" ? "none" : strokeHex;
    const opacity = annotation.opacity / 100;

    if (isLine) {
      // For lines/arrows, width/height represent the delta
      const svgWidth = Math.abs(annotation.width) + annotation.strokeWidth * 2;
      const svgHeight = Math.abs(annotation.height) + annotation.strokeWidth * 2;
      const padding = annotation.strokeWidth;

      // Calculate line coordinates within the SVG
      const x1 = annotation.width >= 0 ? padding : svgWidth - padding;
      const y1 = annotation.height >= 0 ? padding : svgHeight - padding;
      const x2 = annotation.width >= 0 ? svgWidth - padding : padding;
      const y2 = annotation.height >= 0 ? svgHeight - padding : padding;

      return (
        <svg
          width={svgWidth * scale}
          height={svgHeight * scale}
          className="overflow-visible pointer-events-none"
          style={{ opacity }}
        >
          {annotation.shapeType === "arrow" && (
            <defs>
              <marker
                id={`arrowhead-${annotation.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={strokeStyle}
                />
              </marker>
            </defs>
          )}
          <line
            x1={x1 * scale}
            y1={y1 * scale}
            x2={x2 * scale}
            y2={y2 * scale}
            stroke={strokeStyle}
            strokeWidth={annotation.strokeWidth * scale}
            markerEnd={annotation.shapeType === "arrow" ? `url(#arrowhead-${annotation.id})` : undefined}
          />
        </svg>
      );
    }

    // Rectangle or Ellipse
    const padding = annotation.strokeWidth / 2;
    const svgWidth = displayWidth + annotation.strokeWidth;
    const svgHeight = displayHeight + annotation.strokeWidth;

    return (
      <svg
        width={svgWidth * scale}
        height={svgHeight * scale}
        className="overflow-visible pointer-events-none"
        style={{ opacity }}
      >
        {annotation.shapeType === "rectangle" && (
          <rect
            x={padding * scale}
            y={padding * scale}
            width={displayWidth * scale}
            height={displayHeight * scale}
            fill={fillStyle}
            stroke={strokeStyle}
            strokeWidth={annotation.strokeWidth * scale}
          />
        )}
        {annotation.shapeType === "ellipse" && (
          <ellipse
            cx={(displayWidth / 2 + padding) * scale}
            cy={(displayHeight / 2 + padding) * scale}
            rx={(displayWidth / 2) * scale}
            ry={(displayHeight / 2) * scale}
            fill={fillStyle}
            stroke={strokeStyle}
            strokeWidth={annotation.strokeWidth * scale}
          />
        )}
        {annotation.shapeType === "triangle" && (
          <polygon
            points={`
              ${(displayWidth / 2 + padding) * scale},${padding * scale}
              ${(displayWidth + padding) * scale},${(displayHeight + padding) * scale}
              ${padding * scale},${(displayHeight + padding) * scale}
            `}
            fill={fillStyle}
            stroke={strokeStyle}
            strokeWidth={annotation.strokeWidth * scale}
            strokeLinejoin="round"
          />
        )}
        {annotation.shapeType === "hexagon" && (() => {
          const cx = (displayWidth / 2 + padding) * scale;
          const cy = (displayHeight / 2 + padding) * scale;
          const rx = (displayWidth / 2) * scale;
          const ry = (displayHeight / 2) * scale;
          // Generate hexagon points
          const points = Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
          }).join(" ");
          return (
            <polygon
              points={points}
              fill={fillStyle}
              stroke={strokeStyle}
              strokeWidth={annotation.strokeWidth * scale}
              strokeLinejoin="round"
            />
          );
        })()}
        {annotation.shapeType === "star" && (() => {
          const cx = (displayWidth / 2 + padding) * scale;
          const cy = (displayHeight / 2 + padding) * scale;
          const outerRx = (displayWidth / 2) * scale;
          const outerRy = (displayHeight / 2) * scale;
          const innerRx = outerRx * 0.4;
          const innerRy = outerRy * 0.4;
          // Generate 5-pointed star
          const points = Array.from({ length: 10 }, (_, i) => {
            const angle = (i * 36 - 90) * (Math.PI / 180);
            const isOuter = i % 2 === 0;
            const rx = isOuter ? outerRx : innerRx;
            const ry = isOuter ? outerRy : innerRy;
            return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
          }).join(" ");
          return (
            <polygon
              points={points}
              fill={fillStyle}
              stroke={strokeStyle}
              strokeWidth={annotation.strokeWidth * scale}
              strokeLinejoin="round"
            />
          );
        })()}
        {annotation.shapeType === "callout" && (() => {
          const w = displayWidth * scale;
          const h = displayHeight * scale;
          const p = padding * scale;
          const r = Math.min(8 * scale, w / 4, h / 4); // corner radius
          const tailWidth = Math.min(20 * scale, w / 3);
          const tailHeight = Math.min(15 * scale, h / 3);
          // Rounded rectangle with tail pointing down-left
          const path = `
            M ${p + r} ${p}
            H ${p + w - r}
            Q ${p + w} ${p} ${p + w} ${p + r}
            V ${p + h - r}
            Q ${p + w} ${p + h} ${p + w - r} ${p + h}
            H ${p + tailWidth + 10 * scale}
            L ${p} ${p + h + tailHeight}
            L ${p + tailWidth} ${p + h}
            H ${p + r}
            Q ${p} ${p + h} ${p} ${p + h - r}
            V ${p + r}
            Q ${p} ${p} ${p + r} ${p}
            Z
          `;
          return (
            <path
              d={path}
              fill={fillStyle}
              stroke={strokeStyle}
              strokeWidth={annotation.strokeWidth * scale}
              strokeLinejoin="round"
            />
          );
        })()}
      </svg>
    );
  };

  // Calculate bounding box position for lines and callouts
  const getContainerStyle = () => {
    if (isLine) {
      const minX = Math.min(0, annotation.width);
      const minY = Math.min(0, annotation.height);
      return {
        left: (annotation.position.x + minX - annotation.strokeWidth) * scale,
        top: (annotation.position.y + minY - annotation.strokeWidth) * scale,
        width: (Math.abs(annotation.width) + annotation.strokeWidth * 2) * scale,
        height: (Math.abs(annotation.height) + annotation.strokeWidth * 2) * scale,
      };
    }
    if (annotation.shapeType === "callout") {
      // Callout has a tail that extends below
      const tailHeight = Math.min(15, displayHeight / 3);
      return {
        left: (annotation.position.x - annotation.strokeWidth / 2) * scale,
        top: (annotation.position.y - annotation.strokeWidth / 2) * scale,
        width: (displayWidth + annotation.strokeWidth) * scale,
        height: (displayHeight + annotation.strokeWidth + tailHeight) * scale,
      };
    }
    return {
      left: (annotation.position.x - annotation.strokeWidth / 2) * scale,
      top: (annotation.position.y - annotation.strokeWidth / 2) * scale,
      width: (displayWidth + annotation.strokeWidth) * scale,
      height: (displayHeight + annotation.strokeWidth) * scale,
    };
  };

  // Render resize handles for rect/ellipse
  const renderRectResizeHandles = () => {
    if (isLine || !isSelected) return null;

    const handles = [
      { pos: "nw", cursor: "nwse-resize", top: -6, left: -6 },
      { pos: "n", cursor: "ns-resize", top: -6, left: "50%", transform: "translateX(-50%)" },
      { pos: "ne", cursor: "nesw-resize", top: -6, right: -6 },
      { pos: "e", cursor: "ew-resize", top: "50%", right: -6, transform: "translateY(-50%)" },
      { pos: "se", cursor: "nwse-resize", bottom: -6, right: -6 },
      { pos: "s", cursor: "ns-resize", bottom: -6, left: "50%", transform: "translateX(-50%)" },
      { pos: "sw", cursor: "nesw-resize", bottom: -6, left: -6 },
      { pos: "w", cursor: "ew-resize", top: "50%", left: -6, transform: "translateY(-50%)" },
    ];

    return handles.map((handle) => (
      <div
        key={handle.pos}
        onMouseDown={(e) => handleResizeMouseDown(e, handle.pos)}
        onTouchStart={(e) => handleResizeTouchStart(e, handle.pos)}
        className={cn(
          "absolute",
          "w-3 h-3 rounded-full",
          "bg-primary hover:bg-primary/80",
          "border-2 border-white shadow",
          "touch-none"
        )}
        style={{
          cursor: handle.cursor,
          top: handle.top !== undefined ? (typeof handle.top === "number" ? handle.top / cssScale : handle.top) : undefined,
          left: handle.left !== undefined ? (typeof handle.left === "number" ? handle.left / cssScale : handle.left) : undefined,
          right: handle.right !== undefined ? handle.right / cssScale : undefined,
          bottom: handle.bottom !== undefined ? handle.bottom / cssScale : undefined,
          transform: `scale(${1 / cssScale}) ${handle.transform || ""}`,
          transformOrigin: "center center",
        }}
      />
    ));
  };

  // Render resize handles for line/arrow (endpoints)
  const renderLineResizeHandles = () => {
    if (!isLine || !isSelected) return null;

    const padding = annotation.strokeWidth;
    const svgWidth = Math.abs(annotation.width) + padding * 2;
    const svgHeight = Math.abs(annotation.height) + padding * 2;

    // Start point
    const startX = annotation.width >= 0 ? padding : svgWidth - padding;
    const startY = annotation.height >= 0 ? padding : svgHeight - padding;
    // End point
    const endX = annotation.width >= 0 ? svgWidth - padding : padding;
    const endY = annotation.height >= 0 ? svgHeight - padding : padding;

    return (
      <>
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, "start")}
          onTouchStart={(e) => handleResizeTouchStart(e, "start")}
          className={cn(
            "absolute",
            "w-4 h-4 rounded-full",
            "bg-primary hover:bg-primary/80",
            "border-2 border-white shadow",
            "touch-none cursor-move"
          )}
          style={{
            left: startX * scale - 8 / cssScale,
            top: startY * scale - 8 / cssScale,
            transform: `scale(${1 / cssScale})`,
            transformOrigin: "center center",
          }}
        />
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, "end")}
          onTouchStart={(e) => handleResizeTouchStart(e, "end")}
          className={cn(
            "absolute",
            "w-4 h-4 rounded-full",
            "bg-primary hover:bg-primary/80",
            "border-2 border-white shadow",
            "touch-none cursor-move"
          )}
          style={{
            left: endX * scale - 8 / cssScale,
            top: endY * scale - 8 / cssScale,
            transform: `scale(${1 / cssScale})`,
            transformOrigin: "center center",
          }}
        />
      </>
    );
  };

  // Calculate rotation origin offset for proper rotation center
  const containerStyle = getContainerStyle();
  const rotationCenterX = (containerStyle.width as number) / 2;
  const rotationCenterY = (containerStyle.height as number) / 2;

  return (
    <div
      ref={containerRef}
      data-annotation="shape"
      className={cn(
        "absolute group",
        "transition-shadow duration-200",
        isSelected && "ring-2 ring-ring rounded"
      )}
      style={{
        ...containerStyle,
        cursor: isDragging ? "grabbing" : isRotating ? "grabbing" : "grab",
        zIndex: isSelected ? 50 : 10,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: `${rotationCenterX}px ${rotationCenterY}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Shape SVG */}
      {renderShape()}

      {/* Rotation handle - shows when selected (not for lines) */}
      {isSelected && !isLine && (
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
            "bg-popover rounded-2xl shadow-lg border border-border",
            "z-50"
          )}
          style={{
            bottom: "100%",
            marginBottom: (isLine ? 8 : 48) / cssScale,
            transform: `translateX(-50%) scale(${1 / cssScale}) rotate(${-rotation}deg)`,
            transformOrigin: "center bottom",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Fill Color Picker (not for lines) */}
          {!isLine && (
            <div className="relative" ref={fillColorPickerRef}>
              <button
                type="button"
                onClick={() => {
                  setShowFillColorPicker(!showFillColorPicker);
                  setShowStrokeColorPicker(false);
                }}
                className={cn(
                  "w-6 h-6 rounded-full border-2 border-border hover:border-ring transition-colors",
                  annotation.fillColor === "transparent" && "bg-[repeating-linear-gradient(45deg,#ccc,#ccc_2px,transparent_2px,transparent_4px)]"
                )}
                style={{
                  backgroundColor: annotation.fillColor === "transparent" ? undefined : getShapeColorHex(annotation.fillColor),
                }}
                title="Fill color"
              />
              {showFillColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-popover rounded-2xl shadow-lg border border-border z-[60]">
                  <div className="grid grid-cols-5 gap-2" style={{ width: 130 }}>
                    {SHAPE_COLOR_OPTIONS.map((option) => (
                      <button
                        key={option.color}
                        type="button"
                        onClick={() => {
                          onUpdate({ fillColor: option.color });
                          setShowFillColorPicker(false);
                        }}
                        className={cn(
                          "w-5 h-5 rounded-full transition-transform hover:scale-110",
                          option.color === "transparent" && "bg-[repeating-linear-gradient(45deg,#ccc,#ccc_2px,transparent_2px,transparent_4px)]",
                          annotation.fillColor === option.color && "ring-2 ring-ring ring-offset-1 ring-offset-popover"
                        )}
                        style={{
                          backgroundColor: option.color === "transparent" ? undefined : option.hex,
                        }}
                        title={option.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-px h-5 bg-border mx-1" />

          {/* Stroke Color Picker */}
          <div className="relative" ref={strokeColorPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowStrokeColorPicker(!showStrokeColorPicker);
                setShowFillColorPicker(false);
              }}
              className={cn(
                "w-6 h-6 rounded-full border-2 hover:border-ring transition-colors",
                annotation.strokeColor === "transparent" && "bg-[repeating-linear-gradient(45deg,#ccc,#ccc_2px,transparent_2px,transparent_4px)]"
              )}
              style={{
                borderColor: annotation.strokeColor === "transparent" ? undefined : getShapeColorHex(annotation.strokeColor),
                backgroundColor: "transparent",
              }}
              title="Stroke color"
            />
            {showStrokeColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-3 bg-popover rounded-2xl shadow-lg border border-border z-[60]">
                <div className="grid grid-cols-5 gap-2" style={{ width: 130 }}>
                  {SHAPE_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.color}
                      type="button"
                      onClick={() => {
                        onUpdate({ strokeColor: option.color });
                        setShowStrokeColorPicker(false);
                      }}
                      className={cn(
                        "w-5 h-5 rounded-full transition-transform hover:scale-110",
                        option.color === "transparent" && "bg-[repeating-linear-gradient(45deg,#ccc,#ccc_2px,transparent_2px,transparent_4px)]",
                        annotation.strokeColor === option.color && "ring-2 ring-ring ring-offset-1 ring-offset-popover"
                      )}
                      style={{
                        backgroundColor: option.color === "transparent" ? undefined : option.hex,
                      }}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Stroke Width */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onUpdate({ strokeWidth: Math.max(1, annotation.strokeWidth - 1) })}
              className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground"
              disabled={annotation.strokeWidth <= 1}
              title="Decrease stroke width"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-4 text-center text-sm text-muted-foreground">{annotation.strokeWidth}</span>
            <button
              type="button"
              onClick={() => onUpdate({ strokeWidth: Math.min(10, annotation.strokeWidth + 1) })}
              className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground"
              disabled={annotation.strokeWidth >= 10}
              title="Increase stroke width"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Opacity Slider */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={annotation.opacity}
              onChange={(e) => onUpdate({ opacity: parseInt(e.target.value) })}
              className="w-16 h-1 accent-primary cursor-pointer"
              title={`Opacity: ${annotation.opacity}%`}
            />
            <span className="w-8 text-xs text-muted-foreground">{annotation.opacity}%</span>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"
            title="Delete shape"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Resize handles */}
      {renderRectResizeHandles()}
      {renderLineResizeHandles()}
    </div>
  );
});
