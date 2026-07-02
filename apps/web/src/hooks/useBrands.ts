import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type { Brand, BrandPayload } from "../types/brand";

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<Brand[]>("/brands");
      setBrands(data);
    } catch {
      setError("Unable to load brands. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  const createBrand = async (payload: BrandPayload) => {
    await apiPost<Brand>("/brands", payload);
    await loadBrands();
  };

  const updateBrand = async (id: string, payload: BrandPayload) => {
    await apiPatch<Brand>(`/brands/${id}`, payload);
    await loadBrands();
  };

  const archiveBrand = async (id: string) => {
    await apiDelete<{ message: string }>(`/brands/${id}`);
    await loadBrands();
  };

  return {
    brands,
    isLoading,
    error,
    reload: loadBrands,
    createBrand,
    updateBrand,
    archiveBrand,
  };
}
