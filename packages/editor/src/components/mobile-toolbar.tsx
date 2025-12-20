"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MousePointer2,
  Type,
  Signature,
  ZoomIn,
  ZoomOut,
  Download,
  Undo2,
  Redo2,
  Square,
  Circle,
  Minus,
  ArrowRight,
  ChevronDown,
  Shapes,
  Triangle,
  Star,
  Hexagon,
  MessageSquare,
} from "lucide-react";
import type { ShapeType } from "@paperwork/pdf-lib/types";
import { cn } from "@paperwork/ui/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@paperwork/ui/popover";
import { Switch } from "@paperwork/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@paperwork/ui/dropdown-menu";
import { SignaturePopover } from "./signature/signature-popover";
import { MicroAppCombobox, type MicroApp } from "../stubs/micro-apps";

// Shape type options with icons and labels
const SHAPE_OPTIONS: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
  { type: "rectangle", icon: <Square className="w-5 h-5" />, label: "Rectangle" },
  { type: "ellipse", icon: <Circle className="w-5 h-5" />, label: "Ellipse" },
  { type: "triangle", icon: <Triangle className="w-5 h-5" />, label: "Triangle" },
  { type: "star", icon: <Star className="w-5 h-5" />, label: "Star" },
  { type: "hexagon", icon: <Hexagon className="w-5 h-5" />, label: "Hexagon" },
  { type: "callout", icon: <MessageSquare className="w-5 h-5" />, label: "Callout" },
  { type: "line", icon: <Minus className="w-5 h-5" />, label: "Line" },
  { type: "arrow", icon: <ArrowRight className="w-5 h-5" />, label: "Arrow" },
];

interface MobileToolbarProps {
  scale: number;
  activeTool: "select" | "text-insert" | "signature" | "shape";
  activeShapeType: ShapeType;
  fileName: string;
  isSignaturePopoverOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasRedactions: boolean;
  hidden?: boolean;
  /** Hides the micro-apps (Tools) menu */
  hideMicroApps?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToolChange: (tool: "select" | "text-insert" | "signature" | "shape") => void;
  onShapeTypeChange: (shapeType: ShapeType) => void;
  onSignaturePopoverChange: (open: boolean) => void;
  onSignatureCreated: (dataUrl: string) => void;
  onDownload: (options: { rasterize: boolean; hasRedactions: boolean }) => void;
  onMicroAppSelect?: (app: MicroApp) => void;
}

export function MobileToolbar({
  scale,
  activeTool,
  activeShapeType,
  isSignaturePopoverOpen,
  canUndo,
  canRedo,
  hasRedactions,
  hidden = false,
  hideMicroApps = false,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onToolChange,
  onShapeTypeChange,
  onSignaturePopoverChange,
  onSignatureCreated,
  onDownload,
  onMicroAppSelect,
}: MobileToolbarProps) {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [secureDownload, setSecureDownload] = useState(hasRedactions);

  // Update secure download toggle when redactions change
  useEffect(() => {
    setSecureDownload(hasRedactions);
  }, [hasRedactions]);

  // Track if any drawer/popover is open to hide toolbar
  const isAnyDrawerOpen = isToolsDrawerOpen || isSignaturePopoverOpen;

  const handleToolsOpenChange = useCallback((open: boolean) => {
    setIsToolsDrawerOpen(open);
  }, []);

  return (
    <AnimatePresence>
      {!hidden && !isAnyDrawerOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="fixed bottom-4 left-4 right-4 z-[70] md:hidden pointer-events-auto"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            willChange: "transform",
          }}
        >
          <div className="flex items-center justify-between gap-1 bg-popover/95 backdrop-blur-md border border-border/60 rounded-full shadow-lg shadow-black/10 dark:shadow-black/30 px-3 py-2">
            {/* Edit tools */}
            <div className="flex items-center gap-0.5">
              <MobileToolButton
                icon={<MousePointer2 className="w-5 h-5" />}
                isActive={activeTool === "select"}
                onClick={() => onToolChange("select")}
              />
              <MobileToolButton
                icon={<Type className="w-5 h-5" />}
                isActive={activeTool === "text-insert"}
                onClick={() => onToolChange("text-insert")}
              />
              <SignaturePopover
                open={isSignaturePopoverOpen}
                onOpenChange={onSignaturePopoverChange}
                onSignatureCreated={onSignatureCreated}
              >
                <button
                  type="button"
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    activeTool === "signature"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Signature className="w-5 h-5" />
                </button>
              </SignaturePopover>

              {/* Shape tool with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-0.5 p-2.5 pr-1.5 rounded-xl transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      activeTool === "shape"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Shapes className="w-5 h-5" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" sideOffset={8}>
                  {SHAPE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.type}
                      onClick={() => {
                        onShapeTypeChange(option.type);
                        onToolChange("shape");
                      }}
                      className="flex items-center gap-2"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Micro Apps (hidden in widget mode) */}
            {!hideMicroApps && (
              <MicroAppCombobox
                onSelect={(app) => onMicroAppSelect?.(app)}
                hasDocument={true}
                onOpenChange={handleToolsOpenChange}
              />
            )}

            {/* Zoom controls */}
            <div className="flex items-center gap-0.5">
              <MobileToolButton
                icon={<ZoomOut className="w-5 h-5" />}
                onClick={onZoomOut}
                disabled={scale <= 0.5}
              />
              <span className="text-xs text-muted-foreground w-9 text-center tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <MobileToolButton
                icon={<ZoomIn className="w-5 h-5" />}
                onClick={onZoomIn}
                disabled={scale >= 3}
              />
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5">
              <MobileToolButton
                icon={<Undo2 className="w-5 h-5" />}
                onClick={onUndo}
                disabled={!canUndo}
              />
              <MobileToolButton
                icon={<Redo2 className="w-5 h-5" />}
                onClick={onRedo}
                disabled={!canRedo}
              />
            </div>

            {/* Download */}
            <Popover open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Download className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="top"
                sideOffset={12}
                className="w-72 p-2 rounded-2xl"
              >
                <div className="flex flex-col gap-1">
                  {/* Auto-flatten notice when redactions exist */}
                  {hasRedactions ? (
                    <div className="px-3 py-2.5 rounded-xl bg-muted">
                      <p className="text-sm font-medium text-foreground">
                        Redactions will be flattened
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pages are converted to images to protect redacted
                        content
                      </p>
                    </div>
                  ) : (
                    /* Flatten toggle only shown when no redactions */
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSecureDownload(!secureDownload)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSecureDownload(!secureDownload);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer",
                        secureDownload ? "bg-muted" : "hover:bg-accent"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "font-medium text-sm",
                            secureDownload
                              ? "text-foreground"
                              : "text-foreground/80"
                          )}
                        >
                          Flatten PDF
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Converts pages to images
                        </p>
                      </div>
                      <Switch
                        checked={secureDownload}
                        onCheckedChange={setSecureDownload}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {/* Primary download button */}
                  <button
                    type="button"
                    onClick={() => {
                      // Always flatten if there are redactions, otherwise use toggle state
                      onDownload({
                        rasterize: hasRedactions || secureDownload,
                        hasRedactions,
                      });
                      setIsDownloadOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-full mt-1",
                      "text-sm font-medium",
                      "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    )}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MobileToolButtonProps {
  icon: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function MobileToolButton({
  icon,
  isActive,
  disabled,
  onClick,
}: MobileToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {icon}
    </button>
  );
}
