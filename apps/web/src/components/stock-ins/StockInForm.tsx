import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { StockInItemsTable } from "./StockInItemsTable";
import type { Product } from "../../types/product";
import type {
  CreateStockInPayload,
  StockInFormValues,
  StockInItemFormValues,
  StockInSourceType,
  StockReferenceType,
} from "../../types/stock-in";

type StockInFormProps = {
  products: Product[];
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateStockInPayload) => Promise<void>;
};

const receivedByUserId = import.meta.env.VITE_STOCK_IN_RECEIVED_BY_USER_ID ?? "";

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

const optionalText = (value: string) => value.trim() || null;

const toPayload = (values: StockInFormValues): CreateStockInPayload => ({
  supplierId: null,
  receivedByUserId,
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
  onClose,
  onSubmit,
  products,
}: StockInFormProps) {
  const [values, setValues] = useState<StockInFormValues>(initialValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateValue = <TField extends keyof StockInFormValues>(
    field: TField,
    value: StockInFormValues[TField],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
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

  const validate = () => {
    if (!receivedByUserId) {
      return "Missing VITE_STOCK_IN_RECEIVED_BY_USER_ID configuration.";
    }

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
            <h2 id="stock-in-form-title">New Stock In</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
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
              label="Source Type"
              onChange={(event) =>
                updateValue("sourceType", event.target.value as StockInSourceType)
              }
              value={values.sourceType}
            >
              <option value="MANUAL">Manual</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
              <option value="OCR">OCR</option>
              <option value="WO_POS_MIGRATION">WO POS Migration</option>
            </Select>
          </div>

          <Textarea
            label="Notes"
            onChange={(event) => updateValue("notes", event.target.value)}
            value={values.notes}
          />

          <StockInItemsTable
            items={values.items}
            onAdd={addItem}
            onChange={updateItem}
            onRemove={removeItem}
            products={products}
          />

          {validationError ? <p className="form-error">{validationError}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
