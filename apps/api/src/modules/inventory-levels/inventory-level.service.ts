import { prisma } from "../../lib/prisma";

export type InventoryLevelServiceError = "PRODUCT_NOT_FOUND";

type InventoryLevelServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: InventoryLevelServiceError;
    };

const availableBatchWhere = {
  status: "AVAILABLE" as const,
};

const sumQuantities = (
  batches: Array<{
    remainingQuantity: unknown;
  }>,
) =>
  batches.reduce(
    (total, batch) => total + Number(batch.remainingQuantity),
    0,
  );

export const getInventoryLevels = async () => {
  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      category: true,
      brand: true,
      inventoryBatches: {
        where: availableBatchWhere,
        select: {
          remainingQuantity: true,
        },
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    brand: product.brand,
    totalQuantityOnHand: sumQuantities(product.inventoryBatches),
    reorderLevel: product.reorderLevel,
    status: product.status,
  }));
};

export const getProductInventoryLevel = async (
  productId: string,
): Promise<InventoryLevelServiceResult<unknown>> => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      classification: true,
      genericDrug: true,
      dosageFormRef: true,
      brand: true,
      inventoryBatches: {
        where: availableBatchWhere,
        orderBy: [
          {
            expirationDate: "asc",
          },
          {
            receivedDate: "asc",
          },
        ],
        select: {
          id: true,
          remainingQuantity: true,
          initialQuantity: true,
          buyingPrice: true,
          sellingPrice: true,
          receivedDate: true,
          expirationDate: true,
          lotNumber: true,
          status: true,
        },
      },
    },
  });

  if (!product) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  return {
    data: {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        classification: product.classification,
        genericDrug: product.genericDrug,
        dosageFormRef: product.dosageFormRef,
        brand: product.brand,
        reorderLevel: product.reorderLevel,
        status: product.status,
      },
      totalQuantityOnHand: sumQuantities(product.inventoryBatches),
      batches: product.inventoryBatches,
    },
  };
};

export const getLowStockInventoryLevels = async () => {
  const inventoryLevels = await getInventoryLevels();

  return inventoryLevels.filter(
    (product) =>
      product.status === "ACTIVE" &&
      product.totalQuantityOnHand <= Number(product.reorderLevel),
  );
};

export const getExpiringSoonInventoryBatches = async () => {
  const today = new Date();
  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  return prisma.inventoryBatch.findMany({
    where: {
      status: "AVAILABLE",
      expirationDate: {
        not: null,
        gte: today,
        lte: ninetyDaysFromNow,
      },
    },
    orderBy: {
      expirationDate: "asc",
    },
    select: {
      id: true,
      remainingQuantity: true,
      expirationDate: true,
      lotNumber: true,
      product: true,
    },
  });
};
