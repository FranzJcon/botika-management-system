import type { Category } from "../types/category";

const PHARMACEUTICAL_CATEGORY_NAMES = new Set(["pharmaceuticals"]);

export const isPharmaceuticalCategory = (category?: Category | null) =>
  Boolean(
    category &&
      PHARMACEUTICAL_CATEGORY_NAMES.has(category.name.trim().toLowerCase()),
  );
