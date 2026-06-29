import type { Request, Response } from "express";

import {
  archiveCategory,
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  type CategoryServiceError,
} from "./category.service";
import { createCategorySchema, updateCategorySchema } from "./category.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const categoryNotFound = (res: Response) =>
  res.status(404).json({
    message: "Category not found",
  });

const categoryAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "Category already exists",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (res: Response, error: CategoryServiceError) => {
  if (error === "CATEGORY_ALREADY_EXISTS") {
    return categoryAlreadyExists(res);
  }

  if (error === "CATEGORY_NOT_FOUND" || error === "PARENT_CATEGORY_NOT_FOUND") {
    return categoryNotFound(res);
  }

  return validationFailed(res);
};

export const listCategories = async (_req: Request, res: Response) => {
  const categories = await getCategories();

  res.json(categories);
};

export const getCategory = async (req: Request, res: Response) => {
  const category = await getCategoryById(getIdParam(req));

  if (!category) {
    return categoryNotFound(res);
  }

  return res.json(category);
};

export const createCategoryHandler = async (req: Request, res: Response) => {
  const result = createCategorySchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const category = await createCategory(result.data);

  if (category.error) {
    return sendServiceError(res, category.error);
  }

  return res.status(201).json(category.data);
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  const result = updateCategorySchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const category = await updateCategory(getIdParam(req), result.data);

  if (category.error) {
    return sendServiceError(res, category.error);
  }

  return res.json(category.data);
};

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  const result = await archiveCategory(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};
