import { Router } from "express";

import {
  createProductAliasHandler,
  createProductBarcodeHandler,
  createProductHandler,
  deleteProductAliasHandler,
  deleteProductBarcodeHandler,
  deleteProductHandler,
  getProduct,
  listProductAliases,
  listProductBarcodes,
  listProducts,
  updateProductHandler,
} from "./product.controller";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.get("/:id/aliases", listProductAliases);
productRoutes.post("/:id/aliases", createProductAliasHandler);
productRoutes.delete("/:id/aliases/:aliasId", deleteProductAliasHandler);
productRoutes.get("/:id/barcodes", listProductBarcodes);
productRoutes.post("/:id/barcodes", createProductBarcodeHandler);
productRoutes.delete("/:id/barcodes/:barcodeId", deleteProductBarcodeHandler);
productRoutes.get("/:id", getProduct);
productRoutes.post("/", createProductHandler);
productRoutes.patch("/:id", updateProductHandler);
productRoutes.delete("/:id", deleteProductHandler);
