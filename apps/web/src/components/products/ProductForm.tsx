import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { isPharmaceuticalCategory } from "../../lib/product-categories";
import type {
  Product,
  ProductFormValues,
  ProductLookupData,
  ProductPayload,
} from "../../types/product";

type ProductFormProps = {
  product?: Product | null;
  lookups: ProductLookupData;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: ProductPayload) => Promise<void>;
};

const emptyValues: ProductFormValues = {
  sku: "",
  name: "",
  categoryId: "",
  brandId: "",
  genericDrugId: "",
  dosageFormId: "",
  classificationId: "",
  productType: "NON_MEDICINE",
  defaultSellingPrice: "",
  reorderLevel: "0",
  requiresPrescription: false,
  requiresExpiryTracking: false,
  requiresLotTracking: false,
  description: "",
  status: "ACTIVE",
};

const activeOnly = <T extends { isActive: boolean }>(items: T[]) =>
  items.filter((item) => item.isActive);

const toOptionalNumber = (value: string) =>
  value.trim() === "" ? null : Number(value);

const toOptionalId = (value: string) => value || null;

const toPayload = (
  values: ProductFormValues,
  selectedCategory: ProductLookupData["categories"][number] | null,
): ProductPayload => ({
  sku: values.sku.trim() || null,
  name: values.name.trim(),
  categoryId: values.categoryId,
  brandId: toOptionalId(values.brandId),
  genericDrugId: toOptionalId(values.genericDrugId),
  dosageFormId: toOptionalId(values.dosageFormId),
  classificationId: toOptionalId(values.classificationId),
  productType: isPharmaceuticalCategory(selectedCategory)
    ? "MEDICINE"
    : "NON_MEDICINE",
  defaultSellingPrice: toOptionalNumber(values.defaultSellingPrice),
  reorderLevel: Number(values.reorderLevel),
  requiresPrescription: values.requiresPrescription,
  requiresExpiryTracking: values.requiresExpiryTracking,
  requiresLotTracking: values.requiresLotTracking,
  status: values.status,
});

export function ProductForm({
  error,
  isSubmitting,
  lookups,
  onClose,
  onSubmit,
  product,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) {
      setValues(emptyValues);
      setValidationError(null);
      return;
    }

    setValues({
      sku: product.sku ?? "",
      name: product.name,
      categoryId: product.categoryId ?? "",
      brandId: product.brandId ?? "",
      genericDrugId: product.genericDrugId ?? "",
      dosageFormId: product.dosageFormId ?? "",
      classificationId: product.classificationId ?? "",
      productType: product.productType,
      defaultSellingPrice:
        product.defaultSellingPrice === null
          ? ""
          : String(product.defaultSellingPrice),
      reorderLevel: String(product.reorderLevel ?? 0),
      requiresPrescription: product.requiresPrescription,
      requiresExpiryTracking: product.requiresExpiryTracking,
      requiresLotTracking: product.requiresLotTracking,
      description: "",
      status: product.status,
    });
    setValidationError(null);
  }, [product]);

  const lookupOptions = useMemo(
    () => ({
      categories: activeOnly(lookups.categories),
      brands: activeOnly(lookups.brands),
      genericDrugs: activeOnly(lookups.genericDrugs),
      dosageForms: activeOnly(lookups.dosageForms),
      productClassifications: activeOnly(lookups.productClassifications),
    }),
    [lookups],
  );

  const selectedCategory = lookupOptions.categories.find(
    (category) => category.id === values.categoryId,
  );
  const showMedicineFields = isPharmaceuticalCategory(selectedCategory);

  const title = product ? "Edit Product" : "New Product";

  const updateValue = (name: keyof ProductFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateBoolean = (name: keyof ProductFormValues, value: boolean) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!values.name.trim() || !values.categoryId) {
      return "Product name and category are required.";
    }

    if (Number(values.defaultSellingPrice || 0) < 0) {
      return "Default selling price must be zero or greater.";
    }

    if (Number(values.reorderLevel || 0) < 0) {
      return "Reorder level must be zero or greater.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validate();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    setValidationError(null);
    await onSubmit(toPayload(values, selectedCategory ?? null));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="product-form-title"
        aria-modal="true"
        className="modal product-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Products</p>
            <h2 id="product-form-title">{title}</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="product-form-grid">
            <Input
              label="SKU"
              onChange={(event) => updateValue("sku", event.target.value)}
              placeholder="BIOG-500-TAB"
              value={values.sku}
            />
            <Input
              label="Product Name"
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Biogesic 500mg Tablet"
              required
              value={values.name}
            />
            <Select
              label="Category"
              onChange={(event) => updateValue("categoryId", event.target.value)}
              required
              value={values.categoryId}
            >
              <option value="">Select category</option>
              {lookupOptions.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select
              label="Brand"
              onChange={(event) => updateValue("brandId", event.target.value)}
              value={values.brandId}
            >
              <option value="">Select brand</option>
              {lookupOptions.brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
            {showMedicineFields ? (
              <>
                <Select
                  label="Generic Drug"
                  onChange={(event) =>
                    updateValue("genericDrugId", event.target.value)
                  }
                  value={values.genericDrugId}
                >
                  <option value="">Select generic drug</option>
                  {lookupOptions.genericDrugs.map((genericDrug) => (
                    <option key={genericDrug.id} value={genericDrug.id}>
                      {genericDrug.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Dosage Form"
                  onChange={(event) =>
                    updateValue("dosageFormId", event.target.value)
                  }
                  value={values.dosageFormId}
                >
                  <option value="">Select dosage form</option>
                  {lookupOptions.dosageForms.map((dosageForm) => (
                    <option key={dosageForm.id} value={dosageForm.id}>
                      {dosageForm.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Product Classification"
                  onChange={(event) =>
                    updateValue("classificationId", event.target.value)
                  }
                  value={values.classificationId}
                >
                  <option value="">Select classification</option>
                  {lookupOptions.productClassifications.map((classification) => (
                    <option key={classification.id} value={classification.id}>
                      {classification.name}
                    </option>
                  ))}
                </Select>
                <label className="checkbox-field">
                  <input
                    checked={values.requiresPrescription}
                    onChange={(event) =>
                      updateBoolean("requiresPrescription", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Requires Prescription</span>
                </label>
                <label className="checkbox-field">
                  <input
                    checked={values.requiresExpiryTracking}
                    onChange={(event) =>
                      updateBoolean("requiresExpiryTracking", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Requires Expiry Tracking</span>
                </label>
                <label className="checkbox-field">
                  <input
                    checked={values.requiresLotTracking}
                    onChange={(event) =>
                      updateBoolean("requiresLotTracking", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Requires Lot Tracking</span>
                </label>
              </>
            ) : null}
            <Select
              label="Status"
              onChange={(event) =>
                updateValue(
                  "status",
                  event.target.value as ProductFormValues["status"],
                )
              }
              value={values.status}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISCONTINUED">Discontinued</option>
            </Select>
            <Input
              label="Default Selling Price"
              min="0"
              onChange={(event) =>
                updateValue("defaultSellingPrice", event.target.value)
              }
              placeholder="5.00"
              step="0.01"
              type="number"
              value={values.defaultSellingPrice}
            />
            <Input
              label="Reorder Level"
              min="0"
              onChange={(event) =>
                updateValue("reorderLevel", event.target.value)
              }
              step="0.001"
              type="number"
              value={values.reorderLevel}
            />
          </div>

          <Textarea
            label="Description"
            onChange={(event) => updateValue("description", event.target.value)}
            placeholder="Internal product description"
            value={values.description}
          />

          {validationError ? <p className="form-error">{validationError}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
