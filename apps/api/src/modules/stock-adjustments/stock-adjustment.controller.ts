import type { Request, Response } from "express";

import {
  createStockAdjustment,
  getStockAdjustmentById,
  getStockAdjustments,
  type StockAdjustmentServiceError,
} from "./stock-adjustment.service";
import { createStockAdjustmentSchema } from "./stock-adjustment.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const stockAdjustmentNotFound = (res: Response) =>
  res.status(404).json({
    message: "Stock adjustment not found",
  });

const stockAdjustmentCannotBeApplied = (res: Response, message?: string) =>
  res.status(409).json({
    message: message ?? "Stock adjustment cannot be applied",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (
  res: Response,
  error: StockAdjustmentServiceError,
  message?: string,
) => {
  if (error === "STOCK_ADJUSTMENT_NOT_FOUND") {
    return stockAdjustmentNotFound(res);
  }

  return stockAdjustmentCannotBeApplied(res, message);
};

export const listStockAdjustments = async (_req: Request, res: Response) => {
  const stockAdjustments = await getStockAdjustments();

  res.json(stockAdjustments);
};

export const getStockAdjustment = async (req: Request, res: Response) => {
  const stockAdjustment = await getStockAdjustmentById(getIdParam(req));

  if (!stockAdjustment) {
    return stockAdjustmentNotFound(res);
  }

  return res.json(stockAdjustment);
};

export const createStockAdjustmentHandler = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = createStockAdjustmentSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const stockAdjustment = await createStockAdjustment({
    ...result.data,
    adjustedByUserId: req.user.id,
  });

  if (stockAdjustment.error) {
    return sendServiceError(
      res,
      stockAdjustment.error,
      stockAdjustment.message,
    );
  }

  return res.status(201).json(stockAdjustment.data);
};
