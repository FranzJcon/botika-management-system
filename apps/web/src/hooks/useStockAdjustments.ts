import { useCallback, useEffect, useState } from "react";

import { ApiRequestError, apiGet, apiPost } from "../lib/api";
import type {
  InventoryLevel,
  ProductInventoryDetails,
} from "../types/inventory-level";
import type {
  CreateStockAdjustmentPayload,
  StockAdjustment,
} from "../types/stock-adjustment";

export function useStockAdjustments() {
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [adjustments, inventory] = await Promise.all([
        apiGet<StockAdjustment[]>("/stock-adjustments"),
        apiGet<InventoryLevel[]>("/inventory-levels"),
      ]);

      setStockAdjustments(adjustments);
      setInventoryLevels(inventory);
    } catch {
      setError("Unable to load stock adjustments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const getStockAdjustment = (id: string) =>
    apiGet<StockAdjustment>(`/stock-adjustments/${id}`);

  const getProductInventoryDetails = (productId: string) =>
    apiGet<ProductInventoryDetails>(`/inventory-levels/products/${productId}`);

  const createStockAdjustment = async (payload: CreateStockAdjustmentPayload) => {
    try {
      const stockAdjustment = await apiPost<StockAdjustment>(
        "/stock-adjustments",
        payload,
      );
      await loadData();

      return stockAdjustment;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        throw new Error(error.responseMessage ?? "Unable to apply stock adjustment.");
      }

      throw error;
    }
  };

  return {
    stockAdjustments,
    inventoryLevels,
    isLoading,
    error,
    reload: loadData,
    getStockAdjustment,
    getProductInventoryDetails,
    createStockAdjustment,
  };
}
