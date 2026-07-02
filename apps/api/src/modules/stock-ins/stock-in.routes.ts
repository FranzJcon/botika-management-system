import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import {
  createStockInHandler,
  getStockIn,
  listStockIns,
  postStockInHandler,
} from "./stock-in.controller";

export const stockInRoutes = Router();

stockInRoutes.get("/", listStockIns);
stockInRoutes.get("/:id", getStockIn);
stockInRoutes.post("/", requireAuth, createStockInHandler);
stockInRoutes.post("/:id/post", requireAuth, postStockInHandler);
