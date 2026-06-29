import { prisma } from "../../lib/prisma";

import type {
  CreateProductAliasInput,
  CreateProductBarcodeInput,
  CreateProductInput,
  UpdateProductInput,
} from "./product.schemas";

export type ProductServiceError =
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_RELATION_NOT_FOUND"
  | "SKU_ALREADY_EXISTS"
  | "ALIAS_NOT_FOUND"
  | "ALIAS_ALREADY_EXISTS"
  | "BARCODE_NOT_FOUND"
  | "BARCODE_ALREADY_EXISTS";

type ProductServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: ProductServiceError;
    };

const productInclude = {
  category: true,
  classification: true,
  genericDrug: true,
  dosageFormRef: true,
  brand: true,
  aliases: true,
  barcodes: true,
};

const productExists = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(product);
};

const skuExists = async (sku: string, excludeId?: string) => {
  const product = await prisma.product.findFirst({
    where: {
      sku,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  return Boolean(product);
};

const validateRelations = async (input: {
  categoryId?: string | null;
  classificationId?: string | null;
  genericDrugId?: string | null;
  dosageFormId?: string | null;
  brandId?: string | null;
}) => {
  if (
    input.categoryId &&
    !(await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    }))
  ) {
    return false;
  }

  if (
    input.classificationId &&
    !(await prisma.productClassification.findUnique({
      where: { id: input.classificationId },
      select: { id: true },
    }))
  ) {
    return false;
  }

  if (
    input.genericDrugId &&
    !(await prisma.genericDrug.findUnique({
      where: { id: input.genericDrugId },
      select: { id: true },
    }))
  ) {
    return false;
  }

  if (
    input.dosageFormId &&
    !(await prisma.dosageForm.findUnique({
      where: { id: input.dosageFormId },
      select: { id: true },
    }))
  ) {
    return false;
  }

  if (
    input.brandId &&
    !(await prisma.brand.findUnique({
      where: { id: input.brandId },
      select: { id: true },
    }))
  ) {
    return false;
  }

  return true;
};

export const getProducts = async () =>
  prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    include: productInclude,
  });

export const getProductById = async (id: string) =>
  prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

export const createProduct = async (
  input: CreateProductInput,
): Promise<ProductServiceResult<Awaited<ReturnType<typeof getProductById>>>> => {
  if (input.sku && (await skuExists(input.sku))) {
    return { error: "SKU_ALREADY_EXISTS" };
  }

  if (!(await validateRelations(input))) {
    return { error: "PRODUCT_RELATION_NOT_FOUND" };
  }

  const product = await prisma.product.create({
    data: {
      name: input.name,
      sku: input.sku ?? null,
      categoryId: input.categoryId ?? null,
      classificationId: input.classificationId ?? null,
      genericDrugId: input.genericDrugId ?? null,
      dosageFormId: input.dosageFormId ?? null,
      brandId: input.brandId ?? null,
      genericName: input.genericName ?? null,
      brandName: input.brandName ?? null,
      dosageForm: input.dosageForm ?? null,
      strength: input.strength ?? null,
      unit: input.unit,
      productType: input.productType,
      defaultSellingPrice: input.defaultSellingPrice,
      reorderLevel: input.reorderLevel ?? 0,
      requiresPrescription: input.requiresPrescription,
      requiresExpiryTracking: input.requiresExpiryTracking,
      requiresLotTracking: input.requiresLotTracking,
    },
    include: productInclude,
  });

  return { data: product };
};

export const updateProduct = async (
  id: string,
  input: UpdateProductInput,
): Promise<ProductServiceResult<Awaited<ReturnType<typeof getProductById>>>> => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, sku: true },
  });

  if (!product) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  if (input.sku && input.sku !== product.sku && (await skuExists(input.sku, id))) {
    return { error: "SKU_ALREADY_EXISTS" };
  }

  if (!(await validateRelations(input))) {
    return { error: "PRODUCT_RELATION_NOT_FOUND" };
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      sku: input.sku,
      categoryId: input.categoryId,
      classificationId: input.classificationId,
      genericDrugId: input.genericDrugId,
      dosageFormId: input.dosageFormId,
      brandId: input.brandId,
      genericName: input.genericName,
      brandName: input.brandName,
      dosageForm: input.dosageForm,
      strength: input.strength,
      unit: input.unit,
      productType: input.productType,
      defaultSellingPrice: input.defaultSellingPrice,
      reorderLevel: input.reorderLevel,
      requiresPrescription: input.requiresPrescription,
      requiresExpiryTracking: input.requiresExpiryTracking,
      requiresLotTracking: input.requiresLotTracking,
      status: input.status,
    },
    include: productInclude,
  });

  return { data: updatedProduct };
};

