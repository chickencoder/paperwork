"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Trash2, Bold, Italic, Minus, Plus, AlignLeft, AlignCenter, AlignRight, ChevronDown, Type, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextReplacementAnnotation, TextAnnotationColor, FontFamily } from "@paperwork/pdf-lib";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  // Track minimum width based on text content (applies to first rect only)
  const [minWidth, setMinWidth] = useState(firstRect.width);

  // Measure text width and expand first rect if needed
  const measureTextWidth = useCallback(() => {
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

    // Only expand, never shrink below original
    const newMinWidth = Math.max(firstRect.width, textWidth / scale);
    if (newMinWidth > minWidth) {
      setMinWidth(newMinWidth);
      // Update the first whiteout rect width
      const updatedRects = [...whiteoutRects];
      updatedRects[0] = { ...firstRect, width: newMinWidth };
      onUpdate({ whiteoutRects: updatedRects });
    }
  }, [annotation.replacementText, annotation.fontSize, annotation.fontWeight, fontStyle, fontFamily, scale, minWidth, firstRect, whiteoutRects, onUpdate]);

  // Measure text width when text changes
  useEffect(() => {
    measureTextWidth();
  }, [annotation.replacementText, measureTextWidth]);

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
