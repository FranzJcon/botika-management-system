import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  app,
  cleanupTestData,
  createAuthenticatedTestUser,
  createProduct,
  createStockInDraft,
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
    const { token } = await createAuthenticatedTestUser();
    const product = await createProduct();
    const stockIn = await createStockInDraft(product.id, token, 100);

    await expect(
      prisma.inventoryBatch.findFirst({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBeNull();

    await request(app)
      .post(`/stock-ins/${stockIn.id}/post`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(200);

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

    await request(app)
      .post(`/stock-ins/${stockIn.id}/post`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(409);

    await expect(
      prisma.inventoryBatch.count({
        where: {
          productId: product.id,
        },
      }),
    ).resolves.toBe(1);
  });

  it("rolls back failed posting without creating inventory or ledger records", async () => {
    const { token } = await createAuthenticatedTestUser();
    const product = await createProduct();
    const stockIn = await createStockInDraft(product.id, token, 100);

    await prisma.stockInItem.deleteMany({
      where: {
        stockInId: stockIn.id,
      },
    });

    await request(app)
      .post(`/stock-ins/${stockIn.id}/post`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(409);

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

  it("updates a draft by replacing its items and then deletes the draft", async () => {
    const { token } = await createAuthenticatedTestUser();
    const originalProduct = await createProduct();
    const replacementProduct = await createProduct();
    const stockIn = await createStockInDraft(originalProduct.id, token, 100);

    const updateResponse = await request(app)
      .patch(`/stock-ins/${stockIn.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        supplierId: null,
        sourceType: "EXCEL",
        referenceType: "DELIVERY_RECEIPT",
        referenceNumber: "TEST-IT-UPDATED-REF",
        receivedDate: "2026-07-03",
        notes: "TEST-IT-updated-stock-in",
        items: [
          {
            productId: replacementProduct.id,
            quantity: 25,
            buyingPrice: 4,
            sellingPrice: 7,
            expirationDate: "2028-07-03",
            lotNumber: "TEST-IT-UPDATED-LOT",
          },
        ],
      })
      .expect(200);

    expect(updateResponse.body.sourceType).toBe("EXCEL");
    expect(updateResponse.body.items).toHaveLength(1);
    expect(updateResponse.body.items[0].productId).toBe(replacementProduct.id);
    expect(quantityOf(updateResponse.body.items[0].quantity)).toBe(25);

    await expect(
      prisma.stockInItem.count({
        where: {
          stockInId: stockIn.id,
        },
      }),
    ).resolves.toBe(1);
    await expect(
      prisma.inventoryBatch.count({
        where: {
          productId: replacementProduct.id,
        },
      }),
    ).resolves.toBe(0);

    await request(app)
      .delete(`/stock-ins/${stockIn.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    await expect(
      prisma.stockIn.findUnique({
        where: {
          id: stockIn.id,
        },
      }),
    ).resolves.toBeNull();
    await expect(
      prisma.stockInItem.count({
        where: {
          stockInId: stockIn.id,
        },
      }),
    ).resolves.toBe(0);
  });

  it("rejects updating or deleting a posted stock in", async () => {
    const { token } = await createAuthenticatedTestUser();
    const product = await createProduct();
    const stockIn = await createStockInDraft(product.id, token, 100);

    await request(app)
      .post(`/stock-ins/${stockIn.id}/post`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(200);

    await request(app)
      .patch(`/stock-ins/${stockIn.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        supplierId: null,
        sourceType: "MANUAL",
        referenceType: "MANUAL",
        referenceNumber: "TEST-IT-SHOULD-NOT-UPDATE",
        receivedDate: "2026-07-03",
        notes: "TEST-IT-should-not-update",
        items: [
          {
            productId: product.id,
            quantity: 5,
            buyingPrice: 4,
            sellingPrice: 7,
            expirationDate: "2028-07-03",
            lotNumber: "TEST-IT-SHOULD-NOT-UPDATE",
          },
        ],
      })
      .expect(409);

    await request(app)
      .delete(`/stock-ins/${stockIn.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);

    const persistedStockIn = await prisma.stockIn.findUniqueOrThrow({
      where: {
        id: stockIn.id,
      },
      include: {
        items: true,
      },
    });
    expect(persistedStockIn.status).toBe("POSTED");
    expect(persistedStockIn.items).toHaveLength(1);
    expect(quantityOf(persistedStockIn.items[0].quantity)).toBe(100);
  });
});
