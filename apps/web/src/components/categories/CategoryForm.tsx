import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import type {
  Category,
  CategoryFormValues,
  CategoryPayload,
} from "../../types/category";

type CategoryFormProps = {
  categories: Category[];
  category?: Category | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CategoryPayload) => Promise<void>;
};

const emptyValues: CategoryFormValues = {
  name: "",
  description: "",
  parentId: "",
};

const toPayload = (values: CategoryFormValues): CategoryPayload => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
  parentId: values.parentId || null,
});

export function CategoryForm({
  categories,
  category,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: CategoryFormProps) {
  const [values, setValues] = useState<CategoryFormValues>(emptyValues);

  useEffect(() => {
    if (!category) {
      setValues(emptyValues);
      return;
    }

    setValues({
      name: category.name,
      description: category.description ?? "",
      parentId: category.parentId ?? "",
    });
  }, [category]);

  const parentOptions = useMemo(
    () =>
      categories.filter(
        (parentCategory) =>
          parentCategory.isActive && parentCategory.id !== category?.id,
      ),
    [categories, category?.id],
  );

  const title = category ? "Edit Category" : "New Category";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(toPayload(values));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="category-form-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Categories</p>
            <h2 id="category-form-title">{title}</h2>
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
            placeholder="Oral Care"
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
            placeholder="Products related to oral hygiene"
            value={values.description}
          />

          <Select
            label="Parent Category"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                parentId: event.target.value,
              }))
            }
            value={values.parentId}
          >
            <option value="">None</option>
            {parentOptions.map((parentCategory) => (
              <option key={parentCategory.id} value={parentCategory.id}>
                {parentCategory.name}
              </option>
            ))}
          </Select>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
