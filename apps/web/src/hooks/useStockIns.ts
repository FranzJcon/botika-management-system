import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPost } from "../lib/api";
import type { Product } from "../types/product";
import type { CreateStockInPayload, StockIn } from "../types/stock-in";

export function useStockIns() {
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStockIns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [stockInData, productData] = await Promise.all([
        apiGet<StockIn[]>("/stock-ins"),
        apiGet<Product[]>("/products"),
      ]);

      setStockIns(stockInData);
      setProducts(productData);
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

  const postStockIn = async (id: string) => {
    await apiPost<StockIn>(`/stock-ins/${id}/post`, {});
    await loadStockIns();
  };

  return {
    stockIns,
    products,
    isLoading,
    error,
    reload: loadStockIns,
    getStockIn,
    createStockIn,
    postStockIn,
  };
}
