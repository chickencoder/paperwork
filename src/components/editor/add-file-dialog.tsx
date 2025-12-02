"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FileText, GripVertical, Files, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MergeSource {
  file: File;
  bytes: Uint8Array;
}

interface CurrentDocument {
  fileName: string;
  bytes: Uint8Array;
}

interface AddFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingFiles: File[];
  currentDocument?: CurrentDocument;
  onEditSeparately: (files: File[]) => void;
  onMerge: (sources: MergeSource[]) => void;
}

type ActionType = "separate" | "merge";

export function AddFileDialog({
  open,
  onOpenChange,
  pendingFiles,
  currentDocument,
  onEditSeparately,
  onMerge,
}: AddFileDialogProps) {
  const [step, setStep] = useState<"choose" | "order">("choose");
  const [selectedAction, setSelectedAction] = useState<ActionType>("separate");
  const [orderedSources, setOrderedSources] = useState<MergeSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const initializedRef = useRef(false);

  // Load file bytes when dialog opens (only once)
  useEffect(() => {
    if (open && pendingFiles.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      setIsLoading(true);
      Promise.all(
        pendingFiles.map(async (file) => {
          const buffer = await file.arrayBuffer();
          return { file, bytes: new Uint8Array(buffer) };
        })
      ).then((sources) => {
        // If we have a current document, include it at the beginning for merge
        if (currentDocument) {
          const currentFile = new File(
            [currentDocument.bytes as BlobPart],
            currentDocument.fileName,
            {
              type: "application/pdf",
            }
          );
          setOrderedSources([
            { file: currentFile, bytes: currentDocument.bytes },
            ...sources,
          ]);
        } else {
          setOrderedSources(sources);
        }
        setIsLoading(false);
      });
    }
  }, [open, pendingFiles, currentDocument]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("choose");
      setSelectedAction("separate");
      setOrderedSources([]);
      setDraggedIndex(null);
      setDragOverIndex(null);
      initializedRef.current = false;
    }
  }, [open]);

  const handleContinue = useCallback(() => {
    if (selectedAction === "separate") {
      onEditSeparately(pendingFiles);
      onOpenChange(false);
    } else {
      setStep("order");
    }
  }, [selectedAction, pendingFiles, onEditSeparately, onOpenChange]);

  const handleMerge = useCallback(() => {
    onMerge(orderedSources);
    onOpenChange(false);
  }, [orderedSources, onMerge, onOpenChange]);

  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    []
  );

  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're actually leaving the element (not entering a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Get the source index from dataTransfer or draggedIndex
      const dataIndex = e.dataTransfer.getData("text/plain");
      const fromIndex = dataIndex ? parseInt(dataIndex, 10) : draggedIndex;

      if (fromIndex !== null && !isNaN(fromIndex) && fromIndex !== toIndex) {
        setOrderedSources((prev) => {
          const newOrder = [...prev];
          const [removed] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, removed);
          return newOrder;
        });
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const fileCount = pendingFiles.length;
  const canMerge = currentDocument || fileCount >= 2;

  // Step 1: Choose action
  if (step === "choose") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Import files</DialogTitle>
            <DialogDescription>
              Choose how you want to handle{" "}
              {fileCount > 1 ? "these files" : "this file"}.
            </DialogDescription>
          </DialogHeader>

          {/* File list preview */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {pendingFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-lg"
              >
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground truncate">{file.name}</span>
              </div>
            ))}
          </div>

          {/* Action options */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedAction("separate")}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all",
                selectedAction === "separate"
                  ? "bg-primary/5 ring-2 ring-primary"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <Files
                className={cn(
                  "w-4 h-4 flex-shrink-0 mx-1 transition-colors",
                  selectedAction === "separate"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  Edit separately
                </div>
                <div className="text-xs text-muted-foreground">
                  Open each file in its own tab
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => canMerge && setSelectedAction("merge")}
              disabled={!canMerge}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all",
                !canMerge && "opacity-50 cursor-not-allowed",
                selectedAction === "merge"
                  ? "bg-primary/5 ring-2 ring-primary"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <Layers
                className={cn(
                  "w-4 h-4 flex-shrink-0 mx-1 transition-colors",
                  selectedAction === "merge"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  Merge files
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentDocument
                    ? "Combine with current document"
                    : "Combine into a single document"}
                </div>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleContinue} disabled={isLoading}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Order for merge
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Arrange page order</DialogTitle>
          <DialogDescription>
            Drag to reorder. Files will be merged in this order.
          </DialogDescription>
        </DialogHeader>

        {/* Draggable list */}
        <div
          className="space-y-1.5 max-h-64 overflow-y-auto"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = "move";
            }
          }}
        >
          {orderedSources.map((source, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isCurrentDoc =
              currentDocument &&
              source.file.name === currentDocument.fileName &&
              index === 0;

            return (
              <div
                key={`${source.file.name}-${source.file.size}-${index}`}
                draggable={true}
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver(index)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-move select-none",
                  "bg-muted",
                  "transition-all duration-150",
                  isDragging && "opacity-50",
                  isDragOver && "ring-2 ring-primary ring-offset-1"
                )}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="w-5 h-5 rounded-full bg-background text-muted-foreground text-xs font-medium flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground truncate flex-1">
                  {source.file.name}
                </span>
                {isCurrentDoc && (
                  <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full flex-shrink-0">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setStep("choose")}>
            Back
          </Button>
          <Button onClick={handleMerge} disabled={isLoading}>
            Merge files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
