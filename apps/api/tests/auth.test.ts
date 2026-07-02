import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  app,
  cleanupTestData,
  createAuthenticatedTestUser,
  createProduct,
  createStockInDraft,
  prisma,
  upsertSeedAdminUser,
} from "./helpers";

describe("auth", () => {
  beforeEach(cleanupTestData);
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("logs in with the seeded admin user", async () => {
    await upsertSeedAdminUser();

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "admin@botika.local",
        password: "admin123",
      })
      .expect(200);

    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: "admin@botika.local",
      displayName: "Administrator",
      role: "ADMIN",
    });
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a bad password", async () => {
    await upsertSeedAdminUser();

    await request(app)
      .post("/auth/login")
      .send({
        email: "admin@botika.local",
        password: "wrong-password",
      })
      .expect(401);
  });

  it("returns the current user with a valid token", async () => {
    const { user, token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });
  });

  it("requires auth for creating stock-ins", async () => {
    const product = await createProduct();

    await request(app)
      .post("/stock-ins")
      .send({
        supplierId: null,
        sourceType: "MANUAL",
        referenceType: "MANUAL",
        referenceNumber: "AUTH-REF",
        receivedDate: "2026-07-02",
        notes: "Auth required",
        items: [
          {
            productId: product.id,
            quantity: 10,
            buyingPrice: 3,
            sellingPrice: 5,
          },
        ],
      })
      .expect(401);
  });

  it("creates stock-ins for the authenticated user without receivedByUserId", async () => {
    const { user, token } = await createAuthenticatedTestUser();
    const product = await createProduct();

    const stockIn = await createStockInDraft(product.id, token, 10);

    const created = await prisma.stockIn.findUniqueOrThrow({
      where: {
        id: stockIn.id,
      },
      select: {
        receivedByUserId: true,
      },
    });

    expect(created.receivedByUserId).toBe(user.id);
  });
});
