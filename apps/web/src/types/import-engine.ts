export type ImportedRow = {
  productName: string;
  sku?: string;
  quantity: string;
  buyingPrice: string;
  sellingPrice?: string;
  lotNumber?: string;
  expirationDate?: string;
};

export type ImportSource = "EXCEL" | "CSV" | "PDF" | "OCR";

export type ImportParser = {
  parse: (file: File) => Promise<ImportedRow[]>;
};
