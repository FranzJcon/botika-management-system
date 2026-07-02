import request from "supertest";

import { createApp } from "../src/app/app";
import { prisma } from "../src/lib/prisma";

export const app = createApp();
export { prisma };

export const testPrefix = "TEST-IT";

export const uniqueName = (name: string) =>
  `${testPrefix}-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const quantityOf = (value: unknown) => Number(value);

export const cleanupTestData = async () => {
  const products = await prisma.product.findMany({
    where: {
      sku: {
        startsWith: testPrefix,
      },
    },
    select: {
      id: true,
    },
  });
  const productIds = products.map((product) => product.id);

  if (productIds.length > 0) {
    await prisma.stockLedgerEntry.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.saleBatchConsumption.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.saleItem.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.stockAdjustmentItem.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.inventoryBatch.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.stockInItem.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.productAlias.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.productBarcode.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });
  }

  await prisma.sale.deleteMany({
    where: {
      notes: {
        startsWith: testPrefix,
      },
    },
  });
  await prisma.stockAdjustment.deleteMany({
    where: {
      notes: {
        startsWith: testPrefix,
      },
    },
  });
  await prisma.stockIn.deleteMany({
    where: {
      notes: {
        startsWith: testPrefix,
      },
    },
  });
  await prisma.supplier.deleteMany({
    where: {
      name: {
        startsWith: testPrefix,
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: testPrefix.toLowerCase(),
      },
    },
  });
};

export const createTestUser = async () =>
  prisma.user.create({
    data: {
      email: `${uniqueName("user").toLowerCase()}@example.com`,
      passwordHash: "test-password-hash",
      displayName: uniqueName("User"),
      role: "ADMIN",
    },
  });

export const createProduct = async (overrides: Record<string, unknown> = {}) => {
  const sku = uniqueName("SKU");
  const response = await request(app)
    .post("/products")
    .send({
      name: uniqueName("Product"),
      sku,
      productType: "MEDICINE",
      unit: "tablet",
      reorderLevel: 10,
      defaultSellingPrice: 5,
      requiresExpiryTracking: true,
      requiresLotTracking: true,
      ...overrides,
    })
    .expect(201);

  return response.body as { id: string; sku: string; name: string };
};

export const createStockInDraft = async (
  productId: string,
  receivedByUserId: string,
  quantity = 100,
) => {
  const response = await request(app)
    .post("/stock-ins")
    .send({
      supplierId: null,
      receivedByUserId,
      sourceType: "MANUAL",
      referenceType: "MANUAL",
      referenceNumber: uniqueName("REF"),
      receivedDate: "2026-07-02",
      notes: uniqueName("StockIn"),
      items: [
        {
          productId,
          quantity,
          buyingPrice: 3,
          sellingPrice: 5,
          expirationDate: "2027-07-02",
          lotNumber: uniqueName("LOT"),
        },
      ],
    })
    .expect(201);

  return response.body as { id: string };
};

export const postStockInWithQuantity = async (quantity = 100) => {
  const user = await createTestUser();
  const product = await createProduct();
  const stockIn = await createStockInDraft(product.id, user.id, quantity);

  await request(app).post(`/stock-ins/${stockIn.id}/post`).send({}).expect(200);

  const batch = await prisma.inventoryBatch.findFirstOrThrow({
    where: {
      productId: product.id,
    },
  });

  return {
    user,
    product,
    stockIn,
    batch,
  };
};
