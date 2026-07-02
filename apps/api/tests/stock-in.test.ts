import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  app,
  cleanupTestData,
  createProduct,
  createStockInDraft,
  createTestUser,
  prisma,
  quantityOf,
} from "./helpers";

describe("stock in", () => {
  beforeEach(cleanupTestData);
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("posts a draft once, creates inventory and ledger entries, and rejects duplicate posting", async () => {
    const user = await createTestUser();
    const product = await createProduct();
    const stockIn = await createStockInDraft(product.id, user.id, 100);

    await expect(
      prisma.inventoryBatch.findFirst({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBeNull();

    await request(app).post(`/stock-ins/${stockIn.id}/post`).send({}).expect(200);

    const batch = await prisma.inventoryBatch.findFirstOrThrow({
      where: {
        productId: product.id,
      },
    });
    expect(quantityOf(batch.remainingQuantity)).toBe(100);

    const ledgerEntry = await prisma.stockLedgerEntry.findFirst({
      where: {
        productId: product.id,
        inventoryBatchId: batch.id,
        movementType: "STOCK_IN",
      },
    });
    expect(ledgerEntry).not.toBeNull();

    await request(app).post(`/stock-ins/${stockIn.id}/post`).send({}).expect(409);

    await expect(
      prisma.inventoryBatch.count({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBe(1);
  });

  it("rolls back failed posting without creating inventory or ledger records", async () => {
    const user = await createTestUser();
    const product = await createProduct();
    const stockIn = await createStockInDraft(product.id, user.id, 100);

    await prisma.stockInItem.deleteMany({
      where: {
        stockInId: stockIn.id,
      },
    });

    await request(app).post(`/stock-ins/${stockIn.id}/post`).send({}).expect(409);

    await expect(
      prisma.inventoryBatch.count({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBe(0);
    await expect(
      prisma.stockLedgerEntry.count({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBe(0);
    await expect(
      prisma.stockIn.findUniqueOrThrow({
        where: {
          id: stockIn.id,
        },
        select: {
          status: true,
        },
      }),
    ).resolves.toEqual({ status: "DRAFT" });
  });
});
