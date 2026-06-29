import type { Request, Response } from "express";

import {
  getExpiringSoonInventoryBatches,
  getInventoryLevels,
  getLowStockInventoryLevels,
  getProductInventoryLevel,
} from "./inventory-level.service";

const productNotFound = (res: Response) =>
  res.status(404).json({
    message: "Product not found",
  });

const getProductIdParam = (req: Request) => {
  const { productId } = req.params;

  return Array.isArray(productId) ? productId[0] : productId;
};

export const listInventoryLevels = async (_req: Request, res: Response) => {
  const inventoryLevels = await getInventoryLevels();

  res.json(inventoryLevels);
};

export const getProductInventoryLevelHandler = async (
  req: Request,
  res: Response,
) => {
  const result = await getProductInventoryLevel(getProductIdParam(req));

  if (result.error) {
    return productNotFound(res);
  }

  return res.json(result.data);
};

export const listLowStockInventoryLevels = async (
  _req: Request,
  res: Response,
) => {
  const inventoryLevels = await getLowStockInventoryLevels();

  res.json(inventoryLevels);
};

export const listExpiringSoonInventoryBatches = async (
  _req: Request,
  res: Response,
) => {
  const batches = await getExpiringSoonInventoryBatches();

  res.json(batches);
};
