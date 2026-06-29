import { z } from "zod";

export const createGenericDrugSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
});

export const updateGenericDrugSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateGenericDrugInput = z.infer<typeof createGenericDrugSchema>;
export type UpdateGenericDrugInput = z.infer<typeof updateGenericDrugSchema>;
