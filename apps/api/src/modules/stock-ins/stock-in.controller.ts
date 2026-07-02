import type { Request, Response } from "express";

import {
  createStockIn,
  getStockInById,
  getStockIns,
  postStockIn,
  type StockInServiceError,
} from "./stock-in.service";
import { createStockInSchema, postStockInSchema } from "./stock-in.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const stockInNotFound = (res: Response) =>
  res.status(404).json({
    message: "Stock in not found",
  });

const stockInCannotBePosted = (res: Response) =>
  res.status(409).json({
    message: "Stock in cannot be posted",
  });

const stockInHasNoItems = (res: Response) =>
  res.status(409).json({
    message: "Stock in must contain at least one item",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (res: Response, error: StockInServiceError) => {
  if (error === "STOCK_IN_NOT_FOUND") {
    return stockInNotFound(res);
  }

  if (error === "STOCK_IN_CANNOT_BE_POSTED") {
    return stockInCannotBePosted(res);
  }

  if (error === "STOCK_IN_HAS_NO_ITEMS") {
    return stockInHasNoItems(res);
  }

  return validationFailed(res);
};

export const listStockIns = async (_req: Request, res: Response) => {
  const stockIns = await getStockIns();

  res.json(stockIns);
};

export const getStockIn = async (req: Request, res: Response) => {
  const stockIn = await getStockInById(getIdParam(req));

  if (!stockIn) {
    return stockInNotFound(res);
  }

  return res.json(stockIn);
};

export const createStockInHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = createStockInSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const stockIn = await createStockIn({
    ...result.data,
    receivedByUserId: req.user.id,
  });

  if (stockIn.error) {
    return sendServiceError(res, stockIn.error);
  }

  return res.status(201).json(stockIn.data);
};

export const postStockInHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = postStockInSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return validationFailed(res);
  }

  const stockIn = await postStockIn(getIdParam(req));

  if (stockIn.error) {
    return sendServiceError(res, stockIn.error);
  }

  return res.json(stockIn.data);
};
