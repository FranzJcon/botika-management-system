import { Button } from "../ui/Button";
import type { StockIn } from "../../types/stock-in";

type PostStockInDialogProps = {
  stockIn: StockIn;
  error: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function PostStockInDialog({
  error,
  isSubmitting,
  onCancel,
  onConfirm,
  stockIn,
}: PostStockInDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="post-stock-in-title"
        aria-modal="true"
        className="modal confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Post Stock In</p>
          <h2 id="post-stock-in-title">Post this Stock In?</h2>
        </div>

        <p className="confirm-message">
          Inventory will become immediately available after posting.
        </p>
        <p className="confirm-message">This action cannot be undone.</p>

        <div className="archive-target">
          <strong>{stockIn.referenceNumber || stockIn.id}</strong>
          <span>{stockIn.items.length} item(s)</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? "Posting..." : "Post Stock In"}
          </Button>
        </div>
      </section>
    </div>
  );
}
