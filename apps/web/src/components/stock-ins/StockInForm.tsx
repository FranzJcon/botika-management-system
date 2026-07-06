import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { QuickAddProductModal } from "../products/QuickAddProductModal";
import { StockImportPage } from "../../pages/StockImportPage";
import type { Category } from "../../types/category";
import { StockInItemsTable } from "./StockInItemsTable";
import type { Product } from "../../types/product";
import type { ProductPayload } from "../../types/product";
import type {
  CreateStockInPayload,
  StockIn,
  StockInFormValues,
  StockInItemFormValues,
  StockReferenceType,
} from "../../types/stock-in";

type StockInFormProps = {
  products: Product[];
  categories: Category[];
  stockIn?: StockIn | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateStockInPayload) => Promise<void>;
  onCreateProduct: (payload: ProductPayload) => Promise<Product>;
};

const today = () => new Date().toISOString().slice(0, 10);

const createItem = (): StockInItemFormValues => ({
  id: crypto.randomUUID(),
  productId: "",
  quantity: "",
  buyingPrice: "",
  sellingPrice: "",
  expirationDate: "",
  lotNumber: "",
  notes: "",
});

const initialValues = (): StockInFormValues => ({
  receivedDate: today(),
  referenceType: "MANUAL",
  referenceNumber: "",
  sourceType: "MANUAL",
  notes: "",
  items: [createItem()],
});

const dateInputValue = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const valuesFromStockIn = (stockIn: StockIn): StockInFormValues => ({
  receivedDate: dateInputValue(stockIn.receivedDate),
  referenceType: stockIn.referenceType ?? "",
  referenceNumber: stockIn.referenceNumber ?? "",
  sourceType: stockIn.sourceType,
  notes: stockIn.notes ?? "",
  items:
    stockIn.items.length > 0
      ? stockIn.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: String(item.quantity),
          buyingPrice: String(item.buyingPrice),
          sellingPrice: item.sellingPrice === null ? "" : String(item.sellingPrice),
          expirationDate: dateInputValue(item.expirationDate),
          lotNumber: item.lotNumber ?? "",
          notes: item.notes ?? "",
        }))
      : [createItem()],
});

const optionalText = (value: string) => value.trim() || null;

const toPayload = (values: StockInFormValues): CreateStockInPayload => ({
  supplierId: null,
  sourceType: values.sourceType,
  referenceType: values.referenceType || null,
  referenceNumber: optionalText(values.referenceNumber),
  receivedDate: values.receivedDate,
  notes: optionalText(values.notes),
  items: values.items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
    buyingPrice: Number(item.buyingPrice),
    sellingPrice: item.sellingPrice.trim() ? Number(item.sellingPrice) : null,
    expirationDate: optionalText(item.expirationDate),
    lotNumber: optionalText(item.lotNumber),
    notes: optionalText(item.notes),
  })),
});

