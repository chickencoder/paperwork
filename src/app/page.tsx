import { LandingDialog } from "@/components/landing/landing-dialog";
import { EditorBackdrop } from "@/components/landing/editor-backdrop";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      {/* Editor shell in background (dimmed) */}
      <EditorBackdrop />

      {/* Landing dialog overlay */}
      <LandingDialog />
    </main>
  );
}
