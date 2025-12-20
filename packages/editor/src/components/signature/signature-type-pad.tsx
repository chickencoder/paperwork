"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@paperwork/ui/utils";

interface SignatureTypePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
}

const SIGNATURE_FONTS = [
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Allura", family: "'Allura', cursive" },
  { name: "Sacramento", family: "'Sacramento', cursive" },
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Pacifico", family: "'Pacifico', cursive" },
  { name: "Satisfy", family: "'Satisfy', cursive" },
  { name: "Kalam", family: "'Kalam', cursive" },
  { name: "Permanent Marker", family: "'Permanent Marker', cursive" },
  { name: "Shadows Into Light", family: "'Shadows Into Light', cursive" },
  { name: "Indie Flower", family: "'Indie Flower', cursive" },
  { name: "Amatic SC", family: "'Amatic SC', cursive" },
  { name: "Brush Script", family: "'Brush Script MT', cursive" },
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

    // Draw text in black (color can be changed after placing)
    ctx.font = `${fontSize}px ${font.family}`;
    ctx.fillStyle = "#1a1a1a";
    ctx.textBaseline = "middle";
    ctx.fillText(name, padding, (textHeight + padding * 2) / 2);

    onSignatureChange(canvas.toDataURL("image/png"));
  }, [name, selectedFont, fontsLoaded, onSignatureChange]);

  useEffect(() => {
    generateSignature();
  }, [generateSignature]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type your name"
        className={cn(
          "w-full px-3 py-2 rounded-lg border border-input text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
        )}
        autoFocus
      />

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Style</span>
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
          {SIGNATURE_FONTS.map((font, index) => (
            <button
              key={font.name}
              type="button"
              onClick={() => setSelectedFont(index)}
              className={cn(
                "p-2.5 rounded-lg border-2 text-left transition-all",
                "hover:border-ring",
                selectedFont === index
                  ? "border-ring bg-accent"
                  : "border-border bg-card"
              )}
            >
              <span
                className="text-xl text-foreground block truncate"
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
