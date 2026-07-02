import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { app, cleanupTestData, createProduct, prisma, uniqueName } from "./helpers";

describe("products", () => {
  beforeEach(cleanupTestData);
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("creates, fetches, lists, and rejects duplicate SKUs", async () => {
    const sku = uniqueName("SKU");
    const product = await createProduct({
      name: uniqueName("Biogesic"),
      sku,
    });

    expect(product.id).toBeTruthy();
    expect(product.sku).toBe(sku);

    await request(app)
      .post("/products")
      .send({
        name: uniqueName("Duplicate"),
        sku,
        productType: "MEDICINE",
      })
      .expect(409);

    const fetchedProduct = await request(app)
      .get(`/products/${product.id}`)
      .expect(200);

    expect(fetchedProduct.body.id).toBe(product.id);

    const products = await request(app).get("/products").expect(200);

    expect(
      products.body.some(
        (listedProduct: { id: string }) => listedProduct.id === product.id,
      ),
    ).toBe(true);
  });
});
