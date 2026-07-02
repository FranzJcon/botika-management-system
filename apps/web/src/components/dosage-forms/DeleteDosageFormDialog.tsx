import { Button } from "../ui/Button";
import type { DosageForm } from "../../types/dosage-form";

type DeleteDosageFormDialogProps = {
  dosageForm: DosageForm;
  error: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteDosageFormDialog({
  dosageForm,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteDosageFormDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="archive-dosage-form-title"
        aria-modal="true"
        className="modal confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Archive</p>
          <h2 id="archive-dosage-form-title">Archive this dosage form?</h2>
        </div>

        <p className="confirm-message">
          Products assigned to this dosage form will not be modified.
        </p>

        <div className="archive-target">
          <strong>{dosageForm.name}</strong>
          <span>{dosageForm.description || "No description"}</span>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? "Archiving..." : "Archive Dosage Form"}
          </Button>
        </div>
      </section>
    </div>
  );
}
