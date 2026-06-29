import { Router } from "express";

import { categoryRoutes } from "../modules/categories";
import { dosageFormRoutes } from "../modules/dosage-forms";
import { genericDrugRoutes } from "../modules/generic-drugs";
import { healthRoutes } from "../modules/health";
import { productClassificationRoutes } from "../modules/product-classifications";

export const router = Router();

router.use("/categories", categoryRoutes);
router.use("/dosage-forms", dosageFormRoutes);
router.use("/generic-drugs", genericDrugRoutes);
router.use("/health", healthRoutes);
router.use("/product-classifications", productClassificationRoutes);
