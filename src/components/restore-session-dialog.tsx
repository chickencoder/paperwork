import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RestoreSessionDialogProps {
  open: boolean;
  documentCount: number;
  onRestore: () => void;
  onStartFresh: () => void;
}

export function RestoreSessionDialog({
  open,
  documentCount,
  onRestore,
  onStartFresh,
}: RestoreSessionDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Previous Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Found {documentCount} document{documentCount !== 1 ? "s" : ""} from
            your last session. Would you like to restore them?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartFresh}>Discard</AlertDialogCancel>
          <AlertDialogAction onClick={onRestore} autoFocus>
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
