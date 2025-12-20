/**
 * Stub module for micro-apps.
 * These are web-app specific features not available in widget mode.
 */

export interface MicroApp {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

interface MicroAppComboboxProps {
  onSelect?: (app: MicroApp) => void;
  hasDocument?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Stub component - renders nothing in widget mode */
export function MicroAppCombobox(_props: MicroAppComboboxProps) {
  return null;
}

/** Common props for window components */
interface WindowProps {
  open?: boolean;
  onClose?: () => void;
  pdfBytes?: Uint8Array | null;
  fileName?: string;
  onAddTab?: (file: File, bytes: Uint8Array) => void;
  onApply?: (newBytes: Uint8Array) => void;
}

/** Stub window components - render nothing in widget mode */
export function CompressPdfWindow(_props: WindowProps) { return null; }
export function UnlockPdfWindow(_props: WindowProps) { return null; }
export function FlattenPdfWindow(_props: WindowProps) { return null; }
export function SplitPdfWindow(_props: WindowProps) { return null; }
export function RotatePdfWindow(_props: WindowProps) { return null; }
export function OcrPdfWindow(_props: WindowProps) { return null; }
