import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import {
  createStockAdjustmentHandler,
  getStockAdjustment,
  listStockAdjustments,
} from "./stock-adjustment.controller";

export const stockAdjustmentRoutes = Router();

stockAdjustmentRoutes.get("/", listStockAdjustments);
stockAdjustmentRoutes.get("/:id", getStockAdjustment);
stockAdjustmentRoutes.post("/", requireAuth, createStockAdjustmentHandler);
