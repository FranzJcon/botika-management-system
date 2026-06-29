import { prisma } from "../../lib/prisma";

import type {
  CreateDosageFormInput,
  UpdateDosageFormInput,
} from "./dosage-form.schemas";

export type DosageFormServiceError =
  | "DOSAGE_FORM_NOT_FOUND"
  | "DOSAGE_FORM_ALREADY_EXISTS";

type DosageFormServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: DosageFormServiceError;
    };

const dosageFormExists = async (id: string) => {
  const dosageForm = await prisma.dosageForm.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(dosageForm);
};

const duplicateDosageFormExists = async (name: string, excludeId?: string) => {
  const dosageForm = await prisma.dosageForm.findFirst({
    where: {
      name,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  return Boolean(dosageForm);
};

export const getDosageForms = async () =>
  prisma.dosageForm.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

export const getDosageFormById = async (id: string) =>
  prisma.dosageForm.findUnique({
    where: { id },
  });

export const createDosageForm = async (
  input: CreateDosageFormInput,
): Promise<
  DosageFormServiceResult<Awaited<ReturnType<typeof getDosageFormById>>>
> => {
  if (await duplicateDosageFormExists(input.name)) {
    return { error: "DOSAGE_FORM_ALREADY_EXISTS" };
  }

  const dosageForm = await prisma.dosageForm.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });

  return { data: dosageForm };
};

export const updateDosageForm = async (
  id: string,
  input: UpdateDosageFormInput,
): Promise<
  DosageFormServiceResult<Awaited<ReturnType<typeof getDosageFormById>>>
> => {
  const dosageForm = await prisma.dosageForm.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!dosageForm) {
    return { error: "DOSAGE_FORM_NOT_FOUND" };
  }

  const name = input.name ?? dosageForm.name;

  if (await duplicateDosageFormExists(name, id)) {
    return { error: "DOSAGE_FORM_ALREADY_EXISTS" };
  }

  const updatedDosageForm = await prisma.dosageForm.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
    },
  });

  return { data: updatedDosageForm };
};

export const archiveDosageForm = async (
  id: string,
): Promise<DosageFormServiceResult<{ message: string }>> => {
  if (!(await dosageFormExists(id))) {
    return { error: "DOSAGE_FORM_NOT_FOUND" };
  }

  await prisma.dosageForm.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return {
    data: {
      message: "Dosage form archived successfully",
    },
  };
};
