import { z } from "zod";

const optionalText = z.string().trim().min(1).nullable().optional();

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  });

export const saleIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createSaleSchema = z.object({
  saleDate: dateString.optional(),
  notes: optionalText,
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        sellingPrice: z.number().nonnegative(),
      }),
    )
    .min(1),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
