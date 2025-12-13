"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableWindow } from "@/components/ui/draggable-window";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  compressPDF,
  estimateCompression,
  formatFileSize,
  type CompressionPreset,
  type CompressionResult,
} from "@paperwork/pdf-lib";

interface CompressPdfWindowProps {
  open: boolean;
  onClose: () => void;
  pdfBytes: Uint8Array | null;
  fileName: string;
}

const PRESETS: { id: CompressionPreset; label: string; description: string }[] =
  [
    { id: "web", label: "Web", description: "Smallest file, good for sharing" },
    { id: "standard", label: "Standard", description: "Balanced quality" },
    { id: "print", label: "Print", description: "Best quality, larger file" },
  ];

export function CompressPdfWindow({
  open,
  onClose,
  pdfBytes,
  fileName,
}: CompressPdfWindowProps) {
  const [preset, setPreset] = useState<CompressionPreset>("standard");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageQuality, setImageQuality] = useState(70);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [grayscale, setGrayscale] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);

  const originalSize = pdfBytes?.byteLength ?? 0;
  const estimate = estimateCompression(originalSize, preset);

  const handlePresetChange = (newPreset: CompressionPreset) => {
    setPreset(newPreset);
    // Update slider to match preset
    const qualityMap: Record<CompressionPreset, number> = {
      web: 50,
      standard: 70,
      print: 85,
    };
    setImageQuality(qualityMap[newPreset]);
  };

  const handleCompress = useCallback(async () => {
    if (!pdfBytes) return;

    setIsCompressing(true);
    setResult(null);

    try {
      const compressionResult = await compressPDF(pdfBytes, {
        preset,
        imageQuality: showAdvanced ? imageQuality / 100 : undefined,
        removeMetadata,
        grayscale,
      });

      setResult(compressionResult);

      // Auto-download the compressed file
      const blob = new Blob([new Uint8Array(compressionResult.bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.replace(/\.pdf$/i, "_compressed.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
  }, [
    pdfBytes,
    preset,
    showAdvanced,
    imageQuality,
    removeMetadata,
    grayscale,
    fileName,
  ]);

  return (
    <DraggableWindow
      open={open}
      onClose={onClose}
      title="Compress PDF"
      width={280}
    >
      <div className="p-3 space-y-3">
        {/* Original file size */}
        <div className="px-2.5 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Original size</span>
            <span className="text-xs font-medium">
              {formatFileSize(originalSize)}
            </span>
          </div>
        </div>

        {/* Quality presets */}
        <div className="space-y-2">
          <Label className="text-xs">Quality</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant={preset === p.id ? "outline" : "secondary"}
                size="sm"
                onClick={() => handlePresetChange(p.id)}
                className="h-7 text-xs rounded-lg"
              >
                {p.label}
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {PRESETS.find((p) => p.id === preset)?.description}
          </p>
        </div>

        {/* Advanced options toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform",
              showAdvanced && "rotate-180"
            )}
          />
          Advanced
        </Button>

        {/* Advanced options panel */}
        {showAdvanced && (
          <div className="space-y-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
            {/* Image quality slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Image Quality</Label>
                <span className="text-xs text-muted-foreground">
                  {imageQuality}%
                </span>
              </div>
              <Slider
                value={[imageQuality]}
                onValueChange={(v) => setImageQuality(v[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <Checkbox
                  checked={removeMetadata}
                  onCheckedChange={(checked) =>
                    setRemoveMetadata(checked === true)
                  }
                />
                <span className="text-xs">Remove metadata</span>
              </Label>

              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <Checkbox
                  checked={grayscale}
                  onCheckedChange={(checked) => setGrayscale(checked === true)}
                />
                <span className="text-xs">Convert to grayscale</span>
              </Label>
            </div>
          </div>
        )}

        {/* Estimated/actual result */}
        <div className="px-2.5 py-2 rounded-lg bg-muted/50">
          {result ? (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Compressed
                </span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {formatFileSize(result.compressedSize)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reduction</span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {result.reductionPercent}% smaller
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Estimated</span>
              <span className="text-xs">
                ~{formatFileSize(estimate.estimatedSize)}{" "}
                <span className="text-muted-foreground">
                  ({estimate.estimatedReduction}% smaller)
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Compress button */}
        <Button
          type="button"
          onClick={handleCompress}
          disabled={isCompressing || !pdfBytes}
          size="sm"
          className="w-full h-8 text-xs"
        >
          {isCompressing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Compressing...
            </>
          ) : result ? (
            <>
              <Download className="w-3.5 h-3.5" />
              Download Again
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              Compress & Download
            </>
          )}
        </Button>
      </div>
    </DraggableWindow>
  );
}
