import { prisma } from "../../lib/prisma";

import type { CreateStockInInput, UpdateStockInInput } from "./stock-in.schemas";

export type StockInServiceError =
  | "STOCK_IN_NOT_FOUND"
  | "STOCK_IN_CANNOT_BE_UPDATED"
  | "STOCK_IN_CANNOT_BE_DELETED"
  | "STOCK_IN_CANNOT_BE_POSTED"
  | "STOCK_IN_HAS_NO_ITEMS"
  | "STOCK_IN_RELATION_NOT_FOUND";

type StockInServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: StockInServiceError;
    };

const stockInListInclude = {
  supplier: true,
  receivedByUser: true,
  items: {
    include: {
      product: true,
    },
  },
};

const stockInDetailInclude = {
  supplier: true,
  receivedByUser: true,
  items: {
    include: {
      product: true,
      inventoryBatches: true,
    },
  },
};

const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

type PrismaLikeClient = Pick<
  typeof prisma,
  "supplier" | "user" | "product"
>;

const validateRelations = async (
  input: CreateStockInInput | UpdateStockInInput,
  client: PrismaLikeClient = prisma,
) => {
  if (
    input.supplierId &&
    !(await client.supplier.findUnique({
      where: { id: input.supplierId },
      select: { id: true },
    }))
  ) {
    return false;
  }

  if (
    "receivedByUserId" in input &&
    !(await client.user.findUnique({
      where: { id: input.receivedByUserId },
      select: { id: true },
    }))
  ) {
    return false;
  }

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await client.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
    },
  });

  return products.length === productIds.length;
};

export const getStockIns = async () =>
  prisma.stockIn.findMany({
    orderBy: {
      receivedDate: "desc",
    },
    include: stockInListInclude,
  });

export const getStockInById = async (id: string) =>
  prisma.stockIn.findUnique({
    where: { id },
    include: stockInDetailInclude,
  });

export const createStockIn = async (
  input: CreateStockInInput,
): Promise<StockInServiceResult<Awaited<ReturnType<typeof getStockInById>>>> => {
  if (!(await validateRelations(input))) {
    return { error: "STOCK_IN_RELATION_NOT_FOUND" };
  }

  const stockIn = await prisma.stockIn.create({
    data: {
      supplierId: input.supplierId ?? null,
      receivedByUserId: input.receivedByUserId,
      sourceType: input.sourceType,
      referenceType: input.referenceType ?? null,
      referenceNumber: input.referenceNumber ?? null,
      receivedDate: toDate(input.receivedDate),
      notes: input.notes ?? null,
      status: "DRAFT",
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          buyingPrice: item.buyingPrice,
          sellingPrice: item.sellingPrice ?? null,
          expirationDate: item.expirationDate ? toDate(item.expirationDate) : null,
          lotNumber: item.lotNumber ?? null,
          notes: item.notes ?? null,
        })),
      },
    },
    include: stockInDetailInclude,
  });

  return { data: stockIn };
};

