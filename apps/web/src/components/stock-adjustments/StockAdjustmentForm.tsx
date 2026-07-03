import { useState } from "react";
import type { FormEvent } from "react";

import { ProductBatchSelector } from "./ProductBatchSelector";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import type {
  InventoryBatch,
  InventoryLevel,
  ProductInventoryDetails,
} from "../../types/inventory-level";
import type {
  CreateStockAdjustmentPayload,
  StockAdjustmentFormValues,
  StockAdjustmentItemFormValues,
} from "../../types/stock-adjustment";

type StockAdjustmentFormProps = {
  inventoryLevels: InventoryLevel[];
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateStockAdjustmentPayload) => Promise<void>;
  getProductInventoryDetails: (
    productId: string,
  ) => Promise<ProductInventoryDetails>;
};

const optionalText = (value: string) => value.trim() || null;

const createItem = (): StockAdjustmentItemFormValues => ({
  id: crypto.randomUUID(),
  productId: "",
  inventoryBatchId: "",
  adjustmentType: "REMOVE",
  quantity: "",
  notes: "",
});

const initialValues = (): StockAdjustmentFormValues => ({
  reason: "Damaged",
  notes: "",
  items: [createItem()],
});

const reasonOptions = [
  "Damaged",
  "Expired",
  "Physical Count",
  "Lost",
  "Found",
  "Opening Inventory",
  "Other",
];

const toPayload = (
  values: StockAdjustmentFormValues,
): CreateStockAdjustmentPayload => ({
  reason: values.reason.trim(),
  notes: values.reason === "Other" ? optionalText(values.notes) : null,
  items: values.items.map((item) => ({
    productId: item.productId,
    inventoryBatchId:
      item.adjustmentType === "REMOVE" ? item.inventoryBatchId || null : null,
    quantityChange:
      item.adjustmentType === "REMOVE"
        ? -Number(item.quantity)
        : Number(item.quantity),
    notes: optionalText(item.notes),
  })),
});

