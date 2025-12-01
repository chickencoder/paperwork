import { useState, useCallback, useRef } from "react";
import { FileUp, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProps {
  onFileSelect: (file: File) => void;
}

export function Upload({ onFileSelect }: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === "application/pdf") {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFBF7] relative overflow-hidden">
      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-amber-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tl from-stone-200/30 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 shadow-lg">
            <FileText className="w-6 h-6 text-amber-50" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-stone-900">
            Paperwork
          </h1>
        </div>
        <p className="font-body text-lg text-stone-500 max-w-md">
          Fill out PDFs with ease. Drop a document to get started.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl aspect-[4/3] rounded-2xl transition-all duration-500 cursor-pointer group",
          "bg-gradient-to-b from-white to-stone-50/80",
          "border-2 border-dashed",
          isDragging
            ? "border-amber-400 bg-amber-50/50 scale-[1.02] shadow-2xl shadow-amber-100/50"
            : isHovering
              ? "border-stone-300 shadow-xl shadow-stone-200/50"
              : "border-stone-200 shadow-lg shadow-stone-100/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Inner glow effect */}
        <div
          className={cn(
            "absolute inset-4 rounded-xl transition-opacity duration-500",
            "bg-gradient-to-br from-amber-50/50 via-transparent to-stone-100/50",
            isDragging ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-stone-200 rounded-tl-lg opacity-50" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-stone-200 rounded-tr-lg opacity-50" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-stone-200 rounded-bl-lg opacity-50" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-stone-200 rounded-br-lg opacity-50" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div
            className={cn(
              "relative mb-6 transition-all duration-500",
              isDragging ? "scale-110 -translate-y-2" : "group-hover:scale-105"
            )}
          >
            {/* Animated rings */}
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-700",
                isDragging
                  ? "animate-ping bg-amber-200/30 scale-150"
                  : "scale-100"
              )}
            />
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-br from-stone-100 to-stone-200",
                isDragging && "from-amber-100 to-amber-200"
              )}
            >
              <FileUp
                className={cn(
                  "w-9 h-9 transition-all duration-300",
                  isDragging
                    ? "text-amber-600 -translate-y-1"
                    : "text-stone-400 group-hover:text-stone-600"
                )}
              />
            </div>
          </div>

          <div className="text-center">
            <p
              className={cn(
                "font-display text-xl font-medium mb-2 transition-colors duration-300",
                isDragging ? "text-amber-700" : "text-stone-700"
              )}
            >
              {isDragging ? "Release to upload" : "Drop your PDF here"}
            </p>
            <p className="font-body text-sm text-stone-400 mb-4">
              or click to browse files
            </p>

            {/* File type indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100/80 border border-stone-200/50">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-body text-xs text-stone-500 uppercase tracking-wider">
                PDF files supported
              </span>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Footer hint */}
      <p className="relative z-10 mt-8 font-body text-xs text-stone-400 animate-fade-in-delayed">
        Your documents stay private  everything happens in your browser
      </p>
    </div>
  );
}
