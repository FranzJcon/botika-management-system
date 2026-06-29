import { Router } from "express";

import {
  createProductHandler,
  deleteProductHandler,
  getProduct,
  listProducts,
  updateProductHandler,
} from "./product.controller";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.get("/:id", getProduct);
productRoutes.post("/", createProductHandler);
productRoutes.patch("/:id", updateProductHandler);
productRoutes.delete("/:id", deleteProductHandler);
