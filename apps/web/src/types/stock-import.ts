import type { Product } from "./product";

export type StockImportRowStatus = "MATCHED" | "UNMATCHED";
export type StockImportSuggestionConfidence =
  | "HIGH_CONFIDENCE"
  | "SUGGESTED"
  | "NEEDS_REVIEW";

export type StockImportRow = {
  id: string;
  sourceProductName: string;
  sourceSku: string;
  productId: string;
  status: StockImportRowStatus;
  newProductCategoryId: string;
  newProductGenericDrugId: string;
  newProductDosageFormId: string;
  newProductClassificationId: string;
  suggestionConfidence: StockImportSuggestionConfidence;
  isSelectedForBulk: boolean;
  quantity: string;
  buyingPrice: string;
  sellingPrice: string;
  lotNumber: string;
  expirationDate: string;
};

export type StockImportLookupData = {
  products: Product[];
};
