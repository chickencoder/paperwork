"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Trash2, Bold, Italic, Minus, Plus, AlignLeft, AlignCenter, AlignRight, ChevronDown, Type, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextReplacementAnnotation, TextAnnotationColor, FontFamily, AnnotationRect } from "@paperwork/pdf-lib";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Minimum size for resize handles
const MIN_WIDTH = 20;
const MIN_HEIGHT = 10;

// Color palette for text annotations - organized by groups
const TEXT_COLOR_OPTIONS: { color: TextAnnotationColor; hex: string; label: string }[] = [
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
function getColorHex(colorKey: TextAnnotationColor): string {
  return TEXT_COLOR_OPTIONS.find((c) => c.color === colorKey)?.hex ?? "#1a1a1a";
}

// Font family options with display names and CSS font-family values
const FONT_FAMILY_OPTIONS: { family: FontFamily; label: string; css: string }[] = [
  { family: "helvetica", label: "Helvetica", css: "Helvetica, Arial, sans-serif" },
  { family: "times", label: "Times", css: "'Times New Roman', Times, serif" },
  { family: "courier", label: "Courier", css: "'Courier New', Courier, monospace" },
];

// Helper to get CSS font-family from font family key
function getFontFamilyCss(fontFamily: FontFamily): string {
  return FONT_FAMILY_OPTIONS.find((f) => f.family === fontFamily)?.css ?? "Helvetica, Arial, sans-serif";
}

interface TextReplacementOverlayProps {
  annotation: TextReplacementAnnotation;
  scale: number;
  cssScale?: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Omit<TextReplacementAnnotation, "id" | "page">>) => void;
  onRemove: () => void;
}

