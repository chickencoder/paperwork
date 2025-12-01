import { useState } from "react";
import {
  MousePointer2,
  Type,
  Signature,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  RotateCcw,
  ImageIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SignaturePopover } from "./signature/signature-popover";

interface ToolbarProps {
  scale: number;
  activeTool: "select" | "text-insert" | "signature";
  fileName: string;
  isSignaturePopoverOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onScaleChange: (scale: number) => void;
  onToolChange: (tool: "select" | "text-insert" | "signature") => void;
  onSignaturePopoverChange: (open: boolean) => void;
  onSignatureCreated: (dataUrl: string) => void;
  onDownload: () => void;
  onRasterize: () => void;
  onPrint: () => void;
  onReset: () => void;
}

export function Toolbar({
  scale,
  activeTool,
  isSignaturePopoverOpen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onScaleChange,
  onToolChange,
  onSignaturePopoverChange,
  onSignatureCreated,
  onDownload,
  onRasterize,
  onPrint,
  onReset,
}: ToolbarProps) {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const zoomIn = () => onScaleChange(Math.min(scale + 0.25, 3));
  const zoomOut = () => onScaleChange(Math.max(scale - 0.25, 0.5));

  return (
    <div className="sticky top-4 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-0.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-stone-900/10 border border-stone-200/60 px-1.5 py-1.5">
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
        <SignaturePopover
          open={isSignaturePopoverOpen}
          onOpenChange={onSignaturePopoverChange}
          onSignatureCreated={onSignatureCreated}
        >
          <button
            type="button"
            title="Add Signature"
            className={cn(
              "p-2 rounded-full transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400",
              activeTool === "signature"
                ? "bg-stone-100 text-stone-900"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
            )}
          >
            <Signature className="w-4 h-4" />
          </button>
        </SignaturePopover>

        <Divider />

        {/* Zoom controls */}
        <ToolButton
          icon={<ZoomOut className="w-4 h-4" />}
          label="Zoom out"
          onClick={zoomOut}
          disabled={scale <= 0.5}
        />
        <span className="font-body text-xs text-stone-500 w-10 text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <ToolButton
          icon={<ZoomIn className="w-4 h-4" />}
          label="Zoom in"
          onClick={zoomIn}
          disabled={scale >= 3}
        />

        <Divider />

        {/* Actions */}
        <ToolButton
          icon={<Undo2 className="w-4 h-4" />}
          label="Undo (⌘Z)"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <ToolButton
          icon={<Redo2 className="w-4 h-4" />}
          label="Redo (⌘⇧Z)"
          onClick={onRedo}
          disabled={!canRedo}
        />
        <ToolButton
          icon={<RotateCcw className="w-4 h-4" />}
          label="New document"
          onClick={onReset}
        />

        {/* Download dropdown */}
        <Popover open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Download options"
              className={cn(
                "p-2 rounded-full transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400",
                "bg-stone-900 text-white hover:bg-stone-800"
              )}
            >
              <Download className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            sideOffset={12}
            className="w-64 p-2 rounded-2xl"
          >
            <div className="flex flex-col gap-0.5">
              {/* Print button */}
              <button
                type="button"
                onClick={() => {
                  onPrint();
                  setIsDownloadOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg",
                  "text-left text-sm font-medium text-stone-700",
                  "hover:bg-stone-100 transition-colors"
                )}
              >
                <Printer className="w-4 h-4 text-stone-500" />
                Print
              </button>

              {/* Rasterize & download button with help text */}
              <button
                type="button"
                onClick={() => {
                  onRasterize();
                  setIsDownloadOpen(false);
                }}
                className={cn(
                  "flex flex-col w-full px-3 py-2 rounded-lg",
                  "text-left text-sm",
                  "hover:bg-stone-100 transition-colors"
                )}
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-stone-500 shrink-0" />
                  <span className="font-medium text-stone-700">Download as images</span>
                </div>
                <div className="text-xs text-stone-500 mt-1 ml-7">
                  Converts pages to images, ensuring redacted text is unreadable
                </div>
              </button>

              {/* Primary download button */}
              <button
                type="button"
                onClick={() => {
                  onDownload();
                  setIsDownloadOpen(false);
                }}
                className={cn(
                  "flex items-center justify-center gap-2 w-full px-3 py-2 rounded-full mt-2",
                  "text-sm font-medium",
                  "bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                )}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-stone-200 mx-1" />;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  variant?: "default" | "primary";
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "p-2 rounded-full transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-stone-900 text-white hover:bg-stone-800"
          : isActive
            ? "bg-stone-100 text-stone-900"
            : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
      )}
    >
      {icon}
    </button>
  );
}
