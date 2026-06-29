import type { Request, Response } from "express";

import {
  archiveProduct,
  createProductAlias,
  createProductBarcode,
  createProduct,
  deleteProductAlias,
  deleteProductBarcode,
  getProductAliases,
  getProductBarcodes,
  getProductById,
  getProducts,
  updateProduct,
  type ProductServiceError,
} from "./product.service";
import {
  createProductAliasSchema,
  createProductBarcodeSchema,
  createProductSchema,
  updateProductSchema,
} from "./product.schemas";

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

const aliasNotFound = (res: Response) =>
  res.status(404).json({
    message: "Alias not found",
  });

const barcodeNotFound = (res: Response) =>
  res.status(404).json({
    message: "Barcode not found",
  });

const aliasAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "Alias already exists",
  });

const barcodeAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "Barcode already exists",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const getRouteParam = (req: Request, name: string) => {
  const value = req.params[name];

  return Array.isArray(value) ? value[0] : value;
};

const sendServiceError = (res: Response, error: ProductServiceError) => {
  if (error === "SKU_ALREADY_EXISTS") {
    return skuAlreadyExists(res);
  }

  if (error === "ALIAS_ALREADY_EXISTS") {
    return aliasAlreadyExists(res);
  }

  if (error === "BARCODE_ALREADY_EXISTS") {
    return barcodeAlreadyExists(res);
  }

  if (error === "PRODUCT_NOT_FOUND") {
    return productNotFound(res);
  }

  if (error === "ALIAS_NOT_FOUND") {
    return aliasNotFound(res);
  }

  if (error === "BARCODE_NOT_FOUND") {
    return barcodeNotFound(res);
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

export const listProductAliases = async (req: Request, res: Response) => {
  const result = await getProductAliases(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};

export const createProductAliasHandler = async (
  req: Request,
  res: Response,
) => {
  const result = createProductAliasSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const alias = await createProductAlias(getIdParam(req), result.data);

  if (alias.error) {
    return sendServiceError(res, alias.error);
  }

  return res.status(201).json(alias.data);
};

export const deleteProductAliasHandler = async (
  req: Request,
  res: Response,
) => {
  const result = await deleteProductAlias(
    getIdParam(req),
    getRouteParam(req, "aliasId"),
  );

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};

export const listProductBarcodes = async (req: Request, res: Response) => {
  const result = await getProductBarcodes(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};

export const createProductBarcodeHandler = async (
  req: Request,
  res: Response,
) => {
  const result = createProductBarcodeSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const barcode = await createProductBarcode(getIdParam(req), result.data);

  if (barcode.error) {
    return sendServiceError(res, barcode.error);
  }

  return res.status(201).json(barcode.data);
};

export const deleteProductBarcodeHandler = async (
  req: Request,
  res: Response,
) => {
  const result = await deleteProductBarcode(
    getIdParam(req),
    getRouteParam(req, "barcodeId"),
  );

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};
