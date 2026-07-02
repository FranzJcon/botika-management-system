import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import type { Brand, BrandFormValues, BrandPayload } from "../../types/brand";

type BrandFormProps = {
  brand?: Brand | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: BrandPayload) => Promise<void>;
};

const emptyValues: BrandFormValues = {
  name: "",
  description: "",
};

const toPayload = (values: BrandFormValues): BrandPayload => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
});

export function BrandForm({
  brand,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: BrandFormProps) {
  const [values, setValues] = useState<BrandFormValues>(emptyValues);

  useEffect(() => {
    if (!brand) {
      setValues(emptyValues);
      return;
    }

    setValues({
      name: brand.name,
      description: brand.description ?? "",
    });
  }, [brand]);

  const title = brand ? "Edit Brand" : "New Brand";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(toPayload(values));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="brand-form-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Brands</p>
            <h2 id="brand-form-title">{title}</h2>
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
            placeholder="Biogesic"
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
            placeholder="Commercial brand name"
            value={values.description}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Brand"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
