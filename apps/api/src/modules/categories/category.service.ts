import { prisma } from "../../lib/prisma";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schemas";

export type CategoryServiceError =
  | "CATEGORY_NOT_FOUND"
  | "CATEGORY_ALREADY_EXISTS"
  | "PARENT_CATEGORY_NOT_FOUND"
  | "CATEGORY_CANNOT_BE_OWN_PARENT";

type CategoryServiceResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: CategoryServiceError;
    };

const categoryInclude = {
  parent: true,
  children: true,
};

const normalizeParentId = (parentId: string | null | undefined) =>
  parentId ?? null;

const categoryExists = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(category);
};

const duplicateCategoryExists = async (
  name: string,
  parentId: string | null,
  excludeId?: string,
) => {
  const category = await prisma.category.findFirst({
    where: {
      name,
      parentId,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  return Boolean(category);
};

export const getCategories = async () =>
  prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: categoryInclude,
  });

export const getCategoryById = async (id: string) =>
  prisma.category.findUnique({
    where: { id },
    include: categoryInclude,
  });

export const createCategory = async (
  input: CreateCategoryInput,
): Promise<CategoryServiceResult<Awaited<ReturnType<typeof getCategoryById>>>> => {
  const parentId = normalizeParentId(input.parentId);

  if (parentId && !(await categoryExists(parentId))) {
    return { error: "PARENT_CATEGORY_NOT_FOUND" };
  }

  if (await duplicateCategoryExists(input.name, parentId)) {
    return { error: "CATEGORY_ALREADY_EXISTS" };
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      parentId,
    },
    include: categoryInclude,
  });

  return { data: category };
};

export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput,
): Promise<CategoryServiceResult<Awaited<ReturnType<typeof getCategoryById>>>> => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true, parentId: true },
  });

  if (!category) {
    return { error: "CATEGORY_NOT_FOUND" };
  }

  if (input.parentId === id) {
    return { error: "CATEGORY_CANNOT_BE_OWN_PARENT" };
  }

  const parentId =
    input.parentId === undefined
      ? category.parentId
      : normalizeParentId(input.parentId);

  if (parentId && !(await categoryExists(parentId))) {
    return { error: "PARENT_CATEGORY_NOT_FOUND" };
  }

  const name = input.name ?? category.name;

  if (await duplicateCategoryExists(name, parentId, id)) {
    return { error: "CATEGORY_ALREADY_EXISTS" };
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      parentId: input.parentId,
      isActive: input.isActive,
    },
    include: categoryInclude,
  });

  return { data: updatedCategory };
};

export const archiveCategory = async (
  id: string,
): Promise<CategoryServiceResult<{ message: string }>> => {
  if (!(await categoryExists(id))) {
    return { error: "CATEGORY_NOT_FOUND" };
  }

  await prisma.category.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return {
    data: {
      message: "Category archived successfully",
    },
  };
};
