import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import {
  createStockInHandler,
  deleteStockInHandler,
  getStockIn,
  listStockIns,
  postStockInHandler,
  updateStockInHandler,
} from "./stock-in.controller";

export const stockInRoutes = Router();

stockInRoutes.get("/", listStockIns);
stockInRoutes.get("/:id", getStockIn);
stockInRoutes.post("/", requireAuth, createStockInHandler);
stockInRoutes.patch("/:id", requireAuth, updateStockInHandler);
stockInRoutes.delete("/:id", requireAuth, deleteStockInHandler);
stockInRoutes.post("/:id/post", requireAuth, postStockInHandler);
