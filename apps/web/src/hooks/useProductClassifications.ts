import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type {
  ProductClassification,
  ProductClassificationPayload,
} from "../types/product-classification";

export function useProductClassifications() {
  const [productClassifications, setProductClassifications] = useState<
    ProductClassification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductClassifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<ProductClassification[]>("/product-classifications");
      setProductClassifications(data);
    } catch {
      setError("Unable to load product classifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProductClassifications();
  }, [loadProductClassifications]);

  const createProductClassification = async (
    payload: ProductClassificationPayload,
  ) => {
    await apiPost<ProductClassification>("/product-classifications", payload);
    await loadProductClassifications();
  };

  const updateProductClassification = async (
    id: string,
    payload: ProductClassificationPayload,
  ) => {
    await apiPatch<ProductClassification>(
      `/product-classifications/${id}`,
      payload,
    );
    await loadProductClassifications();
  };

  const archiveProductClassification = async (id: string) => {
    await apiDelete<{ message: string }>(`/product-classifications/${id}`);
    await loadProductClassifications();
  };

  return {
    productClassifications,
    isLoading,
    error,
    reload: loadProductClassifications,
    createProductClassification,
    updateProductClassification,
    archiveProductClassification,
  };
}
