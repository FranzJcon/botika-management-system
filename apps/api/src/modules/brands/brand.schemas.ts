import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
