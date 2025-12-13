import { useMemo } from "react";

interface UseScrollProgressOptions {
  currentPage: number;
  totalPages: number;
}

export function useScrollProgress({ currentPage, totalPages }: UseScrollProgressOptions) {
  // Calculate progress based on current page position
  // At page 1, progress is 0; at last page, progress is 1
  const progress = useMemo(() => {
    if (totalPages <= 1) return 0;
    return (currentPage - 1) / (totalPages - 1);
  }, [currentPage, totalPages]);

  return progress;
}
