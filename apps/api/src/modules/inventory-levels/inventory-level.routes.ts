import { Router } from "express";

import {
  getProductInventoryLevelHandler,
  listExpiringSoonInventoryBatches,
  listInventoryLevels,
  listLowStockInventoryLevels,
} from "./inventory-level.controller";

export const inventoryLevelRoutes = Router();

inventoryLevelRoutes.get("/", listInventoryLevels);
inventoryLevelRoutes.get("/low-stock", listLowStockInventoryLevels);
inventoryLevelRoutes.get("/expiring-soon", listExpiringSoonInventoryBatches);
inventoryLevelRoutes.get("/products/:productId", getProductInventoryLevelHandler);