export const updateDraftStockIn = async (
  id: string,
  input: UpdateStockInInput,
): Promise<StockInServiceResult<Awaited<ReturnType<typeof getStockInById>>>> => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingStockIn = await tx.stockIn.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
        },
      });

      if (!existingStockIn) {
        return { error: "STOCK_IN_NOT_FOUND" as const };
      }

      if (existingStockIn.status !== "DRAFT") {
        return { error: "STOCK_IN_CANNOT_BE_UPDATED" as const };
      }

      if (!(await validateRelations(input, tx))) {
        return { error: "STOCK_IN_RELATION_NOT_FOUND" as const };
      }

      const updatedStockIn = await tx.stockIn.updateMany({
        where: {
          id,
          status: "DRAFT",
        },
        data: {
          supplierId: input.supplierId ?? null,
          sourceType: input.sourceType,
          referenceType: input.referenceType ?? null,
          referenceNumber: input.referenceNumber ?? null,
          receivedDate: toDate(input.receivedDate),
          notes: input.notes ?? null,
        },
      });

      if (updatedStockIn.count === 0) {
        return { error: "STOCK_IN_CANNOT_BE_UPDATED" as const };
      }

      await tx.stockInItem.deleteMany({
        where: {
          stockInId: id,
        },
      });

      await tx.stockInItem.createMany({
        data: input.items.map((item) => ({
          stockInId: id,
          productId: item.productId,
          quantity: item.quantity,
          buyingPrice: item.buyingPrice,
          sellingPrice: item.sellingPrice ?? null,
          expirationDate: item.expirationDate ? toDate(item.expirationDate) : null,
          lotNumber: item.lotNumber ?? null,
          notes: item.notes ?? null,
        })),
      });

      const stockIn = await tx.stockIn.findUnique({
        where: { id },
        include: stockInDetailInclude,
      });

      if (!stockIn) {
        throw new Error("STOCK_IN_NOT_FOUND");
      }

      return { data: stockIn };
    });

    return result;
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_IN_NOT_FOUND") {
      return { error: "STOCK_IN_NOT_FOUND" };
    }

    throw error;
  }
};

export const deleteDraftStockIn = async (
  id: string,
): Promise<StockInServiceResult<{ message: string }>> => {
  const existingStockIn = await prisma.stockIn.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingStockIn) {
    return { error: "STOCK_IN_NOT_FOUND" };
  }

  if (existingStockIn.status !== "DRAFT") {
    return { error: "STOCK_IN_CANNOT_BE_DELETED" };
  }

  const deletedStockIn = await prisma.stockIn.deleteMany({
    where: {
      id,
      status: "DRAFT",
    },
  });

  if (deletedStockIn.count === 0) {
    return { error: "STOCK_IN_CANNOT_BE_DELETED" };
  }

  return {
    data: {
      message: "Stock in draft deleted successfully",
    },
  };
};

export const postStockIn = async (
  id: string,
): Promise<StockInServiceResult<Awaited<ReturnType<typeof getStockInById>>>> => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const postedStockIn = await tx.stockIn.updateMany({
        where: {
          id,
          status: "DRAFT",
        },
        data: {
          status: "POSTED",
        },
      });

      if (postedStockIn.count === 0) {
        return { error: "STOCK_IN_CANNOT_BE_POSTED" as const };
      }

      const stockIn = await tx.stockIn.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!stockIn) {
        throw new Error("STOCK_IN_NOT_FOUND");
      }

      if (stockIn.items.length === 0) {
        throw new Error("STOCK_IN_HAS_NO_ITEMS");
      }

      for (const item of stockIn.items) {
        const inventoryBatch = await tx.inventoryBatch.create({
          data: {
            productId: item.productId,
            stockInItemId: item.id,
            initialQuantity: item.quantity,
            remainingQuantity: item.quantity,
            buyingPrice: item.buyingPrice,
            sellingPrice: item.sellingPrice,
            receivedDate: stockIn.receivedDate,
            expirationDate: item.expirationDate,
            lotNumber: item.lotNumber,
            status: "AVAILABLE",
          },
        });

        await tx.stockLedgerEntry.create({
          data: {
            productId: item.productId,
            inventoryBatchId: inventoryBatch.id,
            movementType: "STOCK_IN",
            quantityChange: item.quantity,
            buyingPrice: item.buyingPrice,
            referenceType: "StockIn",
            referenceId: stockIn.id,
            occurredAt: new Date(),
            notes: "Stock In posted",
          },
        });
      }

      const updatedStockIn = await tx.stockIn.findUnique({
        where: { id },
        include: stockInDetailInclude,
      });

      if (!updatedStockIn) {
        throw new Error("STOCK_IN_NOT_FOUND");
      }

      return { data: updatedStockIn };
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "STOCK_IN_NOT_FOUND") {
        return { error: "STOCK_IN_NOT_FOUND" };
      }

      if (error.message === "STOCK_IN_HAS_NO_ITEMS") {
        return { error: "STOCK_IN_HAS_NO_ITEMS" };
      }
    }

    throw error;
  }
};
