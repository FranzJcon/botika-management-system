import type { Product } from "./product";

export type StockInStatus = "DRAFT" | "POSTED" | "CANCELLED";

export type StockInSourceType = "MANUAL" | "EXCEL" | "CSV" | "OCR" | "WO_POS_MIGRATION";

export type StockReferenceType =
  | "INVOICE"
  | "DELIVERY_RECEIPT"
  | "OFFICIAL_RECEIPT"
  | "PURCHASE_ORDER"
  | "MANUAL"
  | "OPENING_INVENTORY"
  | "DONATION"
  | "OTHER";

export type StockInItem = {
  id: string;
  productId: string;
  quantity: string | number;
  buyingPrice: string | number;
  sellingPrice: string | number | null;
  expirationDate: string | null;
  lotNumber: string | null;
  notes: string | null;
  product?: Product;
};

export type StockIn = {
  id: string;
  supplierId: string | null;
  receivedByUserId: string;
  sourceType: StockInSourceType;
  referenceType: StockReferenceType | null;
  referenceNumber: string | null;
  receivedDate: string;
  notes: string | null;
  status: StockInStatus;
  createdAt: string;
  updatedAt: string;
  items: StockInItem[];
};

export type StockInItemFormValues = {
  id: string;
  productId: string;
  quantity: string;
  buyingPrice: string;
  sellingPrice: string;
  expirationDate: string;
  lotNumber: string;
  notes: string;
};

export type StockInFormValues = {
  receivedDate: string;
  referenceType: "" | StockReferenceType;
  referenceNumber: string;
  sourceType: StockInSourceType;
  notes: string;
  items: StockInItemFormValues[];
};

export type CreateStockInPayload = {
  supplierId: null;
  receivedByUserId: string;
  sourceType: StockInSourceType;
  referenceType?: StockReferenceType | null;
  referenceNumber?: string | null;
  receivedDate: string;
  notes?: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    buyingPrice: number;
    sellingPrice?: number | null;
    expirationDate?: string | null;
    lotNumber?: string | null;
    notes?: string | null;
  }>;
};
