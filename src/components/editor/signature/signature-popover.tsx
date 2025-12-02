"use client";

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
        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => {
                setCreateMode("type");
                setSignatureData(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md",
                "text-sm transition-all",
                createMode === "type"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
                "text-sm transition-all",
                createMode === "draw"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
        <div className="px-4 py-3 border-t border-border">
          <button
            type="button"
            onClick={handleUseSignature}
            disabled={!signatureData}
            className={cn(
              "w-full px-4 py-2 rounded-full text-sm font-medium",
              "transition-all",
              signatureData
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            Add to Document
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
