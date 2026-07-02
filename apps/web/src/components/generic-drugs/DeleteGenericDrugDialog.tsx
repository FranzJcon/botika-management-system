import { Button } from "../ui/Button";
import type { GenericDrug } from "../../types/generic-drug";

type DeleteGenericDrugDialogProps = {
  genericDrug: GenericDrug;
  error: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteGenericDrugDialog({
  genericDrug,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteGenericDrugDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="archive-generic-drug-title"
        aria-modal="true"
        className="modal confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Archive</p>
          <h2 id="archive-generic-drug-title">Archive this generic drug?</h2>
        </div>

        <p className="confirm-message">
          Products assigned to this generic drug will not be modified.
        </p>

        <div className="archive-target">
          <strong>{genericDrug.name}</strong>
          <span>{genericDrug.description || "No description"}</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? "Archiving..." : "Archive Generic Drug"}
          </Button>
        </div>
      </section>
    </div>
  );
}
