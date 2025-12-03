"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Bold, Italic, Minus, Plus, AlignLeft, AlignCenter, AlignRight, ChevronDown, Type, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextAnnotation, TextAnnotationColor, FontFamily } from "@/lib/pdf/types";
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

interface TextAnnotationOverlayProps {
  annotation: TextAnnotation;
  scale: number;
  cssScale?: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Omit<TextAnnotation, "id" | "page">>) => void;
  onRemove: () => void;
}

export function TextAnnotationOverlay({
  annotation,
  scale,
  cssScale = 1,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: TextAnnotationOverlayProps) {
  const [isEditing, setIsEditing] = useState(!annotation.text);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [annotation.text, annotation.width, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (!annotation.text.trim()) {
      onRemove();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      if (!annotation.text.trim()) {
        onRemove();
      }
    }
    // Allow Enter for new lines, Cmd/Ctrl+Enter to finish
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      setIsEditing(false);
      if (!annotation.text.trim()) {
        onRemove();
      }
    }
  };

  // Effective scale combines the PDF render scale and CSS transform scale
  const effectiveScale = scale * cssScale;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing || isResizing) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - annotation.position.x * effectiveScale,
        y: e.clientY - annotation.position.y * effectiveScale,
      });
    },
    [isEditing, isResizing, annotation.position, effectiveScale, onSelect]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      // Use the actual rendered width if annotation.width isn't set
      const currentWidth = annotation.width || (containerRef.current?.offsetWidth ?? 150) / effectiveScale;
      setResizeStart({
        x: e.clientX,
        width: currentWidth,
      });
    },
    [annotation.width, effectiveScale]
  );

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

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      // Only update if there's meaningful movement (more than 2px)
      if (Math.abs(deltaX) > 2) {
        const newWidth = Math.max(20, resizeStart.width + deltaX / effectiveScale);
        onUpdate({ width: newWidth });
      }
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
  }, [isResizing, resizeStart, effectiveScale, onUpdate]);

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

  // Get current values with defaults for backward compatibility
  const fontFamily = annotation.fontFamily ?? "helvetica";
  const fontStyle = annotation.fontStyle ?? "normal";
  const color = annotation.color ?? "black";
  const textAlign = annotation.textAlign ?? "left";

  const scaledWidth = annotation.width ? annotation.width * scale : undefined;

  return (
    <div
      ref={containerRef}
      data-annotation="true"
      className={cn("absolute group", "transition-shadow duration-200")}
      style={{
        left: annotation.position.x * scale,
        top: annotation.position.y * scale,
        fontSize: annotation.fontSize * scale,
        fontWeight: annotation.fontWeight,
        cursor: isDragging ? "grabbing" : isEditing ? "text" : "default",
        zIndex: isSelected ? 50 : 10,
        width: scaledWidth,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={() => setIsEditing(true)}
      onMouseDown={handleMouseDown}
    >
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
            // Counter-scale to maintain consistent toolbar size across zoom levels
            // The toolbar is inside the scaled container, so we counter-scale it
            // Use bottom: 100% to position above the annotation, then add margin
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

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={annotation.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "min-w-[100px] px-1 py-0.5 resize-none",
            "bg-transparent border border-ring",
            "outline-none",
            "rounded-sm shadow-sm"
          )}
          style={{
            fontSize: annotation.fontSize * scale,
            fontWeight: annotation.fontWeight,
            fontStyle: fontStyle,
            fontFamily: getFontFamilyCss(fontFamily),
            color: getColorHex(color),
            textAlign: textAlign,
            width: scaledWidth || "auto",
            minHeight: annotation.fontSize * scale + 8,
          }}
          placeholder="Type here..."
          rows={1}
        />
      ) : (
        <div
          className={cn(
            "relative px-1 py-0.5 rounded-sm",
            "transition-all duration-150",
            "hover:bg-primary/10",
            isSelected && "bg-primary/10 ring-2 ring-ring",
            isDragging && "opacity-80"
          )}
          style={{
            whiteSpace: annotation.width ? "pre-wrap" : "nowrap",
            wordBreak: annotation.width ? "break-word" : "normal",
            fontStyle: fontStyle,
            fontFamily: getFontFamilyCss(fontFamily),
            color: getColorHex(color),
            textAlign: textAlign,
          }}
        >
          {annotation.text}

          {/* Resize handle - shows when selected */}
          {isSelected && (
            <div
              onMouseDown={handleResizeMouseDown}
              className={cn(
                "absolute top-1/2",
                "w-4 h-4 rounded-full",
                "bg-primary hover:bg-primary/80",
                "cursor-ew-resize",
                "transition-colors",
                "border-2 border-white shadow"
              )}
              style={{
                right: -6 / cssScale,
                transform: `translateY(-50%) scale(${1 / cssScale})`,
                transformOrigin: "center center",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
