import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
