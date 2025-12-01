import { useState, useEffect, useRef, useCallback } from "react";
import { X, Bold, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextAnnotation } from "@/lib/pdf/types";

interface TextAnnotationOverlayProps {
  annotation: TextAnnotation;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Omit<TextAnnotation, "id" | "page">>) => void;
  onRemove: () => void;
}

export function TextAnnotationOverlay({
  annotation,
  scale,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: TextAnnotationOverlayProps) {
  const [isEditing, setIsEditing] = useState(!annotation.text);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing || isResizing) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - annotation.position.x * scale,
        y: e.clientY - annotation.position.y * scale,
      });
    },
    [isEditing, isResizing, annotation.position, scale, onSelect]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      // Use the actual rendered width if annotation.width isn't set
      const currentWidth = annotation.width || (containerRef.current?.offsetWidth ?? 150) / scale;
      setResizeStart({
        x: e.clientX,
        width: currentWidth,
      });
    },
    [annotation.width, scale]
  );

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

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      // Only update if there's meaningful movement (more than 2px)
      if (Math.abs(deltaX) > 2) {
        const newWidth = Math.max(20, resizeStart.width + deltaX / scale);
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
  }, [isResizing, resizeStart, scale, onUpdate]);

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
            "absolute -top-9 left-0",
            "flex items-center gap-0.5 px-1 py-0.5",
            "bg-white rounded-md shadow-lg border border-stone-200",
            "z-50"
          )}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={decreaseFontSize}
            className={cn(
              "p-1 rounded hover:bg-stone-100",
              "text-stone-600 hover:text-stone-900",
              "transition-colors"
            )}
            title="Decrease font size"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs text-stone-500 w-6 text-center font-body">
            {annotation.fontSize}
          </span>
          <button
            type="button"
            onClick={increaseFontSize}
            className={cn(
              "p-1 rounded hover:bg-stone-100",
              "text-stone-600 hover:text-stone-900",
              "transition-colors"
            )}
            title="Increase font size"
          >
            <Plus className="w-3 h-3" />
          </button>
          <div className="w-px h-4 bg-stone-200 mx-0.5" />
          <button
            type="button"
            onClick={toggleBold}
            className={cn(
              "p-1 rounded hover:bg-stone-100",
              "transition-colors",
              annotation.fontWeight === "bold"
                ? "bg-stone-200 text-stone-900"
                : "text-stone-600 hover:text-stone-900"
            )}
            title="Toggle bold"
          >
            <Bold className="w-3 h-3" />
          </button>
          <div className="w-px h-4 bg-stone-200 mx-0.5" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              "p-1 rounded hover:bg-red-50",
              "text-stone-600 hover:text-red-600",
              "transition-colors"
            )}
            title="Delete"
          >
            <X className="w-3 h-3" />
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
            "bg-amber-50 border border-amber-400",
            "font-body text-stone-900 outline-none",
            "rounded-sm shadow-sm"
          )}
          style={{
            fontSize: annotation.fontSize * scale,
            fontWeight: annotation.fontWeight,
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
            "font-body text-stone-900",
            "transition-all duration-150",
            "hover:bg-stone-100/80",
            isSelected && "bg-amber-50 ring-2 ring-amber-400",
            isDragging && "opacity-80"
          )}
          style={{
            whiteSpace: annotation.width ? "pre-wrap" : "nowrap",
            wordBreak: annotation.width ? "break-word" : "normal",
          }}
        >
          {annotation.text}

          {/* Resize handle - shows when selected */}
          {isSelected && (
            <div
              onMouseDown={handleResizeMouseDown}
              className={cn(
                "absolute top-1/2 -right-1.5 -translate-y-1/2",
                "w-4 h-4 rounded-full",
                "bg-amber-400 hover:bg-amber-500",
                "cursor-ew-resize",
                "transition-colors",
                "border-2 border-white shadow"
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
