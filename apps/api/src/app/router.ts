import { Router } from "express";

import { categoryRoutes } from "../modules/categories";
import { healthRoutes } from "../modules/health";

export const router = Router();

router.use("/categories", categoryRoutes);
router.use("/health", healthRoutes);
