import { Button } from "../ui/Button";
import type { Brand } from "../../types/brand";

type DeleteBrandDialogProps = {
  brand: Brand;
  error: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteBrandDialog({
  brand,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteBrandDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="archive-brand-title"
        aria-modal="true"
        className="modal confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Archive</p>
          <h2 id="archive-brand-title">Archive this brand?</h2>
        </div>

        <p className="confirm-message">
          Products assigned to this brand will not be modified.
        </p>

        <div className="archive-target">
          <strong>{brand.name}</strong>
          <span>{brand.description || "No description"}</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? "Archiving..." : "Archive Brand"}
          </Button>
        </div>
      </section>
    </div>
  );
}
