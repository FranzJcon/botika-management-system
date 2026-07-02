import { Button } from "../ui/Button";

type CompleteSaleDialogProps = {
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CompleteSaleDialog({
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: CompleteSaleDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="complete-sale-title"
        aria-modal="true"
        className="modal confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Sales</p>
          <h2 id="complete-sale-title">Complete this sale?</h2>
        </div>
        <p className="confirm-message">
          Inventory will be deducted immediately.
          <br />
          This action cannot be undone.
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="modal-actions">
          <Button disabled={isSubmitting} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? "Completing..." : "Complete Sale"}
          </Button>
        </div>
      </section>
    </div>
  );
}
