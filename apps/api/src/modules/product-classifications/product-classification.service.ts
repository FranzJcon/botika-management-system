import { prisma } from "../../lib/prisma";

import type {
  CreateProductClassificationInput,
  UpdateProductClassificationInput,
} from "./product-classification.schemas";

export type ProductClassificationServiceError =
  | "PRODUCT_CLASSIFICATION_NOT_FOUND"
  | "PRODUCT_CLASSIFICATION_ALREADY_EXISTS";

type ProductClassificationServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: ProductClassificationServiceError;
    };

const productClassificationExists = async (id: string) => {
  const productClassification = await prisma.productClassification.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(productClassification);
};

const duplicateProductClassificationExists = async (
  name: string,
  excludeId?: string,
) => {
  const productClassification = await prisma.productClassification.findFirst({
    where: {
      name,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  return Boolean(productClassification);
};

export const getProductClassifications = async () =>
  prisma.productClassification.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

export const getProductClassificationById = async (id: string) =>
  prisma.productClassification.findUnique({
    where: { id },
  });

export const createProductClassification = async (
  input: CreateProductClassificationInput,
): Promise<
  ProductClassificationServiceResult<
    Awaited<ReturnType<typeof getProductClassificationById>>
  >
> => {
  if (await duplicateProductClassificationExists(input.name)) {
    return { error: "PRODUCT_CLASSIFICATION_ALREADY_EXISTS" };
  }

  const productClassification = await prisma.productClassification.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });

  return { data: productClassification };
};

export const updateProductClassification = async (
  id: string,
  input: UpdateProductClassificationInput,
): Promise<
  ProductClassificationServiceResult<
    Awaited<ReturnType<typeof getProductClassificationById>>
  >
> => {
  const productClassification = await prisma.productClassification.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!productClassification) {
    return { error: "PRODUCT_CLASSIFICATION_NOT_FOUND" };
  }

  const name = input.name ?? productClassification.name;

  if (await duplicateProductClassificationExists(name, id)) {
    return { error: "PRODUCT_CLASSIFICATION_ALREADY_EXISTS" };
  }

  const updatedProductClassification =
    await prisma.productClassification.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        isActive: input.isActive,
      },
    });

  return { data: updatedProductClassification };
};

export const archiveProductClassification = async (
  id: string,
): Promise<ProductClassificationServiceResult<{ message: string }>> => {
  if (!(await productClassificationExists(id))) {
    return { error: "PRODUCT_CLASSIFICATION_NOT_FOUND" };
  }

  await prisma.productClassification.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return {
    data: {
      message: "Product classification archived successfully",
    },
  };
};
