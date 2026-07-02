import type { Request, Response } from "express";

import {
  createSale,
  getSaleById,
  getSales,
  type SaleServiceError,
} from "./sale.service";
import { createSaleSchema, saleIdParamSchema } from "./sale.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const saleNotFound = (res: Response) =>
  res.status(404).json({
    message: "Sale not found",
  });

const insufficientStock = (res: Response) =>
  res.status(409).json({
    message: "Insufficient stock",
  });

const sendServiceError = (res: Response, error: SaleServiceError) => {
  if (error === "SALE_NOT_FOUND") {
    return saleNotFound(res);
  }

  return insufficientStock(res);
};

export const listSales = async (_req: Request, res: Response) => {
  const sales = await getSales();

  res.json(sales);
};

export const getSale = async (req: Request, res: Response) => {
  const params = saleIdParamSchema.safeParse(req.params);

  if (!params.success) {
    return validationFailed(res);
  }

  const sale = await getSaleById(params.data.id);

  if (!sale) {
    return saleNotFound(res);
  }

  return res.json(sale);
};

export const createSaleHandler = async (req: Request, res: Response) => {
  const result = createSaleSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const sale = await createSale(result.data);

  if (sale.error) {
    return sendServiceError(res, sale.error);
  }

  return res.status(201).json(sale.data);
};
