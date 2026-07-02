import { Router } from "express";

import { createSaleHandler, getSale, listSales } from "./sale.controller";

export const saleRoutes = Router();

saleRoutes.get("/", listSales);
saleRoutes.get("/:id", getSale);
saleRoutes.post("/", createSaleHandler);
