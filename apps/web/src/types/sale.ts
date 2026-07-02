import type { InventoryLevel } from "./inventory-level";

export type SaleProduct = InventoryLevel;

export type CartItem = {
  product: SaleProduct;
  quantity: number;
  sellingPrice: number;
};

export type CreateSalePayload = {
  saleDate?: string;
  notes?: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    sellingPrice: number;
  }>;
};
