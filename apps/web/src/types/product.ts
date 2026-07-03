import type { Brand } from "./brand";
import type { Category } from "./category";
import type { DosageForm } from "./dosage-form";
import type { GenericDrug } from "./generic-drug";
import type { ProductClassification } from "./product-classification";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";
export type ProductType = "MEDICINE" | "NON_MEDICINE";

export type Product = {
  id: string;
  sku: string | null;
  name: string;
  categoryId: string | null;
  classificationId: string | null;
  genericDrugId: string | null;
  dosageFormId: string | null;
  brandId: string | null;
  defaultSellingPrice: string | number | null;
  reorderLevel: string | number;
  productType: ProductType;
  requiresPrescription: boolean;
  requiresExpiryTracking: boolean;
  requiresLotTracking: boolean;
  status: ProductStatus;
  category: Category | null;
  classification: ProductClassification | null;
  genericDrug: GenericDrug | null;
  dosageFormRef: DosageForm | null;
  brand: Brand | null;
};

export type ProductLookupData = {
  categories: Category[];
  brands: Brand[];
  genericDrugs: GenericDrug[];
  dosageForms: DosageForm[];
  productClassifications: ProductClassification[];
};

export type ProductFormValues = {
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  genericDrugId: string;
  dosageFormId: string;
  classificationId: string;
  productType: ProductType;
  defaultSellingPrice: string;
  reorderLevel: string;
  requiresPrescription: boolean;
  requiresExpiryTracking: boolean;
  requiresLotTracking: boolean;
  description: string;
  status: ProductStatus;
};

export type ProductPayload = {
  sku?: string | null;
  name: string;
  categoryId?: string | null;
  brandId?: string | null;
  genericDrugId?: string | null;
  dosageFormId?: string | null;
  classificationId?: string | null;
  defaultSellingPrice?: number | null;
  reorderLevel?: number;
  unit?: string;
  productType?: ProductType;
  requiresPrescription?: boolean;
  requiresExpiryTracking?: boolean;
  requiresLotTracking?: boolean;
  status?: ProductStatus;
};