export function StockInForm({
  error,
  isSubmitting,
  categories,
  onCreateProduct,
  onClose,
  onSubmit,
  products,
  stockIn,
}: StockInFormProps) {
  const [values, setValues] = useState<StockInFormValues>(() =>
    stockIn ? valuesFromStockIn(stockIn) : initialValues(),
  );
  const [initialSnapshot] = useState(() => JSON.stringify(values));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [quickAddTarget, setQuickAddTarget] = useState<{
    itemId: string;
    initialName: string;
  } | null>(null);
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const isEditing = Boolean(stockIn);
  const isManualStockIn = values.sourceType === "MANUAL" || isEditing;
  const entryMethod = values.sourceType === "MANUAL" ? "MANUAL" : "IMPORT";
  const title = stockIn ? "Edit Stock In Draft" : "New Stock In";

  const updateValue = <TField extends keyof StockInFormValues>(
    field: TField,
    value: StockInFormValues[TField],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const hasUnsavedChanges = JSON.stringify(values) !== initialSnapshot;

  const handleClose = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Discard your changes?\n\nUnsaved changes will be lost.",
      )
    ) {
      return;
    }

    onClose();
  };

  const updateItem = (
    id: string,
    field: keyof StockInItemFormValues,
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = () => {
    setValues((current) => ({
      ...current,
      items: [...current.items, createItem()],
    }));
  };

  const removeItem = (id: string) => {
    setValues((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }));
  };

  const handleQuickAddProduct = async (payload: ProductPayload) => {
    if (!quickAddTarget) {
      return;
    }

    setIsQuickAdding(true);
    setQuickAddError(null);

    try {
      const product = await onCreateProduct(payload);
      updateItem(quickAddTarget.itemId, "productId", product.id);
      setQuickAddTarget(null);
    } catch {
      setQuickAddError("Unable to create product. Please try again.");
    } finally {
      setIsQuickAdding(false);
    }
  };

  const validate = () => {
    if (!values.receivedDate) {
      return "Received date is required.";
    }

    if (values.items.length === 0) {
      return "At least one item is required.";
    }

    for (const item of values.items) {
      if (!item.productId) {
        return "Each item must have a product.";
      }

      if (Number(item.quantity) <= 0) {
        return "Quantity must be greater than zero.";
      }

      if (Number(item.buyingPrice) < 0 || item.buyingPrice.trim() === "") {
        return "Buying price must be zero or greater.";
      }

      if (item.sellingPrice.trim() && Number(item.sellingPrice) < 0) {
        return "Selling price must be zero or greater.";
      }
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
    await onSubmit(toPayload(values));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="stock-in-form-title"
        aria-modal="true"
        className="modal stock-in-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Stock In</p>
            <h2 id="stock-in-form-title">{title}</h2>
          </div>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="stock-in-header-grid">
            <Input
              label="Received Date"
              onChange={(event) => updateValue("receivedDate", event.target.value)}
              required
              type="date"
              value={values.receivedDate}
            />
            <Select
              label="Reference Type"
              onChange={(event) =>
                updateValue(
                  "referenceType",
                  event.target.value as "" | StockReferenceType,
                )
              }
              value={values.referenceType}
            >
              <option value="">None</option>
              <option value="INVOICE">Invoice</option>
              <option value="DELIVERY_RECEIPT">Delivery Receipt</option>
              <option value="OFFICIAL_RECEIPT">Official Receipt</option>
              <option value="PURCHASE_ORDER">Purchase Order</option>
              <option value="MANUAL">Manual</option>
              <option value="OPENING_INVENTORY">Opening Inventory</option>
              <option value="DONATION">Donation</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input
              label="Reference Number"
              onChange={(event) =>
                updateValue("referenceNumber", event.target.value)
              }
              value={values.referenceNumber}
            />
            <Select
              label="Entry Method"
              onChange={(event) =>
                updateValue(
                  "sourceType",
                  event.target.value === "MANUAL" ? "MANUAL" : "EXCEL",
                )
              }
              value={entryMethod}
            >
              <option value="MANUAL">Manual Entry</option>
              <option value="IMPORT">Import File</option>
            </Select>
          </div>

          <Textarea
            label="Notes"
            onChange={(event) => updateValue("notes", event.target.value)}
            value={values.notes}
          />

          {isManualStockIn ? (
            <>
              <StockInItemsTable
                items={values.items}
                onAdd={addItem}
                onChange={updateItem}
                onQuickAddProduct={(itemId, initialName) =>
                  setQuickAddTarget({ itemId, initialName })
                }
                onRemove={removeItem}
                products={products}
              />

              {validationError ? (
                <p className="form-error">{validationError}</p>
              ) : null}
              {error ? <p className="form-error">{error}</p> : null}

              <div className="modal-actions">
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Save Draft"}
                </Button>
              </div>
            </>
          ) : (
            <div className="stock-in-import-workflow">
              <StockImportPage embedded />
            </div>
          )}
        </form>
      </section>
      {quickAddTarget ? (
        <QuickAddProductModal
          categories={categories}
          error={quickAddError}
          initialName={quickAddTarget.initialName}
          isSubmitting={isQuickAdding}
          onClose={() => {
            setQuickAddTarget(null);
            setQuickAddError(null);
          }}
          onSubmit={handleQuickAddProduct}
        />
      ) : null}
    </div>
  );
}
