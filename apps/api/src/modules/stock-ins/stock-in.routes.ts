import { Router } from "express";

import {
  createStockInHandler,
  getStockIn,
  listStockIns,
  postStockInHandler,
} from "./stock-in.controller";

export const stockInRoutes = Router();

stockInRoutes.get("/", listStockIns);
stockInRoutes.get("/:id", getStockIn);
stockInRoutes.post("/", createStockInHandler);
stockInRoutes.post("/:id/post", postStockInHandler);
