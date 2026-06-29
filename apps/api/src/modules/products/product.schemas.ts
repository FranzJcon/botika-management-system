import { z } from "zod";

const optionalUuid = z.string().uuid().nullable().optional();
const optionalText = z.string().trim().min(1).nullable().optional();
const optionalAmount = z.number().nonnegative().nullable().optional();

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().min(1).nullable().optional(),
  categoryId: optionalUuid,
  classificationId: optionalUuid,
  genericDrugId: optionalUuid,
  dosageFormId: optionalUuid,
  brandId: optionalUuid,
  genericName: optionalText,
  brandName: optionalText,
  dosageForm: optionalText,
  strength: optionalText,
  unit: z.string().trim().min(1).optional(),
  productType: z.enum(["MEDICINE", "NON_MEDICINE"]).optional(),
  defaultSellingPrice: optionalAmount,
  reorderLevel: z.number().nonnegative().optional(),
  requiresPrescription: z.boolean().optional(),
  requiresExpiryTracking: z.boolean().optional(),
  requiresLotTracking: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]).optional(),
});

export const createProductAliasSchema = z.object({
  alias: z.string().trim().min(1),
});

export const createProductBarcodeSchema = z.object({
  barcode: z.string().trim().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductAliasInput = z.infer<typeof createProductAliasSchema>;
export type CreateProductBarcodeInput = z.infer<
  typeof createProductBarcodeSchema
>;
