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

describe("stock adjustments", () => {
  beforeEach(cleanupTestData);
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("reduces stock, creates ledger entries, and rejects adjustments below zero", async () => {
    const { token, product, batch } = await postStockInWithQuantity(100);

    await request(app)
      .post("/stock-adjustments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        reason: "Damaged items",
        notes: uniqueName("Adjustment"),
        items: [
          {
            productId: product.id,
            inventoryBatchId: batch.id,
            quantityChange: -10,
            notes: "Broken packaging",
          },
        ],
      })
      .expect(201);

    const adjustedBatch = await prisma.inventoryBatch.findUniqueOrThrow({
      where: {
        id: batch.id,
      },
    });
    expect(quantityOf(adjustedBatch.remainingQuantity)).toBe(90);

    await expect(
      prisma.stockLedgerEntry.count({
        where: {
          productId: product.id,
          inventoryBatchId: batch.id,
          movementType: "ADJUSTMENT_REMOVE",
        },
      }),
    ).resolves.toBe(1);

    await request(app)
      .post("/stock-adjustments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        reason: "Physical count correction",
        notes: uniqueName("Adjustment"),
        items: [
          {
            productId: product.id,
            inventoryBatchId: batch.id,
            quantityChange: -200,
          },
        ],
      })
      .expect(409);

    const batchAfterFailedAdjustment = await prisma.inventoryBatch.findUniqueOrThrow({
      where: {
        id: batch.id,
      },
    });
    expect(quantityOf(batchAfterFailedAdjustment.remainingQuantity)).toBe(90);
  });

  it("rolls back a failed adjustment without partial records", async () => {
    const { token, product, batch } = await postStockInWithQuantity(100);

    const stockAdjustmentCountBefore = await prisma.stockAdjustment.count();
    const ledgerCountBefore = await prisma.stockLedgerEntry.count({
      where: {
        productId: product.id,
      },
    });

    await request(app)
      .post("/stock-adjustments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        reason: "Invalid adjustment",
        notes: uniqueName("Adjustment"),
        items: [
          {
            productId: product.id,
            inventoryBatchId: batch.id,
            quantityChange: -200,
          },
        ],
      })
      .expect(409);

    await expect(prisma.stockAdjustment.count()).resolves.toBe(
      stockAdjustmentCountBefore,
    );
    await expect(
      prisma.stockLedgerEntry.count({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBe(ledgerCountBefore);

    const batchAfterFailedAdjustment = await prisma.inventoryBatch.findUniqueOrThrow({
      where: {
        id: batch.id,
      },
    });
    expect(quantityOf(batchAfterFailedAdjustment.remainingQuantity)).toBe(100);
  });
});