export const TextReplacementOverlay = memo(function TextReplacementOverlay({
  annotation,
  scale,
  cssScale = 1,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: TextReplacementOverlayProps) {
  // Start in editing mode if this is a new replacement (text matches original)
  const [isEditing, setIsEditing] = useState(
    annotation.replacementText === annotation.originalText
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Effective scale combines the PDF render scale and CSS transform scale
  const effectiveScale = scale * cssScale;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    // Don't remove on empty - keep the whiteout even if no text
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
    // Allow Enter for new lines, Cmd/Ctrl+Enter to finish
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      setIsEditing(false);
    }
  };

  const toggleBold = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({
      fontWeight: annotation.fontWeight === "bold" ? "normal" : "bold",
    });
  };

  const decreaseFontSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ fontSize: Math.max(8, annotation.fontSize - 2) });
  };

  const increaseFontSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ fontSize: Math.min(72, annotation.fontSize + 2) });
  };

  const toggleItalic = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({
      fontStyle: annotation.fontStyle === "italic" ? "normal" : "italic",
    });
  };

  const setAlignment = (align: "left" | "center" | "right") => (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ textAlign: align });
  };

  const setColor = (color: TextAnnotationColor) => {
    onUpdate({ color });
    setShowColorPicker(false);
  };

  const setFontFamily = (family: FontFamily) => {
    onUpdate({ fontFamily: family });
  };

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

  // Get current values with defaults
  const fontFamily = annotation.fontFamily ?? "helvetica";
  const fontStyle = annotation.fontStyle ?? "normal";
  const color = annotation.color ?? "black";
  const textAlign = annotation.textAlign ?? "left";

  // Calculate bounds from all whiteout rects (for multi-line selections)
  const whiteoutRects = annotation.whiteoutRects;
  const bounds = whiteoutRects.reduce(
    (acc, rect) => ({
      minX: Math.min(acc.minX, rect.x),
      minY: Math.min(acc.minY, rect.y),
      maxX: Math.max(acc.maxX, rect.x + rect.width),
      maxY: Math.max(acc.maxY, rect.y + rect.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  // The first rect is where we position the text input
  const firstRect = whiteoutRects[0];

  // Track if user has manually resized (to prevent auto-resize from overriding)
  const [userResized, setUserResized] = useState(false);

  // Measure text width and adjust first rect width accordingly
  const measureTextWidth = useCallback(() => {
    // Don't auto-resize if user has manually resized
    if (userResized) return;

    // Create a temporary span to measure text width
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "nowrap";
    span.style.fontSize = `${annotation.fontSize * scale}px`;
    span.style.fontWeight = annotation.fontWeight;
    span.style.fontStyle = fontStyle;
    span.style.fontFamily = getFontFamilyCss(fontFamily);
    span.textContent = annotation.replacementText || " ";
    document.body.appendChild(span);

    const textWidth = span.offsetWidth + 8; // Add small padding
    document.body.removeChild(span);

    // Calculate required width (minimum MIN_WIDTH)
    const requiredWidth = Math.max(MIN_WIDTH, textWidth / scale);

    // Update if width needs to change
    if (Math.abs(requiredWidth - firstRect.width) > 1) {
      const updatedRects = [...whiteoutRects];
      updatedRects[0] = { ...firstRect, width: requiredWidth };
      onUpdate({ whiteoutRects: updatedRects });
    }
  }, [annotation.replacementText, annotation.fontSize, annotation.fontWeight, fontStyle, fontFamily, scale, firstRect, whiteoutRects, onUpdate, userResized]);

  // Measure text width when text changes
  useEffect(() => {
    measureTextWidth();
  }, [annotation.replacementText, measureTextWidth]);

  // Resize handling
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    edge: "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    startX: number;
    startY: number;
    startRects: AnnotationRect[];
  } | null>(null);

  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    edge: "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setUserResized(true); // Mark as manually resized
    resizeRef.current = {
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startRects: whiteoutRects.map(r => ({ ...r })),
    };
  }, [whiteoutRects]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;

      const { edge, startX, startY, startRects } = resizeRef.current;
      const deltaX = (e.clientX - startX) / scale;
      const deltaY = (e.clientY - startY) / scale;

      const updatedRects = startRects.map((rect, index) => {
        const newRect = { ...rect };

        // For simplicity, resize all rects proportionally
        // Left edge: move x and reduce width
        if (edge === "left" || edge === "top-left" || edge === "bottom-left") {
          const newX = rect.x + deltaX;
          const newWidth = rect.width - deltaX;
          if (newWidth >= MIN_WIDTH) {
            newRect.x = newX;
            newRect.width = newWidth;
          }
        }

        // Right edge: increase width
        if (edge === "right" || edge === "top-right" || edge === "bottom-right") {
          const newWidth = rect.width + deltaX;
          if (newWidth >= MIN_WIDTH) {
            newRect.width = newWidth;
          }
        }

        // Top edge: move y and reduce height (only for first rect or all)
        if (edge === "top" || edge === "top-left" || edge === "top-right") {
          if (index === 0) {
            const newY = rect.y + deltaY;
            const newHeight = rect.height - deltaY;
            if (newHeight >= MIN_HEIGHT) {
              newRect.y = newY;
              newRect.height = newHeight;
            }
          }
        }

        // Bottom edge: increase height (only for last rect)
        if (edge === "bottom" || edge === "bottom-left" || edge === "bottom-right") {
          if (index === startRects.length - 1) {
            const newHeight = rect.height + deltaY;
            if (newHeight >= MIN_HEIGHT) {
              newRect.height = newHeight;
            }
          }
        }

        return newRect;
      });

      onUpdate({ whiteoutRects: updatedRects });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, scale, onUpdate]);

  return (
    <div
      ref={containerRef}
      data-annotation="true"
      className={cn("absolute group", "transition-shadow duration-200")}
      style={{
        left: bounds.minX * scale,
        top: bounds.minY * scale,
        width: (bounds.maxX - bounds.minX) * scale,
        minHeight: (bounds.maxY - bounds.minY) * scale,
        zIndex: isSelected ? 50 : 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* White backgrounds - one per line for multi-line selections */}
      {whiteoutRects.map((rect, index) => (
        <div
          key={index}
          className="absolute bg-white"
          style={{
            left: (rect.x - bounds.minX) * scale,
            top: (rect.y - bounds.minY) * scale,
            width: rect.width * scale,
            height: rect.height * scale,
            boxShadow: isSelected ? "0 0 0 1px rgba(0,0,0,0.1)" : undefined,
          }}
        />
      ))}

      {/* Inline formatting toolbar - shows above when selected */}
      {isSelected && !isEditing && (
        <div
          className={cn(
            "absolute left-1/2",
            "flex items-center gap-1 px-2 py-1",
            "bg-popover rounded-full shadow-lg border border-border",
            "z-50"
          )}
          style={{
            bottom: "100%",
            marginBottom: 8 / cssScale,
            transform: `translateX(-50%) scale(${1 / cssScale})`,
            transformOrigin: "center bottom",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Font family picker */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-accent",
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors text-sm"
                )}
                style={{ fontFamily: getFontFamilyCss(fontFamily) }}
                title="Font family"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Type className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[130px]"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {FONT_FAMILY_OPTIONS.map(({ family, label, css }) => (
                <DropdownMenuItem
                  key={family}
                  onSelect={() => setFontFamily(family)}
                  style={{ fontFamily: css }}
                  className="flex items-center justify-between"
                >
                  {label}
                  {fontFamily === family && <Check className="w-3 h-3 ml-2" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Font size controls */}
          <button
            type="button"
            onClick={decreaseFontSize}
            className={cn(
              "p-1.5 rounded-full hover:bg-accent",
              "text-muted-foreground hover:text-foreground",
              "transition-colors"
            )}
            title="Decrease font size"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground w-7 text-center font-body">
            {annotation.fontSize}
          </span>
          <button
            type="button"
            onClick={increaseFontSize}
            className={cn(
              "p-1.5 rounded-full hover:bg-accent",
              "text-muted-foreground hover:text-foreground",
              "transition-colors"
            )}
            title="Increase font size"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Bold and Italic toggles */}
          <button
            type="button"
            onClick={toggleBold}
            className={cn(
              "p-1.5 rounded-full hover:bg-accent",
              "transition-colors",
              annotation.fontWeight === "bold"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Toggle bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            className={cn(
              "p-1.5 rounded-full hover:bg-accent",
              "transition-colors",
              fontStyle === "italic"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Toggle italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Color picker */}
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
              title="Text color"
            >
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: getColorHex(color) }}
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
                <div className="grid grid-cols-6 gap-2" style={{ width: 156 }}>
                  {TEXT_COLOR_OPTIONS.map(({ color: c, hex, label }) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        "w-5 h-5 rounded-full transition-transform hover:scale-110",
                        color === c && "ring-2 ring-ring ring-offset-1 ring-offset-popover"
                      )}
                      style={{ backgroundColor: hex }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setColor(c);
                      }}
                      title={label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Text alignment */}
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={setAlignment("left")}
              className={cn(
                "p-1.5 rounded-l-full transition-colors",
                textAlign === "left"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              title="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={setAlignment("center")}
              className={cn(
                "p-1.5 border-x border-border transition-colors",
                textAlign === "center"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              title="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={setAlignment("right")}
              className={cn(
                "p-1.5 rounded-r-full transition-colors",
                textAlign === "right"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              title="Align right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
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
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Resize handles - only show when selected */}
      {isSelected && !isEditing && (
        <>
          {/* Edge handles */}
          <div
            className="absolute cursor-w-resize"
            style={{
              left: -3,
              top: "25%",
              width: 6,
              height: "50%",
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "left")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-6 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="absolute cursor-e-resize"
            style={{
              right: -3,
              top: "25%",
              width: 6,
              height: "50%",
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "right")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-6 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="absolute cursor-n-resize"
            style={{
              top: -3,
              left: "25%",
              width: "50%",
              height: 6,
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "top")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1.5 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="absolute cursor-s-resize"
            style={{
              bottom: -3,
              left: "25%",
              width: "50%",
              height: 6,
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "bottom")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1.5 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>

          {/* Corner handles */}
          <div
            className="absolute cursor-nw-resize"
            style={{
              left: -4,
              top: -4,
              width: 8,
              height: 8,
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "top-left")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="absolute cursor-ne-resize"
            style={{
              right: -4,
              top: -4,
              width: 8,
              height: 8,
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "top-right")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="absolute cursor-sw-resize"
            style={{
              left: -4,
              bottom: -4,
              width: 8,
              height: 8,
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="absolute cursor-se-resize"
            style={{
              right: -4,
              bottom: -4,
              width: 8,
              height: 8,
              background: "transparent",
            }}
            onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-ring rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </>
      )}

      {/* Text content - positioned at the first whiteout rect */}
      <div
        className="absolute"
        style={{
          left: (firstRect.x - bounds.minX) * scale,
          top: (firstRect.y - bounds.minY) * scale,
          width: firstRect.width * scale,
          height: firstRect.height * scale,
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={annotation.replacementText}
            onChange={(e) => onUpdate({ replacementText: e.target.value })}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            className={cn(
              "w-full bg-transparent border border-ring",
              "outline-none",
              "rounded-sm"
            )}
            style={{
              height: firstRect.height * scale,
              fontSize: annotation.fontSize * scale,
              fontWeight: annotation.fontWeight,
              fontStyle: fontStyle,
              fontFamily: getFontFamilyCss(fontFamily),
              color: getColorHex(color),
              textAlign: textAlign,
              lineHeight: `${firstRect.height * scale}px`,
              padding: 0,
            }}
            placeholder="Enter replacement text..."
          />
        ) : (
          <div
            className={cn(
              "w-full",
              "rounded-sm",
              "transition-all duration-150",
              isSelected && "ring-2 ring-ring ring-offset-1"
            )}
            style={{
              height: firstRect.height * scale,
              fontSize: annotation.fontSize * scale,
              fontWeight: annotation.fontWeight,
              fontStyle: fontStyle,
              fontFamily: getFontFamilyCss(fontFamily),
              color: getColorHex(color),
              textAlign: textAlign,
              lineHeight: `${firstRect.height * scale}px`,
              whiteSpace: "nowrap",
              overflow: "visible",
            }}
          >
            {annotation.replacementText || (
              <span className="text-muted-foreground italic">
                Click to edit
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
