import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SignatureTypePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
}

const SIGNATURE_FONTS = [
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Caveat", family: "'Caveat', cursive" },
] as const;

export function SignatureTypePad({ onSignatureChange }: SignatureTypePadProps) {
  const [name, setName] = useState("");
  const [selectedFont, setSelectedFont] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Wait for fonts to load
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // Generate signature image when name or font changes
  const generateSignature = useCallback(() => {
    if (!name.trim() || !fontsLoaded) {
      onSignatureChange(null);
      return;
    }

    const font = SIGNATURE_FONTS[selectedFont];
    const fontSize = 48;
    const padding = 20;

    // Create a canvas to measure and draw
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set font and measure text
    ctx.font = `${fontSize}px ${font.family}`;
    const metrics = ctx.measureText(name);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    // Size canvas to fit text with padding
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (textWidth + padding * 2) * dpr;
    canvas.height = (textHeight + padding * 2) * dpr;
    ctx.scale(dpr, dpr);

    // Draw text
    ctx.font = `${fontSize}px ${font.family}`;
    ctx.fillStyle = "#1c1917"; // stone-900
    ctx.textBaseline = "middle";
    ctx.fillText(name, padding, (textHeight + padding * 2) / 2);

    onSignatureChange(canvas.toDataURL("image/png"));
  }, [name, selectedFont, fontsLoaded, onSignatureChange]);

  useEffect(() => {
    generateSignature();
  }, [generateSignature]);

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type your name"
          className={cn(
            "w-full px-3 py-2 rounded-lg border border-stone-300",
            "font-body text-stone-900 placeholder:text-stone-400",
            "focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
          )}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm text-stone-500 font-body">Choose a style:</span>
        <div className="grid grid-cols-1 gap-2">
          {SIGNATURE_FONTS.map((font, index) => (
            <button
              key={font.name}
              type="button"
              onClick={() => setSelectedFont(index)}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all",
                "hover:border-stone-400",
                selectedFont === index
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 bg-white"
              )}
            >
              <span
                className="text-2xl text-stone-900 block truncate"
                style={{ fontFamily: font.family }}
              >
                {name || "Your Name"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
