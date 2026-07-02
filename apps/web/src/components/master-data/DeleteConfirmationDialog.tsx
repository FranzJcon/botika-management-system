import { Button } from "../ui/Button";

type DeleteConfirmationDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading: boolean;
  error: string | null;
  targetName: string;
  targetDescription?: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function DeleteConfirmationDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  error,
  loading,
  message,
  onCancel,
  onConfirm,
  targetDescription,
  targetName,
  title,
}: DeleteConfirmationDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="delete-confirmation-title"
        aria-modal="true"
        className="modal confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Archive</p>
          <h2 id="delete-confirmation-title">{title}</h2>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="archive-target">
          <strong>{targetName}</strong>
          <span>{targetDescription || "No description"}</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button disabled={loading} onClick={onConfirm}>
            {loading ? "Archiving..." : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
