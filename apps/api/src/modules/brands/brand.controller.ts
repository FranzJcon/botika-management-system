import type { Request, Response } from "express";

import {
  archiveBrand,
  createBrand,
  getBrandById,
  getBrands,
  updateBrand,
  type BrandServiceError,
} from "./brand.service";
import { createBrandSchema, updateBrandSchema } from "./brand.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const brandNotFound = (res: Response) =>
  res.status(404).json({
    message: "Brand not found",
  });

const brandAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "Brand already exists",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (res: Response, error: BrandServiceError) => {
  if (error === "BRAND_ALREADY_EXISTS") {
    return brandAlreadyExists(res);
  }

  return brandNotFound(res);
};

export const listBrands = async (_req: Request, res: Response) => {
  const brands = await getBrands();

  res.json(brands);
};

export const getBrand = async (req: Request, res: Response) => {
  const brand = await getBrandById(getIdParam(req));

  if (!brand) {
    return brandNotFound(res);
  }

  return res.json(brand);
};

export const createBrandHandler = async (req: Request, res: Response) => {
  const result = createBrandSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const brand = await createBrand(result.data);

  if (brand.error) {
    return sendServiceError(res, brand.error);
  }

  return res.status(201).json(brand.data);
};

export const updateBrandHandler = async (req: Request, res: Response) => {
  const result = updateBrandSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const brand = await updateBrand(getIdParam(req), result.data);

  if (brand.error) {
    return sendServiceError(res, brand.error);
  }

  return res.json(brand.data);
};

export const deleteBrandHandler = async (req: Request, res: Response) => {
  const result = await archiveBrand(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};
