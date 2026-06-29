import { z } from "zod";

export const createProductClassificationSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
});

export const updateProductClassificationSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductClassificationInput = z.infer<
  typeof createProductClassificationSchema
>;
export type UpdateProductClassificationInput = z.infer<
  typeof updateProductClassificationSchema
>;
