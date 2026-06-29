import { Router } from "express";

import {
  createBrandHandler,
  deleteBrandHandler,
  getBrand,
  listBrands,
  updateBrandHandler,
} from "./brand.controller";

export const brandRoutes = Router();

brandRoutes.get("/", listBrands);
brandRoutes.get("/:id", getBrand);
brandRoutes.post("/", createBrandHandler);
brandRoutes.patch("/:id", updateBrandHandler);
brandRoutes.delete("/:id", deleteBrandHandler);
