"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableWindowProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  width?: number;
}

export function DraggableWindow({
  open,
  onClose,
  title,
  children,
  className,
  width = 360,
}: DraggableWindowProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Invisible constraints container covering viewport */}
          <div
            ref={constraintsRef}
            className="fixed inset-4 pointer-events-none z-[100]"
          />

          {/* Draggable window */}
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            style={{ width }}
            className={cn(
              "fixed top-20 right-16",
              "z-[101] bg-popover rounded-2xl shadow-2xl shadow-black/20",
              "border border-border/60 overflow-hidden",
              "flex flex-col",
              className
            )}
          >
            {/* Title bar - drag handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className={cn(
                "flex items-center justify-between px-3 py-2",
                "border-b border-border/40 bg-muted/30",
                "cursor-grab active:cursor-grabbing select-none"
              )}
            >
              <div className="flex items-center gap-1.5">
                <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground/50" />
                <span className="font-medium text-xs">{title}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
