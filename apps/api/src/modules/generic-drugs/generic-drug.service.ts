import { prisma } from "../../lib/prisma";

import type {
  CreateGenericDrugInput,
  UpdateGenericDrugInput,
} from "./generic-drug.schemas";

export type GenericDrugServiceError =
  | "GENERIC_DRUG_NOT_FOUND"
  | "GENERIC_DRUG_ALREADY_EXISTS";

type GenericDrugServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: GenericDrugServiceError;
    };

const genericDrugExists = async (id: string) => {
  const genericDrug = await prisma.genericDrug.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(genericDrug);
};

const duplicateGenericDrugExists = async (name: string, excludeId?: string) => {
  const genericDrug = await prisma.genericDrug.findFirst({
    where: {
      name,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  return Boolean(genericDrug);
};

export const getGenericDrugs = async () =>
  prisma.genericDrug.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

export const getGenericDrugById = async (id: string) =>
  prisma.genericDrug.findUnique({
    where: { id },
  });

export const createGenericDrug = async (
  input: CreateGenericDrugInput,
): Promise<
  GenericDrugServiceResult<Awaited<ReturnType<typeof getGenericDrugById>>>
> => {
  if (await duplicateGenericDrugExists(input.name)) {
    return { error: "GENERIC_DRUG_ALREADY_EXISTS" };
  }

  const genericDrug = await prisma.genericDrug.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });

  return { data: genericDrug };
};

export const updateGenericDrug = async (
  id: string,
  input: UpdateGenericDrugInput,
): Promise<
  GenericDrugServiceResult<Awaited<ReturnType<typeof getGenericDrugById>>>
> => {
  const genericDrug = await prisma.genericDrug.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!genericDrug) {
    return { error: "GENERIC_DRUG_NOT_FOUND" };
  }

  const name = input.name ?? genericDrug.name;

  if (await duplicateGenericDrugExists(name, id)) {
    return { error: "GENERIC_DRUG_ALREADY_EXISTS" };
  }

  const updatedGenericDrug = await prisma.genericDrug.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
    },
  });

  return { data: updatedGenericDrug };
};

export const archiveGenericDrug = async (
  id: string,
): Promise<GenericDrugServiceResult<{ message: string }>> => {
  if (!(await genericDrugExists(id))) {
    return { error: "GENERIC_DRUG_NOT_FOUND" };
  }

  await prisma.genericDrug.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return {
    data: {
      message: "Generic drug archived successfully",
    },
  };
};
