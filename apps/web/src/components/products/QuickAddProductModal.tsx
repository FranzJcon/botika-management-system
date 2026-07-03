import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { isPharmaceuticalCategory } from "../../lib/product-categories";
import type { Category } from "../../types/category";
import type { ProductPayload } from "../../types/product";

type QuickAddProductModalProps = {
  categories: Category[];
  initialName?: string;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: ProductPayload) => Promise<void>;
};

const activeOnly = (categories: Category[]) =>
  categories.filter((category) => category.isActive);

export function QuickAddProductModal({
  categories,
  error,
  initialName = "",
  isSubmitting,
  onClose,
  onSubmit,
}: QuickAddProductModalProps) {
  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !categoryId) {
      setValidationError("Product name and category are required.");
      return;
    }

    if (sellingPrice.trim() && Number(sellingPrice) < 0) {
      setValidationError("Selling price must be zero or greater.");
      return;
    }

    const selectedCategory = categories.find((category) => category.id === categoryId);

    setValidationError(null);
    await onSubmit({
      name: name.trim(),
      categoryId,
      defaultSellingPrice: sellingPrice.trim() ? Number(sellingPrice) : null,
      unit: "piece",
      productType: isPharmaceuticalCategory(selectedCategory)
        ? "MEDICINE"
        : "NON_MEDICINE",
      reorderLevel: 0,
      requiresPrescription: false,
      requiresExpiryTracking: false,
      requiresLotTracking: false,
    });
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="quick-add-product-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Products</p>
            <h2 id="quick-add-product-title">Quick Add Product</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Product Name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <Select
            label="Category"
            onChange={(event) => setCategoryId(event.target.value)}
            required
            value={categoryId}
          >
            <option value="">Select category</option>
            {activeOnly(categories).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Input
            label="Selling Price"
            min="0"
            onChange={(event) => setSellingPrice(event.target.value)}
            step="0.01"
            type="number"
            value={sellingPrice}
          />

          {validationError ? <p className="form-error">{validationError}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
