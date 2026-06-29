import { Router } from "express";

import { categoryRoutes } from "../modules/categories";
import { genericDrugRoutes } from "../modules/generic-drugs";
import { healthRoutes } from "../modules/health";
import { productClassificationRoutes } from "../modules/product-classifications";

export const router = Router();

router.use("/categories", categoryRoutes);
router.use("/generic-drugs", genericDrugRoutes);
router.use("/health", healthRoutes);
router.use("/product-classifications", productClassificationRoutes);
