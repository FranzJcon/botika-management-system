import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import type {
  ProductClassification,
  ProductClassificationFormValues,
  ProductClassificationPayload,
} from "../../types/product-classification";

type ProductClassificationFormProps = {
  productClassification?: ProductClassification | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: ProductClassificationPayload) => Promise<void>;
};

const emptyValues: ProductClassificationFormValues = {
  name: "",
  description: "",
};

const toPayload = (
  values: ProductClassificationFormValues,
): ProductClassificationPayload => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
});

export function ProductClassificationForm({
  productClassification,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductClassificationFormProps) {
  const [values, setValues] =
    useState<ProductClassificationFormValues>(emptyValues);

  useEffect(() => {
    if (!productClassification) {
      setValues(emptyValues);
      return;
    }

    setValues({
      name: productClassification.name,
      description: productClassification.description ?? "",
    });
  }, [productClassification]);

  const title = productClassification
    ? "Edit Product Classification"
    : "New Product Classification";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(toPayload(values));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="product-classification-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Product Classifications</p>
            <h2 id="product-classification-title">{title}</h2>
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
            placeholder="Over-the-Counter (OTC)"
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
            placeholder="Medicines available without prescription"
            value={values.description}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Product Classification"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
