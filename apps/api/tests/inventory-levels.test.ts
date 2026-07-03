import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  app,
  cleanupTestData,
  postStockInWithQuantity,
  prisma,
} from "./helpers";

describe("inventory levels", () => {
  beforeEach(cleanupTestData);
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("returns total quantity on hand from available batches", async () => {
    const { product } = await postStockInWithQuantity(100);

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        defaultSellingPrice: 8,
      },
    });

    const response = await request(app).get("/inventory-levels").expect(200);

    const inventoryLevel = response.body.find(
      (level: { id: string }) => level.id === product.id,
    );

    expect(inventoryLevel.totalQuantityOnHand).toBe(100);
    expect(Number(inventoryLevel.sellingPrice)).toBe(8);
  });
});
