import { Router } from "express";

import { healthRoutes } from "../modules/health";

export const router = Router();

router.use("/health", healthRoutes);
