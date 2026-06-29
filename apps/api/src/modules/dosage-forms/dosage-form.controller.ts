import type { Request, Response } from "express";

import {
  archiveDosageForm,
  createDosageForm,
  getDosageFormById,
  getDosageForms,
  updateDosageForm,
  type DosageFormServiceError,
} from "./dosage-form.service";
import {
  createDosageFormSchema,
  updateDosageFormSchema,
} from "./dosage-form.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const dosageFormNotFound = (res: Response) =>
  res.status(404).json({
    message: "Dosage form not found",
  });

const dosageFormAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "Dosage form already exists",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (res: Response, error: DosageFormServiceError) => {
  if (error === "DOSAGE_FORM_ALREADY_EXISTS") {
    return dosageFormAlreadyExists(res);
  }

  return dosageFormNotFound(res);
};

export const listDosageForms = async (_req: Request, res: Response) => {
  const dosageForms = await getDosageForms();

  res.json(dosageForms);
};

export const getDosageForm = async (req: Request, res: Response) => {
  const dosageForm = await getDosageFormById(getIdParam(req));

  if (!dosageForm) {
    return dosageFormNotFound(res);
  }

  return res.json(dosageForm);
};

export const createDosageFormHandler = async (
  req: Request,
  res: Response,
) => {
  const result = createDosageFormSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const dosageForm = await createDosageForm(result.data);

  if (dosageForm.error) {
    return sendServiceError(res, dosageForm.error);
  }

  return res.status(201).json(dosageForm.data);
};

export const updateDosageFormHandler = async (
  req: Request,
  res: Response,
) => {
  const result = updateDosageFormSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const dosageForm = await updateDosageForm(getIdParam(req), result.data);

  if (dosageForm.error) {
    return sendServiceError(res, dosageForm.error);
  }

  return res.json(dosageForm.data);
};

export const deleteDosageFormHandler = async (
  req: Request,
  res: Response,
) => {
  const result = await archiveDosageForm(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};
