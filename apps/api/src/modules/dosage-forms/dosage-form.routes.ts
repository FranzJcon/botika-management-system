import { Router } from "express";

import {
  createDosageFormHandler,
  deleteDosageFormHandler,
  getDosageForm,
  listDosageForms,
  updateDosageFormHandler,
} from "./dosage-form.controller";

export const dosageFormRoutes = Router();

dosageFormRoutes.get("/", listDosageForms);
dosageFormRoutes.get("/:id", getDosageForm);
dosageFormRoutes.post("/", createDosageFormHandler);
dosageFormRoutes.patch("/:id", updateDosageFormHandler);
dosageFormRoutes.delete("/:id", deleteDosageFormHandler);
