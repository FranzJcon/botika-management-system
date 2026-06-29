import type { Request, Response } from "express";

import {
  archiveGenericDrug,
  createGenericDrug,
  getGenericDrugById,
  getGenericDrugs,
  updateGenericDrug,
  type GenericDrugServiceError,
} from "./generic-drug.service";
import {
  createGenericDrugSchema,
  updateGenericDrugSchema,
} from "./generic-drug.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const genericDrugNotFound = (res: Response) =>
  res.status(404).json({
    message: "Generic drug not found",
  });

const genericDrugAlreadyExists = (res: Response) =>
  res.status(409).json({
    message: "Generic drug already exists",
  });

const getIdParam = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

const sendServiceError = (res: Response, error: GenericDrugServiceError) => {
  if (error === "GENERIC_DRUG_ALREADY_EXISTS") {
    return genericDrugAlreadyExists(res);
  }

  return genericDrugNotFound(res);
};

export const listGenericDrugs = async (_req: Request, res: Response) => {
  const genericDrugs = await getGenericDrugs();

  res.json(genericDrugs);
};

export const getGenericDrug = async (req: Request, res: Response) => {
  const genericDrug = await getGenericDrugById(getIdParam(req));

  if (!genericDrug) {
    return genericDrugNotFound(res);
  }

  return res.json(genericDrug);
};

export const createGenericDrugHandler = async (
  req: Request,
  res: Response,
) => {
  const result = createGenericDrugSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const genericDrug = await createGenericDrug(result.data);

  if (genericDrug.error) {
    return sendServiceError(res, genericDrug.error);
  }

  return res.status(201).json(genericDrug.data);
};

export const updateGenericDrugHandler = async (
  req: Request,
  res: Response,
) => {
  const result = updateGenericDrugSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const genericDrug = await updateGenericDrug(getIdParam(req), result.data);

  if (genericDrug.error) {
    return sendServiceError(res, genericDrug.error);
  }

  return res.json(genericDrug.data);
};

export const deleteGenericDrugHandler = async (
  req: Request,
  res: Response,
) => {
  const result = await archiveGenericDrug(getIdParam(req));

  if (result.error) {
    return sendServiceError(res, result.error);
  }

  return res.json(result.data);
};
