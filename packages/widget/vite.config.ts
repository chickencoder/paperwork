import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      // Workspace package aliases
      "@paperwork/editor": resolve(__dirname, "../editor/src"),
      "@paperwork/ui": resolve(__dirname, "../ui/src"),
      "@paperwork/pdf-lib": resolve(__dirname, "../pdf-lib/src"),
    },
  },
  build: {
    // Bundle everything into a single HTML file for ChatGPT Apps SDK
    target: "esnext",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
