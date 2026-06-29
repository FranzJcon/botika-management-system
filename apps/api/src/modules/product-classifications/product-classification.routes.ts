import { Router } from "express";

import {
  createProductClassificationHandler,
  deleteProductClassificationHandler,
  getProductClassification,
  listProductClassifications,
  updateProductClassificationHandler,
} from "./product-classification.controller";

export const productClassificationRoutes = Router();

productClassificationRoutes.get("/", listProductClassifications);
productClassificationRoutes.get("/:id", getProductClassification);
productClassificationRoutes.post("/", createProductClassificationHandler);
productClassificationRoutes.patch("/:id", updateProductClassificationHandler);
productClassificationRoutes.delete("/:id", deleteProductClassificationHandler);
