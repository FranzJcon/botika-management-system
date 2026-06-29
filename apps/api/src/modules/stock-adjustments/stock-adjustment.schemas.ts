import { z } from "zod";

const optionalUuid = z.string().uuid().nullable().optional();
const optionalText = z.string().trim().min(1).nullable().optional();

export const createStockAdjustmentSchema = z.object({
  adjustedByUserId: z.string().uuid(),
  reason: z.string().trim().min(1),
  notes: optionalText,
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        inventoryBatchId: optionalUuid,
        quantityChange: z.number().refine((value) => value !== 0),
        notes: optionalText,
      }),
    )
    .min(1),
});

export type CreateStockAdjustmentInput = z.infer<
  typeof createStockAdjustmentSchema
>;
