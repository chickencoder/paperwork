"use client";

import { useState, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@paperwork/ui/utils";
import type { DocumentTab, TabId } from "../hooks/use-multi-document-state";

interface TabBarProps {
  tabs: DocumentTab[];
  activeTabId: TabId | null;
  onTabSelect: (tabId: TabId) => void;
  onTabClose: (tabId: TabId) => void;
  onTabReorder: (fromIndex: number, toIndex: number) => void;
  onAddFile: () => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabReorder,
  onAddFile,
}: TabBarProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
      e.dataTransfer.dropEffect = "move";
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => (e: React.DragEvent) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        onTabReorder(fromIndex, toIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [onTabReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleTabClose = useCallback(
    (tabId: TabId) => (e: React.MouseEvent) => {
      e.stopPropagation();
      onTabClose(tabId);
    },
    [onTabClose]
  );

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[60] flex items-center gap-0.5 px-3 py-1.5 bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] overflow-x-auto overscroll-contain">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div
            key={tab.id}
            draggable
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            onClick={() => onTabSelect(tab.id)}
            className={cn(
              "group relative flex items-center gap-1.5 h-7 px-2.5 rounded-md cursor-pointer select-none",
              "transition-all duration-100",
              isActive
                ? "bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              isDragging && "opacity-50",
              isDragOver && "ring-1 ring-ring"
            )}
          >
            <span
              className={cn(
                "text-xs font-medium max-w-[120px] truncate",
                isActive ? "text-foreground" : "text-inherit"
              )}
            >
              {tab.fileName}
            </span>
            <button
              onClick={handleTabClose(tab.id)}
              className={cn(
                "flex items-center justify-center w-4 h-4 rounded hover:bg-secondary/80 flex-shrink-0",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                isActive && "opacity-40 group-hover:opacity-100"
              )}
              title={tab.isDirty ? "Close (unsaved changes)" : "Close tab"}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      <button
        onClick={onAddFile}
        className="flex items-center justify-center w-6 h-6 ml-0.5 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        title="Add file"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
