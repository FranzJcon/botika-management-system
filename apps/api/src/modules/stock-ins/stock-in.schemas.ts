import { z } from "zod";

const optionalUuid = z.string().uuid().nullable().optional();
const optionalText = z.string().trim().min(1).nullable().optional();
const isValidDateString = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};
const dateString = z.string().refine(isValidDateString);

export const createStockInSchema = z.object({
  supplierId: optionalUuid,
  receivedByUserId: z.string().uuid(),
  sourceType: z.enum(["MANUAL", "EXCEL", "CSV", "OCR", "WO_POS_MIGRATION"]),
  referenceType: z
    .enum([
      "INVOICE",
      "DELIVERY_RECEIPT",
      "OFFICIAL_RECEIPT",
      "PURCHASE_ORDER",
      "MANUAL",
      "OPENING_INVENTORY",
      "DONATION",
      "OTHER",
    ])
    .nullable()
    .optional(),
  referenceNumber: optionalText,
  receivedDate: dateString,
  notes: optionalText,
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        buyingPrice: z.number().nonnegative(),
        sellingPrice: z.number().nonnegative().nullable().optional(),
        expirationDate: dateString.nullable().optional(),
        lotNumber: optionalText,
        notes: optionalText,
      }),
    )
    .min(1),
});

export const postStockInSchema = z.object({});

export type CreateStockInInput = z.infer<typeof createStockInSchema>;
