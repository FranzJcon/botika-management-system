import type { Brand } from "./brand";
import type { Category } from "./category";
import type { DosageForm } from "./dosage-form";
import type { GenericDrug } from "./generic-drug";
import type { ProductClassification } from "./product-classification";
import type { ProductStatus } from "./product";

export type InventoryBatchStatus =
  | "AVAILABLE"
  | "DEPLETED"
  | "EXPIRED"
  | "DAMAGED"
  | "CANCELLED";

export type InventoryLevel = {
  id: string;
  name: string;
  sku: string | null;
  category: Category | null;
  brand: Brand | null;
  genericDrug?: GenericDrug | null;
  defaultSellingPrice?: string | number | null;
  sellingPrice: string | number;
  totalQuantityOnHand: string | number;
  reorderLevel: string | number;
  status: ProductStatus;
};

export type InventoryBatch = {
  id: string;
  remainingQuantity: string | number;
  initialQuantity: string | number;
  buyingPrice: string | number;
  sellingPrice: string | number | null;
  receivedDate: string;
  expirationDate: string | null;
  lotNumber: string | null;
  status: InventoryBatchStatus;
};

export type ProductInventoryDetails = {
  product: {
    id: string;
    name: string;
    sku: string | null;
    category: Category | null;
    classification: ProductClassification | null;
    genericDrug: GenericDrug | null;
    dosageFormRef: DosageForm | null;
    brand: Brand | null;
    reorderLevel: string | number;
    status: ProductStatus;
  };
  totalQuantityOnHand: string | number;
  batches: InventoryBatch[];
};

export type ExpiringSoonBatch = {
  id: string;
  remainingQuantity: string | number;
  expirationDate: string;
  lotNumber: string | null;
  product: {
    id: string;
    name: string;
    sku: string | null;
  };
};
