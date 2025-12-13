"use client";

import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableWindow } from "@/components/ui/draggable-window";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@paperwork/pdf-lib";

interface ToolWindowProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

/**
 * Base window container for micro-app tools
 */
export function ToolWindow({
  open,
  onClose,
  title,
  children,
  width = 280,
}: ToolWindowProps) {
  return (
    <DraggableWindow open={open} onClose={onClose} title={title} width={width}>
      <div className="p-3 space-y-3">{children}</div>
    </DraggableWindow>
  );
}

interface ToolFileSizeProps {
  label: string;
  size: number;
  variant?: "default" | "success";
}

/**
 * File size display row
 */
export function ToolFileSize({ label, size, variant = "default" }: ToolFileSizeProps) {
  return (
    <div className="px-2.5 py-2 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span
          className={cn(
            "text-xs font-medium",
            variant === "success" && "text-green-600 dark:text-green-400"
          )}
        >
          {formatFileSize(size)}
        </span>
      </div>
    </div>
  );
}

interface ToolActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

/**
 * Primary action button for tools
 */
export function ToolActionButton({
  onClick,
  disabled,
  isLoading,
  loadingText = "Processing...",
  children,
}: ToolActionButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      size="sm"
      className="w-full h-8 text-xs"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

interface ToolDownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  isDone?: boolean;
}

/**
 * Download action button with loading/done states
 */
export function ToolDownloadButton({
  onClick,
  disabled,
  isLoading,
  isDone,
}: ToolDownloadButtonProps) {
  return (
    <ToolActionButton
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      loadingText="Processing..."
    >
      <Download className="w-3.5 h-3.5" />
      {isDone ? "Download Again" : "Download"}
    </ToolActionButton>
  );
}

interface ToolSectionProps {
  label: string;
  children: React.ReactNode;
}

/**
 * Labeled section within a tool
 */
export function ToolSection({ label, children }: ToolSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

/**
 * Helper to download PDF bytes as a file
 */
export function downloadPdf(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
