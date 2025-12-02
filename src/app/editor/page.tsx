"use client";

import dynamic from "next/dynamic";

// Dynamically import the editor with SSR disabled since react-pdf requires browser APIs
const EditorApp = dynamic(() => import("./editor-app"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="animate-pulse text-muted-foreground">Loading editor...</div>
    </div>
  ),
});

export default function EditorPage() {
  return <EditorApp />;
}
