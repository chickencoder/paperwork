import { useState, useCallback } from "react";
import { Pen, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SignatureDrawPad } from "./signature-draw-pad";
import { SignatureTypePad } from "./signature-type-pad";

type CreateMode = "draw" | "type";

interface SignaturePopoverProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignatureCreated: (dataUrl: string) => void;
}

export function SignaturePopover({
  children,
  open,
  onOpenChange,
  onSignatureCreated,
}: SignaturePopoverProps) {
  const [createMode, setCreateMode] = useState<CreateMode>("type");
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Handle open change and reset state when opening
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        // Reset state when opening
        setSignatureData(null);
        setCreateMode("type");
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const handleUseSignature = useCallback(() => {
    if (!signatureData) return;
    onSignatureCreated(signatureData);
    onOpenChange(false);
  }, [signatureData, onSignatureCreated, onOpenChange]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={12}
        className="w-80 p-0 rounded-2xl"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-200">
          <h3 className="font-body text-sm font-semibold text-stone-900">
            Add Signature
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setCreateMode("type");
                setSignatureData(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md",
                "font-body text-sm transition-all",
                createMode === "type"
                  ? "bg-white shadow-sm text-stone-900"
                  : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Type className="w-4 h-4" />
              Type
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateMode("draw");
                setSignatureData(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md",
                "font-body text-sm transition-all",
                createMode === "draw"
                  ? "bg-white shadow-sm text-stone-900"
                  : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Pen className="w-4 h-4" />
              Draw
            </button>
          </div>

          {/* Type or Draw Pad */}
          {createMode === "type" ? (
            <SignatureTypePad onSignatureChange={setSignatureData} />
          ) : (
            <SignatureDrawPad onSignatureChange={setSignatureData} />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-200">
          <button
            type="button"
            onClick={handleUseSignature}
            disabled={!signatureData}
            className={cn(
              "w-full px-4 py-2 rounded-full font-body text-sm font-medium",
              "transition-all",
              signatureData
                ? "bg-stone-900 text-white hover:bg-stone-800"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            )}
          >
            Add to Document
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
