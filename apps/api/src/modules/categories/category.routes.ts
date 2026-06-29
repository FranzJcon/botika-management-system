import { Router } from "express";

import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategory,
  listCategories,
  updateCategoryHandler,
} from "./category.controller";

export const categoryRoutes = Router();

categoryRoutes.get("/", listCategories);
categoryRoutes.get("/:id", getCategory);
categoryRoutes.post("/", createCategoryHandler);
categoryRoutes.patch("/:id", updateCategoryHandler);
categoryRoutes.delete("/:id", deleteCategoryHandler);
