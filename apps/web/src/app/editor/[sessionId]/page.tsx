"use client";

import dynamic from "next/dynamic";
import { use } from "react";

// Dynamically import the editor with SSR disabled since react-pdf requires browser APIs
const EditorApp = dynamic(() => import("../editor-app"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-muted" />,
});

export default function EditorPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  return <EditorApp sessionId={sessionId} />;
}
