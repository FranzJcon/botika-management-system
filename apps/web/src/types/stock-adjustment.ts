import type { InventoryBatch } from "./inventory-level";
import type { Product } from "./product";
import type { AuthUser } from "./auth";

export type StockAdjustmentItem = {
  id: string;
  productId: string;
  inventoryBatchId: string | null;
  quantityChange: string | number;
  notes: string | null;
  product: Product;
  inventoryBatch: InventoryBatch | null;
};

export type StockAdjustment = {
  id: string;
  adjustedByUserId: string;
  reason: string;
  notes: string | null;
  adjustedAt: string;
  createdAt: string;
  adjustedByUser: AuthUser;
  items: StockAdjustmentItem[];
};

export type StockAdjustmentItemFormValues = {
  id: string;
  productId: string;
  inventoryBatchId: string;
  adjustmentType: "ADD" | "REMOVE";
  quantity: string;
  notes: string;
};

export type StockAdjustmentFormValues = {
  reason: string;
  notes: string;
  items: StockAdjustmentItemFormValues[];
};

export type CreateStockAdjustmentPayload = {
  reason: string;
  notes?: string | null;
  items: Array<{
    productId: string;
    inventoryBatchId?: string | null;
    quantityChange: number;
    notes?: string | null;
  }>;
};
