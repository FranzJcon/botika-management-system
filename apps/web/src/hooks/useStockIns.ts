import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type { Category } from "../types/category";
import type { Product, ProductPayload } from "../types/product";
import type { CreateStockInPayload, StockIn } from "../types/stock-in";

export function useStockIns() {
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStockIns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [stockInData, productData, categoryData] = await Promise.all([
        apiGet<StockIn[]>("/stock-ins"),
        apiGet<Product[]>("/products"),
        apiGet<Category[]>("/categories"),
      ]);

      setStockIns(stockInData);
      setProducts(productData);
      setCategories(categoryData);
    } catch {
      setError("Unable to load stock-ins. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStockIns();
  }, [loadStockIns]);

  const getStockIn = async (id: string) => apiGet<StockIn>(`/stock-ins/${id}`);

  const createStockIn = async (payload: CreateStockInPayload) => {
    await apiPost<StockIn>("/stock-ins", payload);
    await loadStockIns();
  };

  const updateStockIn = async (id: string, payload: CreateStockInPayload) => {
    await apiPatch<StockIn>(`/stock-ins/${id}`, payload);
    await loadStockIns();
  };

  const deleteStockIn = async (id: string) => {
    await apiDelete<{ message: string }>(`/stock-ins/${id}`);
    await loadStockIns();
  };

  const createProduct = async (payload: ProductPayload) => {
    const product = await apiPost<Product>("/products", payload);
    await loadStockIns();

    return product;
  };

  const postStockIn = async (id: string) => {
    await apiPost<StockIn>(`/stock-ins/${id}/post`, {});
    await loadStockIns();
  };

  return {
    stockIns,
    products,
    categories,
    isLoading,
    error,
    reload: loadStockIns,
    getStockIn,
    createStockIn,
    updateStockIn,
    deleteStockIn,
    createProduct,
    postStockIn,
  };
}
