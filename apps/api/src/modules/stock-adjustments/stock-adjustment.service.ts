import { prisma } from "../../lib/prisma";

import type { CreateStockAdjustmentInput } from "./stock-adjustment.schemas";

export type StockAdjustmentServiceError =
  | "STOCK_ADJUSTMENT_NOT_FOUND"
  | "STOCK_ADJUSTMENT_CANNOT_BE_APPLIED";

type StockAdjustmentServiceResult<T> =
  | {
      data: T;
      error?: never;
      message?: never;
    }
  | {
      data?: never;
      error: StockAdjustmentServiceError;
      message?: string;
    };

const stockAdjustmentInclude = {
  adjustedByUser: true,
  items: {
    include: {
      product: true,
      inventoryBatch: true,
    },
  },
};

const cannotApply = (message: string) => ({
  error: "STOCK_ADJUSTMENT_CANNOT_BE_APPLIED" as const,
  message,
});

const validateInitialRelations = async (input: CreateStockAdjustmentInput) => {
  const user = await prisma.user.findUnique({
    where: {
      id: input.adjustedByUserId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return cannotApply("Adjusted by user does not exist");
  }

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (products.length !== productIds.length) {
    return cannotApply("Product does not exist");
  }

  return null;
};

export const getStockAdjustments = async () =>
  prisma.stockAdjustment.findMany({
    orderBy: {
      adjustedAt: "desc",
    },
    include: stockAdjustmentInclude,
  });

export const getStockAdjustmentById = async (id: string) =>
  prisma.stockAdjustment.findUnique({
    where: {
      id,
    },
    include: stockAdjustmentInclude,
  });

export const createStockAdjustment = async (
  input: CreateStockAdjustmentInput,
): Promise<
  StockAdjustmentServiceResult<
    Awaited<ReturnType<typeof getStockAdjustmentById>>
  >
> => {
  const relationError = await validateInitialRelations(input);

  if (relationError) {
    return relationError;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const stockAdjustment = await tx.stockAdjustment.create({
        data: {
          adjustedByUserId: input.adjustedByUserId,
          reason: input.reason,
          notes: input.notes ?? null,
        },
      });

      for (const item of input.items) {
        const stockAdjustmentItem = await tx.stockAdjustmentItem.create({
          data: {
            stockAdjustmentId: stockAdjustment.id,
            productId: item.productId,
            inventoryBatchId: item.inventoryBatchId ?? null,
            quantityChange: item.quantityChange,
            notes: item.notes ?? null,
          },
        });

        let buyingPrice = null;

        if (item.inventoryBatchId) {
          const batch = await tx.inventoryBatch.findUnique({
            where: {
              id: item.inventoryBatchId,
            },
            select: {
              id: true,
              productId: true,
              remainingQuantity: true,
              buyingPrice: true,
            },
          });

          if (!batch) {
            throw new Error("Inventory batch does not exist");
          }

          if (batch.productId !== item.productId) {
            throw new Error("Inventory batch does not belong to product");
          }

          buyingPrice = batch.buyingPrice;

          if (item.quantityChange > 0) {
            await tx.inventoryBatch.update({
              where: {
                id: batch.id,
              },
              data: {
                remainingQuantity: {
                  increment: item.quantityChange,
                },
                status: "AVAILABLE",
              },
            });
          } else {
            const quantityToRemove = Math.abs(item.quantityChange);
            const updatedBatch = await tx.inventoryBatch.updateMany({
              where: {
                id: batch.id,
                remainingQuantity: {
                  gte: quantityToRemove,
                },
              },
              data: {
                remainingQuantity: {
                  decrement: quantityToRemove,
                },
              },
            });

            if (updatedBatch.count === 0) {
              throw new Error("Adjustment would make remaining quantity negative");
            }

            const batchAfterUpdate = await tx.inventoryBatch.findUnique({
              where: {
                id: batch.id,
              },
              select: {
                remainingQuantity: true,
              },
            });

            if (Number(batchAfterUpdate?.remainingQuantity ?? 0) === 0) {
              await tx.inventoryBatch.update({
                where: {
                  id: batch.id,
                },
                data: {
                  status: "DEPLETED",
                },
              });
            }
          }
        } else if (item.quantityChange < 0) {
          throw new Error("Inventory batch is required when removing stock");
        }

        await tx.stockLedgerEntry.create({
          data: {
            productId: item.productId,
            inventoryBatchId: item.inventoryBatchId ?? null,
            movementType:
              item.quantityChange > 0 ? "ADJUSTMENT_ADD" : "ADJUSTMENT_REMOVE",
            quantityChange: item.quantityChange,
            buyingPrice,
            referenceType: "StockAdjustment",
            referenceId: stockAdjustment.id,
            occurredAt: new Date(),
            notes: stockAdjustmentItem.notes,
          },
        });
      }

      const createdStockAdjustment = await tx.stockAdjustment.findUnique({
        where: {
          id: stockAdjustment.id,
        },
        include: stockAdjustmentInclude,
      });

      return {
        data: createdStockAdjustment,
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      return cannotApply(error.message);
    }

    throw error;
  }
};