export function StockAdjustmentForm({
  error,
  getProductInventoryDetails,
  inventoryLevels,
  isSubmitting,
  onClose,
  onSubmit,
}: StockAdjustmentFormProps) {
  const [values, setValues] = useState<StockAdjustmentFormValues>(() =>
    initialValues(),
  );
  const [initialSnapshot] = useState(() => JSON.stringify(values));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [batchLookup, setBatchLookup] = useState<Record<string, InventoryBatch>>(
    {},
  );
  const [itemBatches, setItemBatches] = useState<Record<string, InventoryBatch[]>>(
    {},
  );

  const updateValue = <TField extends keyof StockAdjustmentFormValues>(
    field: TField,
    value: StockAdjustmentFormValues[TField],
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
      !window.confirm("Discard unsaved stock adjustment?")
    ) {
      return;
    }

    onClose();
  };

  const updateItem = (
    id: string,
    field: keyof StockAdjustmentItemFormValues,
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
    setItemBatches((current) => {
      const next = { ...current };
      delete next[id];

      return next;
    });
  };

  const validate = () => {
    if (!values.reason.trim()) {
      return "Reason is required.";
    }

    if (values.items.length === 0) {
      return "At least one item is required.";
    }

    for (const item of values.items) {
      const quantity = Number(item.quantity);

      if (!item.productId) {
        return "Each item must have a product.";
      }

      if (!item.quantity.trim() || quantity <= 0) {
        return "Quantity must be greater than zero.";
      }

      if (item.adjustmentType === "REMOVE" && !item.inventoryBatchId) {
        return "Removing stock requires selecting a batch.";
      }

      const selectedBatch = item.inventoryBatchId
        ? batchLookup[item.inventoryBatchId]
        : null;

      if (
        item.adjustmentType === "REMOVE" &&
        selectedBatch &&
        quantity > Number(selectedBatch.remainingQuantity)
      ) {
        return "Quantity removed cannot exceed selected batch remaining quantity.";
      }
    }

    return null;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validate();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    setValidationError(null);
    setIsConfirming(true);
  };

  const handleConfirm = async () => {
    await onSubmit(toPayload(values));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="stock-adjustment-form-title"
        aria-modal="true"
        className="modal stock-in-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Stock Adjustments</p>
            <h2 id="stock-adjustment-form-title">New Adjustment</h2>
          </div>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="stock-adjustment-header-grid">
            <Select
              label="Reason"
              onChange={(event) => updateValue("reason", event.target.value)}
              required
              value={values.reason}
            >
              {reasonOptions.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </Select>
            {values.reason === "Other" ? (
              <Textarea
                label="Notes"
                onChange={(event) => updateValue("notes", event.target.value)}
                value={values.notes}
              />
            ) : null}
          </div>

          <div className="stock-items">
            <div className="stock-items-header">
              <h3>Items</h3>
              <Button variant="secondary" onClick={addItem}>
                Add Row
              </Button>
            </div>

            <div className="stock-items-list">
              {values.items.map((item, index) => {
                const batches = itemBatches[item.id] ?? [];
                const selectedBatch = item.inventoryBatchId
                  ? batchLookup[item.inventoryBatchId]
                  : null;

                return (
                <div className="stock-item-card" key={item.id}>
                  <div className="stock-item-title">
                    <strong>Item {index + 1}</strong>
                    {values.items.length > 1 ? (
                      <Button
                        variant="secondary"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>

                  <div className="stock-adjustment-item-grid">
                    <ProductBatchSelector
                      getProductInventoryDetails={getProductInventoryDetails}
                      inventoryLevels={inventoryLevels}
                      onBatchesLoaded={(loadedBatches) => {
                        setItemBatches((current) => ({
                          ...current,
                          [item.id]: loadedBatches,
                        }));
                        setBatchLookup((current) => ({
                          ...current,
                          ...Object.fromEntries(
                            loadedBatches.map((batch) => [batch.id, batch]),
                          ),
                        }));
                      }}
                      onProductChange={(productId) => {
                        updateItem(item.id, "productId", productId);
                        updateItem(item.id, "inventoryBatchId", "");
                      }}
                      productId={item.productId}
                    />
                    <Select
                      label="Adjustment Type"
                      onChange={(event) => {
                        const adjustmentType = event.target
                          .value as StockAdjustmentItemFormValues["adjustmentType"];
                        updateItem(item.id, "adjustmentType", adjustmentType);

                        if (adjustmentType === "ADD") {
                          updateItem(item.id, "inventoryBatchId", "");
                        }
                      }}
                      value={item.adjustmentType}
                    >
                      <option value="ADD">Add Stock</option>
                      <option value="REMOVE">Remove Stock</option>
                    </Select>
                    <Input
                      label="Quantity"
                      min="0.001"
                      onChange={(event) =>
                        updateItem(item.id, "quantity", event.target.value)
                      }
                      required
                      step="0.001"
                      type="number"
                      value={item.quantity}
                      max={
                        item.adjustmentType === "REMOVE" && selectedBatch
                          ? String(selectedBatch.remainingQuantity)
                          : undefined
                      }
                    />
                    {item.adjustmentType === "REMOVE" ? (
                      <Select
                        label="Batch"
                        onChange={(event) =>
                          updateItem(item.id, "inventoryBatchId", event.target.value)
                        }
                        required
                        value={item.inventoryBatchId}
                      >
                        <option value="">Select batch</option>
                        {batches.map((batch) => (
                          <option key={batch.id} value={batch.id}>
                            Lot {batch.lotNumber || "None"} | Expires:{" "}
                            {batch.expirationDate
                              ? new Date(batch.expirationDate)
                                  .toISOString()
                                  .slice(0, 10)
                              : "No expiry"}{" "}
                            | Remaining:{" "}
                            {Number(batch.remainingQuantity).toLocaleString()}
                          </option>
                        ))}
                      </Select>
                    ) : null}
                  </div>

                  <Textarea
                    label="Notes"
                    onChange={(event) =>
                      updateItem(item.id, "notes", event.target.value)
                    }
                    value={item.notes}
                  />
                </div>
              );
              })}
            </div>
          </div>

          {validationError ? <p className="form-error">{validationError}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              Review Adjustment
            </Button>
          </div>
        </form>
      </section>

      {isConfirming ? (
        <section
          aria-labelledby="confirm-adjustment-title"
          aria-modal="true"
          className="modal confirm-modal"
          role="dialog"
        >
          <div>
            <p className="eyebrow">Confirm</p>
            <h2 id="confirm-adjustment-title">Apply this stock adjustment?</h2>
          </div>
          <p className="confirm-message">
            Inventory quantities will change immediately.
            <br />
            This action cannot be undone.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="modal-actions">
            <Button
              disabled={isSubmitting}
              variant="secondary"
              onClick={() => setIsConfirming(false)}
            >
              Back
            </Button>
            <Button disabled={isSubmitting} onClick={() => void handleConfirm()}>
              {isSubmitting ? "Applying..." : "Apply Adjustment"}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
