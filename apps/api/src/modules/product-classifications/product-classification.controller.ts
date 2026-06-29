import type { Request, Response } from "express";

import {
  archiveProductClassification,
  createProductClassification,
  getProductClassificationById,
  getProductClassifications,
  updateProductClassification,
  type ProductClassificationServiceError,
} from "./product-classification.service";
import {
  createProductClassificationSchema,
  updateProductClassificationSchema,
} from "./product-classification.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const productClassificationNotFound = (res: Response) =>
  res.status(404).json({
    message: "Product classification not found",
  });

const productClassificationAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "Product classification already exists",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (
  res: Response,
  error: ProductClassificationServiceError,
) => {
  if (error === "PRODUCT_CLASSIFICATION_ALREADY_EXISTS") {
    return productClassificationAlreadyExists(res);
  }

  return productClassificationNotFound(res);
};

export const listProductClassifications = async (
  _req: Request,
  res: Response,
) => {
  const productClassifications = await getProductClassifications();

  res.json(productClassifications);
};

export const getProductClassification = async (
  req: Request,
  res: Response,
) => {
  const productClassification = await getProductClassificationById(
    getIdParam(req),
  );

  if (!productClassification) {
    return productClassificationNotFound(res);
  }

  return res.json(productClassification);
};

export const createProductClassificationHandler = async (
  req: Request,
  res: Response,
) => {
  const result = createProductClassificationSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const productClassification = await createProductClassification(result.data);

  if (productClassification.error) {
    return sendServiceError(res, productClassification.error);
  }

  return res.status(201).json(productClassification.data);
};

export const updateProductClassificationHandler = async (
  req: Request,
  res: Response,
) => {
  const result = updateProductClassificationSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const productClassification = await updateProductClassification(
    getIdParam(req),
    result.data,
  );

  if (productClassification.error) {
    return sendServiceError(res, productClassification.error);
  }

  return res.json(productClassification.data);
};

export const deleteProductClassificationHandler = async (
  req: Request,
  res: Response,
) => {
  const result = await archiveProductClassification(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};
