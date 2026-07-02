import { Router } from "express";

import { loginHandler, meHandler } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/login", loginHandler);
authRoutes.get("/me", meHandler);
