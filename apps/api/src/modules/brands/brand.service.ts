import { prisma } from "../../lib/prisma";

import type { CreateBrandInput, UpdateBrandInput } from "./brand.schemas";

export type BrandServiceError = "BRAND_NOT_FOUND" | "BRAND_ALREADY_EXISTS";

type BrandServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: BrandServiceError;
    };

const brandExists = async (id: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(brand);
};

const duplicateBrandExists = async (name: string, excludeId?: string) => {
  const brand = await prisma.brand.findFirst({
    where: {
      name,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  return Boolean(brand);
};

export const getBrands = async () =>
  prisma.brand.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

export const getBrandById = async (id: string) =>
  prisma.brand.findUnique({
    where: { id },
  });

export const createBrand = async (
  input: CreateBrandInput,
): Promise<BrandServiceResult<Awaited<ReturnType<typeof getBrandById>>>> => {
  if (await duplicateBrandExists(input.name)) {
    return { error: "BRAND_ALREADY_EXISTS" };
  }

  const brand = await prisma.brand.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });

  return { data: brand };
};

export const updateBrand = async (
  id: string,
  input: UpdateBrandInput,
): Promise<BrandServiceResult<Awaited<ReturnType<typeof getBrandById>>>> => {
  const brand = await prisma.brand.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!brand) {
    return { error: "BRAND_NOT_FOUND" };
  }

  const name = input.name ?? brand.name;

  if (await duplicateBrandExists(name, id)) {
    return { error: "BRAND_ALREADY_EXISTS" };
  }

  const updatedBrand = await prisma.brand.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
    },
  });

  return { data: updatedBrand };
};

export const archiveBrand = async (
  id: string,
): Promise<BrandServiceResult<{ message: string }>> => {
  if (!(await brandExists(id))) {
    return { error: "BRAND_NOT_FOUND" };
  }

  await prisma.brand.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return {
    data: {
      message: "Brand archived successfully",
    },
  };
};
