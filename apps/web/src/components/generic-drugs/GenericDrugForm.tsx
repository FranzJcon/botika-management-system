import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import type {
  GenericDrug,
  GenericDrugFormValues,
  GenericDrugPayload,
} from "../../types/generic-drug";

type GenericDrugFormProps = {
  genericDrug?: GenericDrug | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: GenericDrugPayload) => Promise<void>;
};

const emptyValues: GenericDrugFormValues = {
  name: "",
  description: "",
};

const toPayload = (values: GenericDrugFormValues): GenericDrugPayload => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
});

export function GenericDrugForm({
  genericDrug,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: GenericDrugFormProps) {
  const [values, setValues] = useState<GenericDrugFormValues>(emptyValues);

  useEffect(() => {
    if (!genericDrug) {
      setValues(emptyValues);
      return;
    }

    setValues({
      name: genericDrug.name,
      description: genericDrug.description ?? "",
    });
  }, [genericDrug]);

  const title = genericDrug ? "Edit Generic Drug" : "New Generic Drug";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(toPayload(values));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="generic-drug-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Generic Drugs</p>
            <h2 id="generic-drug-title">{title}</h2>
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
            placeholder="Paracetamol"
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
            placeholder="Analgesic and antipyretic"
            value={values.description}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Generic Drug"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
