"use client";

import { useState, useEffect } from "react";
import {
  MousePointer2,
  Type,
  Signature,
  ZoomIn,
  ZoomOut,
  Download,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { SignaturePopover } from "./signature/signature-popover";

interface ToolbarProps {
  scale: number;
  activeTool: "select" | "text-insert" | "signature";
  fileName: string;
  isSignaturePopoverOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasRedactions: boolean;
  hasTabBar?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToolChange: (tool: "select" | "text-insert" | "signature") => void;
  onSignaturePopoverChange: (open: boolean) => void;
  onSignatureCreated: (dataUrl: string) => void;
  onDownload: (options: { rasterize: boolean; hasRedactions: boolean }) => void;
}

export function Toolbar({
  scale,
  activeTool,
  isSignaturePopoverOpen,
  canUndo,
  canRedo,
  hasRedactions,
  hasTabBar = false,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onToolChange,
  onSignaturePopoverChange,
  onSignatureCreated,
  onDownload,
}: ToolbarProps) {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [secureDownload, setSecureDownload] = useState(hasRedactions);

  // Update secure download toggle when redactions change
  useEffect(() => {
    setSecureDownload(hasRedactions);
  }, [hasRedactions]);

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          "sticky z-[70] flex justify-center pointer-events-none",
          hasTabBar ? "top-12" : "top-4"
        )}
      >
        <div className="pointer-events-auto flex items-center gap-0.5 bg-popover/90 backdrop-blur-md rounded-full shadow-lg shadow-foreground/10 border border-border/60 px-1.5 py-1.5">
          {/* Edit tools */}
          <ToolButton
            icon={<MousePointer2 className="w-4 h-4" />}
            label="Select"
            isActive={activeTool === "select"}
            onClick={() => onToolChange("select")}
          />
          <ToolButton
            icon={<Type className="w-4 h-4" />}
            label="Add Text"
            isActive={activeTool === "text-insert"}
            onClick={() => onToolChange("text-insert")}
          />
          <Tooltip>
            <SignaturePopover
              open={isSignaturePopoverOpen}
              onOpenChange={onSignaturePopoverChange}
              onSignatureCreated={onSignatureCreated}
            >
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "p-2 rounded-full transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    activeTool === "signature"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Signature className="w-4 h-4" />
                </button>
              </TooltipTrigger>
            </SignaturePopover>
            <TooltipContent side="bottom">
              <p>Add Signature</p>
            </TooltipContent>
          </Tooltip>

          <Divider />

          {/* Zoom controls */}
          <ToolButton
            icon={<ZoomOut className="w-4 h-4" />}
            label="Zoom out"
            onClick={onZoomOut}
            disabled={scale <= 0.5}
          />
          <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <ToolButton
            icon={<ZoomIn className="w-4 h-4" />}
            label="Zoom in"
            onClick={onZoomIn}
            disabled={scale >= 3}
          />

          <Divider />

          {/* Undo/Redo */}
          <ToolButton
            icon={<Undo2 className="w-4 h-4" />}
            label="Undo"
            onClick={onUndo}
            disabled={!canUndo}
          />
          <ToolButton
            icon={<Redo2 className="w-4 h-4" />}
            label="Redo"
            onClick={onRedo}
            disabled={!canRedo}
          />

          <div className="w-1" />

          {/* Download dropdown */}
          <Tooltip>
            <Popover open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "p-2 rounded-full transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <PopoverContent
                align="center"
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
                    <button
                      type="button"
                      onClick={() => setSecureDownload(!secureDownload)}
                      className={cn(
                        "flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors",
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
                    </button>
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
            <TooltipContent side="bottom">
              <p>Download</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-border mx-1" />;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  variant?: "default" | "primary" | "secondary";
  onClick: () => void;
}

function ToolButton({
  icon,
  label,
  isActive,
  disabled,
  variant = "default",
  onClick,
}: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "p-2 rounded-full transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            variant === "primary"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : variant === "secondary"
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
