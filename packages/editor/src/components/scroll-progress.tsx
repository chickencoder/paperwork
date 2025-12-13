import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  progress: number;
  currentPage: number;
  totalPages: number;
  hasTabBar?: boolean;
}

export function ScrollProgress({ progress, currentPage, totalPages, hasTabBar = false }: ScrollProgressProps) {
  if (totalPages === 0) {
    return null;
  }

  return (
    <>
      {/* Progress bar - only show if more than 1 page */}
      {totalPages > 1 && (
        <div className="fixed top-0 left-0 right-0 h-0.5 z-[70] pointer-events-none">
          <div
            className="h-full bg-primary transition-[width] duration-75 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Page indicator - always show */}
      <div
        className={cn(
          "fixed left-3 z-[70] pointer-events-none",
          hasTabBar ? "top-[50px]" : "top-3"
        )}
      >
        <div className="px-2 py-1 rounded-md bg-foreground/5 backdrop-blur-sm text-xs font-medium text-muted-foreground tabular-nums">
          {currentPage} / {totalPages}
        </div>
      </div>
    </>
  );
}
