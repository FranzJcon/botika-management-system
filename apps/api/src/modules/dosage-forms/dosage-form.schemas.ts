import { z } from "zod";

export const createDosageFormSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
});

export const updateDosageFormSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateDosageFormInput = z.infer<typeof createDosageFormSchema>;
export type UpdateDosageFormInput = z.infer<typeof updateDosageFormSchema>;
