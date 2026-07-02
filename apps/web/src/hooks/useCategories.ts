import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type { Category, CategoryPayload } from "../types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<Category[]>("/categories");
      setCategories(data);
    } catch {
      setError("Unable to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const createCategory = async (payload: CategoryPayload) => {
    await apiPost<Category>("/categories", payload);
    await loadCategories();
  };

  const updateCategory = async (id: string, payload: CategoryPayload) => {
    await apiPatch<Category>(`/categories/${id}`, payload);
    await loadCategories();
  };

  const archiveCategory = async (id: string) => {
    await apiDelete<{ message: string }>(`/categories/${id}`);
    await loadCategories();
  };

  return {
    categories,
    isLoading,
    error,
    reload: loadCategories,
    createCategory,
    updateCategory,
    archiveCategory,
  };
}
