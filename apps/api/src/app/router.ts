import { Router } from "express";

import { brandRoutes } from "../modules/brands";
import { categoryRoutes } from "../modules/categories";
import { dosageFormRoutes } from "../modules/dosage-forms";
import { genericDrugRoutes } from "../modules/generic-drugs";
import { healthRoutes } from "../modules/health";
import { productRoutes } from "../modules/products";
import { productClassificationRoutes } from "../modules/product-classifications";
import { stockInRoutes } from "../modules/stock-ins";

export const router = Router();

router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/dosage-forms", dosageFormRoutes);
router.use("/generic-drugs", genericDrugRoutes);
router.use("/health", healthRoutes);
router.use("/products", productRoutes);
router.use("/product-classifications", productClassificationRoutes);
router.use("/stock-ins", stockInRoutes);
