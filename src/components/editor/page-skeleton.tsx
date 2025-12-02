import { cn } from "@/lib/utils";

// Default US Letter page size (612x792 points at 72 DPI)
const DEFAULT_PAGE_WIDTH = 612;
const DEFAULT_PAGE_HEIGHT = 792;

interface PageSkeletonProps {
  scale: number;
  pageWidth?: number;
  pageHeight?: number;
  pageNumber?: number;
  className?: string;
}

export function PageSkeleton({
  scale,
  pageWidth = DEFAULT_PAGE_WIDTH,
  pageHeight = DEFAULT_PAGE_HEIGHT,
  pageNumber,
  className,
}: PageSkeletonProps) {
  const width = pageWidth * scale;
  const height = pageHeight * scale;

  return (
    <div
      className={cn(
        "relative shadow-xl rounded-sm bg-white overflow-hidden",
        className
      )}
      style={{ width, height }}
      role="img"
      aria-label={pageNumber ? `Page ${pageNumber} loading` : "Page loading"}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Simulated content blocks */}
      <div
        className="absolute flex flex-col gap-3"
        style={{
          top: 32 * scale,
          left: 32 * scale,
          right: 32 * scale,
        }}
      >
        {/* Header block */}
        <div
          className="bg-muted/50 rounded"
          style={{
            height: 12 * scale,
            width: "60%",
          }}
        />

        {/* Paragraph blocks - simulate text content */}
        {Array.from({ length: 6 }).map((_, blockIndex) => (
          <div
            key={blockIndex}
            className="flex flex-col gap-1.5"
            style={{ marginTop: blockIndex === 0 ? 8 * scale : 4 * scale }}
          >
            {Array.from({ length: 3 }).map((_, lineIndex) => (
              <div
                key={lineIndex}
                className="bg-muted/30 rounded"
                style={{
                  height: 6 * scale,
                  width:
                    lineIndex === 2
                      ? `${60 + Math.random() * 20}%`
                      : `${90 + Math.random() * 10}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Optional page number indicator */}
      {pageNumber !== undefined && (
        <div
          className="absolute text-muted-foreground/30 font-medium"
          style={{
            bottom: 16 * scale,
            right: 16 * scale,
            fontSize: 10 * scale,
          }}
        >
          {pageNumber}
        </div>
      )}
    </div>
  );
}
