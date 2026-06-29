import { Router } from "express";

import {
  createStockAdjustmentHandler,
  getStockAdjustment,
  listStockAdjustments,
} from "./stock-adjustment.controller";

export const stockAdjustmentRoutes = Router();

stockAdjustmentRoutes.get("/", listStockAdjustments);
stockAdjustmentRoutes.get("/:id", getStockAdjustment);
stockAdjustmentRoutes.post("/", createStockAdjustmentHandler);