export const archiveProduct = async (
  id: string,
): Promise<ProductServiceResult<{ message: string }>> => {
  if (!(await productExists(id))) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  await prisma.product.update({
    where: { id },
    data: {
      status: "INACTIVE",
    },
  });

  return {
    data: {
      message: "Product archived successfully",
    },
  };
};

export const getProductAliases = async (
  productId: string,
): Promise<ProductServiceResult<Awaited<ReturnType<typeof prisma.productAlias.findMany>>>> => {
  if (!(await productExists(productId))) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  const aliases = await prisma.productAlias.findMany({
    where: {
      productId,
    },
    orderBy: {
      alias: "asc",
    },
  });

  return { data: aliases };
};

export const createProductAlias = async (
  productId: string,
  input: CreateProductAliasInput,
): Promise<ProductServiceResult<Awaited<ReturnType<typeof prisma.productAlias.create>>>> => {
  if (!(await productExists(productId))) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  const existingAlias = await prisma.productAlias.findFirst({
    where: {
      productId,
      alias: {
        equals: input.alias,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (existingAlias) {
    return { error: "ALIAS_ALREADY_EXISTS" };
  }

  const alias = await prisma.productAlias.create({
    data: {
      productId,
      alias: input.alias,
    },
  });

  return { data: alias };
};

export const deleteProductAlias = async (
  productId: string,
  aliasId: string,
): Promise<ProductServiceResult<{ message: string }>> => {
  if (!(await productExists(productId))) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  const alias = await prisma.productAlias.findFirst({
    where: {
      id: aliasId,
      productId,
    },
    select: {
      id: true,
    },
  });

  if (!alias) {
    return { error: "ALIAS_NOT_FOUND" };
  }

  await prisma.productAlias.delete({
    where: {
      id: alias.id,
    },
  });

  return {
    data: {
      message: "Alias removed successfully",
    },
  };
};

export const getProductBarcodes = async (
  productId: string,
): Promise<
  ProductServiceResult<Awaited<ReturnType<typeof prisma.productBarcode.findMany>>>
> => {
  if (!(await productExists(productId))) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  const barcodes = await prisma.productBarcode.findMany({
    where: {
      productId,
    },
    orderBy: {
      barcode: "asc",
    },
  });

  return { data: barcodes };
};

export const createProductBarcode = async (
  productId: string,
  input: CreateProductBarcodeInput,
): Promise<
  ProductServiceResult<Awaited<ReturnType<typeof prisma.productBarcode.create>>>
> => {
  if (!(await productExists(productId))) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  const existingBarcode = await prisma.productBarcode.findUnique({
    where: {
      barcode: input.barcode,
    },
    select: {
      id: true,
    },
  });

  if (existingBarcode) {
    return { error: "BARCODE_ALREADY_EXISTS" };
  }

  const barcode = await prisma.productBarcode.create({
    data: {
      productId,
      barcode: input.barcode,
    },
  });

  return { data: barcode };
};

export const deleteProductBarcode = async (
  productId: string,
  barcodeId: string,
): Promise<ProductServiceResult<{ message: string }>> => {
  if (!(await productExists(productId))) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  const barcode = await prisma.productBarcode.findFirst({
    where: {
      id: barcodeId,
      productId,
    },
    select: {
      id: true,
    },
  });

  if (!barcode) {
    return { error: "BARCODE_NOT_FOUND" };
  }

  await prisma.productBarcode.delete({
    where: {
      id: barcode.id,
    },
  });

  return {
    data: {
      message: "Barcode removed successfully",
    },
  };
};
