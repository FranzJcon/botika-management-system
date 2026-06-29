import type { Request, Response } from "express";

import {
  archiveProduct,
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  type ProductServiceError,
} from "./product.service";
import { createProductSchema, updateProductSchema } from "./product.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const productNotFound = (res: Response) =>
  res.status(404).json({
    message: "Product not found",
  });

const skuAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "SKU already exists",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (res: Response, error: ProductServiceError) => {
  if (error === "SKU_ALREADY_EXISTS") {
    return skuAlreadyExists(res);
  }

  if (error === "PRODUCT_NOT_FOUND") {
    return productNotFound(res);
  }

  return validationFailed(res);
};

export const listProducts = async (_req: Request, res: Response) => {
  const products = await getProducts();

  res.json(products);
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await getProductById(getIdParam(req));

  if (!product) {
    return productNotFound(res);
  }

  return res.json(product);
};

export const createProductHandler = async (req: Request, res: Response) => {
  const result = createProductSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const product = await createProduct(result.data);

  if (product.error) {
    return sendServiceError(res, product.error);
  }

  return res.status(201).json(product.data);
};

export const updateProductHandler = async (req: Request, res: Response) => {
  const result = updateProductSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const product = await updateProduct(getIdParam(req), result.data);

  if (product.error) {
    return sendServiceError(res, product.error);
  }

  return res.json(product.data);
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  const result = await archiveProduct(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};
