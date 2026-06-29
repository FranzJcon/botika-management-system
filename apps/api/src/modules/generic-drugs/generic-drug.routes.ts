import { Router } from "express";

import {
  createGenericDrugHandler,
  deleteGenericDrugHandler,
  getGenericDrug,
  listGenericDrugs,
  updateGenericDrugHandler,
} from "./generic-drug.controller";

export const genericDrugRoutes = Router();

genericDrugRoutes.get("/", listGenericDrugs);
genericDrugRoutes.get("/:id", getGenericDrug);
genericDrugRoutes.post("/", createGenericDrugHandler);
genericDrugRoutes.patch("/:id", updateGenericDrugHandler);
genericDrugRoutes.delete("/:id", deleteGenericDrugHandler);
