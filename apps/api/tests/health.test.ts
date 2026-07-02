import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./helpers";

describe("health", () => {
  it("returns ok status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body.status).toBe("ok");
  });
});
