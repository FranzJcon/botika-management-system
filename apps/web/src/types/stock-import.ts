import type { Product } from "./product";

export type StockImportRowStatus = "MATCHED" | "UNKNOWN" | "NEW_PRODUCT";

export type StockImportRow = {
  id: string;
  sourceProductName: string;
  productId: string;
  status: StockImportRowStatus;
  quantity: string;
  buyingPrice: string;
  sellingPrice: string;
  lotNumber: string;
  expirationDate: string;
};

export type StockImportParsedRow = {
  productName: string;
  quantity: string;
  buyingPrice: string;
  sellingPrice: string;
  lotNumber: string;
  expirationDate: string;
};

export type StockImportLookupData = {
  products: Product[];
};
