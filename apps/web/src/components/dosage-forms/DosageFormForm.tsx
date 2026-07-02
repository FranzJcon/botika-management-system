import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import type {
  DosageForm,
  DosageFormFormValues,
  DosageFormPayload,
} from "../../types/dosage-form";

type DosageFormFormProps = {
  dosageForm?: DosageForm | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: DosageFormPayload) => Promise<void>;
};

const emptyValues: DosageFormFormValues = {
  name: "",
  description: "",
};

const toPayload = (values: DosageFormFormValues): DosageFormPayload => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
});

export function DosageFormForm({
  dosageForm,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: DosageFormFormProps) {
  const [values, setValues] = useState<DosageFormFormValues>(emptyValues);

  useEffect(() => {
    if (!dosageForm) {
      setValues(emptyValues);
      return;
    }

    setValues({
      name: dosageForm.name,
      description: dosageForm.description ?? "",
    });
  }, [dosageForm]);

  const title = dosageForm ? "Edit Dosage Form" : "New Dosage Form";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(toPayload(values));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="dosage-form-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Dosage Forms</p>
            <h2 id="dosage-form-title">{title}</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Name"
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Tablet"
            required
            value={values.name}
          />

          <Textarea
            label="Description"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Solid oral dosage form"
            value={values.description}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Dosage Form"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
