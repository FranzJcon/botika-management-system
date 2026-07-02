import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  app,
  cleanupTestData,
  postStockInWithQuantity,
  prisma,
  quantityOf,
  uniqueName,
} from "./helpers";

describe("sales", () => {
  beforeEach(cleanupTestData);
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("deducts stock and creates sale, item, batch consumption, and ledger records", async () => {
    const { product, batch } = await postStockInWithQuantity(100);

    const response = await request(app)
      .post("/sales")
      .send({
        saleDate: "2026-07-02",
        notes: uniqueName("Sale"),
        items: [
          {
            productId: product.id,
            quantity: 25,
            sellingPrice: 5,
          },
        ],
      })
      .expect(201);

    expect(response.body.status).toBe("COMPLETED");
    expect(quantityOf(response.body.totalAmount)).toBe(125);
    expect(response.body.items).toHaveLength(1);
    expect(quantityOf(response.body.items[0].lineTotal)).toBe(125);

    const batchAfterSale = await prisma.inventoryBatch.findUniqueOrThrow({
      where: {
        id: batch.id,
      },
    });
    expect(quantityOf(batchAfterSale.remainingQuantity)).toBe(75);

    await expect(
      prisma.sale.count({
        where: {
          id: response.body.id,
        },
      }),
    ).resolves.toBe(1);
    await expect(
      prisma.saleItem.count({
        where: {
          saleId: response.body.id,
          productId: product.id,
        },
      }),
    ).resolves.toBe(1);
    await expect(
      prisma.saleBatchConsumption.count({
        where: {
          saleId: response.body.id,
          productId: product.id,
          inventoryBatchId: batch.id,
        },
      }),
    ).resolves.toBe(1);
    await expect(
      prisma.stockLedgerEntry.count({
        where: {
          productId: product.id,
          inventoryBatchId: batch.id,
          movementType: "SALE",
          quantityChange: -25,
        },
      }),
    ).resolves.toBe(1);
  });

  it("rejects insufficient stock and rolls back sale records and batch updates", async () => {
    const { product, batch } = await postStockInWithQuantity(100);
    const saleCountBefore = await prisma.sale.count();

    await request(app)
      .post("/sales")
      .send({
        saleDate: "2026-07-02",
        notes: uniqueName("Sale"),
        items: [
          {
            productId: product.id,
            quantity: 200,
            sellingPrice: 5,
          },
        ],
      })
      .expect(409, {
        message: "Insufficient stock",
      });

    const batchAfterFailedSale = await prisma.inventoryBatch.findUniqueOrThrow({
      where: {
        id: batch.id,
      },
    });
    expect(quantityOf(batchAfterFailedSale.remainingQuantity)).toBe(100);

    await expect(prisma.sale.count()).resolves.toBe(saleCountBefore);
    await expect(
      prisma.saleItem.count({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBe(0);
    await expect(
      prisma.saleBatchConsumption.count({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBe(0);
    await expect(
      prisma.stockLedgerEntry.count({
        where: {
          productId: product.id,
          movementType: "SALE",
        },
      }),
    ).resolves.toBe(0);
  });
});
