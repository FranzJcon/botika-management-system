import { prisma } from "../../lib/prisma";

import type { CreateSaleInput } from "./sale.schemas";

export type SaleServiceError = "SALE_NOT_FOUND" | "INSUFFICIENT_STOCK";

type SaleServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: SaleServiceError;
    };

const saleInclude = {
  items: {
    include: {
      product: true,
      batchConsumptions: {
        include: {
          inventoryBatch: true,
        },
      },
    },
  },
  batchConsumptions: {
    include: {
      inventoryBatch: true,
    },
  },
};

const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

const lineTotal = (quantity: number, sellingPrice: number) =>
  Number((quantity * sellingPrice).toFixed(2));

const insufficientStock = () => new Error("INSUFFICIENT_STOCK");

const getRemainingQuantity = (value: unknown) => Number(value);

export const getSales = async () =>
  prisma.sale.findMany({
    orderBy: {
      saleDate: "desc",
    },
    include: saleInclude,
  });

export const getSaleById = async (id: string) =>
  prisma.sale.findUnique({
    where: {
      id,
    },
    include: saleInclude,
  });

export const createSale = async (
  input: CreateSaleInput,
): Promise<SaleServiceResult<Awaited<ReturnType<typeof getSaleById>>>> => {
  try {
    const sale = await prisma.$transaction(async (tx) => {
      const productIds = [...new Set(input.items.map((item) => item.productId))];
      const products = await tx.product.findMany({
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
        throw insufficientStock();
      }

      const totalAmount = input.items.reduce(
        (total, item) => total + lineTotal(item.quantity, item.sellingPrice),
        0,
      );

      const createdSale = await tx.sale.create({
        data: {
          saleDate: input.saleDate ? toDate(input.saleDate) : undefined,
          totalAmount,
          status: "COMPLETED",
          notes: input.notes ?? null,
        },
      });

      for (const item of input.items) {
        const saleItem = await tx.saleItem.create({
          data: {
            saleId: createdSale.id,
            productId: item.productId,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice,
            lineTotal: lineTotal(item.quantity, item.sellingPrice),
          },
        });

        let quantityToDeduct = item.quantity;
        const batches = await tx.inventoryBatch.findMany({
          where: {
            productId: item.productId,
            status: "AVAILABLE",
            remainingQuantity: {
              gt: 0,
            },
          },
          orderBy: [
            {
              expirationDate: {
                sort: "asc",
                nulls: "last",
              },
            },
            {
              receivedDate: "asc",
            },
          ],
          select: {
            id: true,
            remainingQuantity: true,
            buyingPrice: true,
          },
        });

        for (const batch of batches) {
          if (quantityToDeduct <= 0) {
            break;
          }

          const availableQuantity = getRemainingQuantity(batch.remainingQuantity);
          const consumedQuantity = Math.min(availableQuantity, quantityToDeduct);

          if (consumedQuantity <= 0) {
            continue;
          }

          const updatedBatch = await tx.inventoryBatch.updateMany({
            where: {
              id: batch.id,
              status: "AVAILABLE",
              remainingQuantity: {
                gte: consumedQuantity,
              },
            },
            data: {
              remainingQuantity: {
                decrement: consumedQuantity,
              },
            },
          });

          if (updatedBatch.count === 0) {
            throw insufficientStock();
          }

          const batchAfterUpdate = await tx.inventoryBatch.findUnique({
            where: {
              id: batch.id,
            },
            select: {
              remainingQuantity: true,
            },
          });

          if (getRemainingQuantity(batchAfterUpdate?.remainingQuantity ?? 0) === 0) {
            await tx.inventoryBatch.update({
              where: {
                id: batch.id,
              },
              data: {
                status: "DEPLETED",
              },
            });
          }

          await tx.saleBatchConsumption.create({
            data: {
              saleId: createdSale.id,
              saleItemId: saleItem.id,
              productId: item.productId,
              inventoryBatchId: batch.id,
              quantity: consumedQuantity,
              buyingPrice: batch.buyingPrice,
              sellingPrice: item.sellingPrice,
            },
          });

          await tx.stockLedgerEntry.create({
            data: {
              productId: item.productId,
              inventoryBatchId: batch.id,
              movementType: "SALE",
              quantityChange: -consumedQuantity,
              buyingPrice: batch.buyingPrice,
              referenceType: "Sale",
              referenceId: createdSale.id,
              occurredAt: new Date(),
              notes: "Sale completed",
            },
          });

          quantityToDeduct -= consumedQuantity;
        }

        if (quantityToDeduct > 0) {
          throw insufficientStock();
        }
      }

      const completedSale = await tx.sale.findUnique({
        where: {
          id: createdSale.id,
        },
        include: saleInclude,
      });

      if (!completedSale) {
        throw new Error("SALE_NOT_FOUND");
      }

      return completedSale;
    });

    return {
      data: sale,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_STOCK") {
        return {
          error: "INSUFFICIENT_STOCK",
        };
      }

      if (error.message === "SALE_NOT_FOUND") {
        return {
          error: "SALE_NOT_FOUND",
        };
      }
    }

    throw error;
  }
};
