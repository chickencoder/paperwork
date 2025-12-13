/**
 * A minimal background that appears behind the landing dialog.
 * Just a subtle gradient - no fake UI elements.
 */
export function EditorBackdrop() {
  return (
    <div
      className="fixed inset-0 bg-gradient-to-b from-muted/30 to-muted/60"
      aria-hidden="true"
    />
  );
}
