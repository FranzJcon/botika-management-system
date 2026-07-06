import { Button } from "../ui/Button";
import type { StockIn } from "../../types/stock-in";

type DeleteStockInDraftDialogProps = {
  stockIn: StockIn;
  error: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteStockInDraftDialog({
  error,
  isSubmitting,
  onCancel,
  onConfirm,
  stockIn,
}: DeleteStockInDraftDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="delete-stock-in-draft-title"
        aria-modal="true"
        className="modal confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Draft</p>
          <h2 id="delete-stock-in-draft-title">Delete Draft?</h2>
        </div>

        <p className="confirm-message">
          This draft has not yet been finalized.
        </p>
        <p className="confirm-message">
          Deleting it will permanently remove all draft items.
        </p>

        <div className="archive-target">
          <strong>{stockIn.referenceNumber || stockIn.id}</strong>
          <span>{stockIn.items.length} item(s)</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-actions">
          <Button disabled={isSubmitting} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? "Deleting..." : "Delete Draft"}
          </Button>
        </div>
      </section>
    </div>
  );
}
