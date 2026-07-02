import { useCallback, useEffect, useState } from "react";

import { apiGet } from "../lib/api";
import type {
  ExpiringSoonBatch,
  InventoryLevel,
  ProductInventoryDetails,
} from "../types/inventory-level";

export function useInventoryLevels() {
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [lowStockLevels, setLowStockLevels] = useState<InventoryLevel[]>([]);
  const [expiringSoonBatches, setExpiringSoonBatches] = useState<
    ExpiringSoonBatch[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [allStock, lowStock, expiringSoon] = await Promise.all([
        apiGet<InventoryLevel[]>("/inventory-levels"),
        apiGet<InventoryLevel[]>("/inventory-levels/low-stock"),
        apiGet<ExpiringSoonBatch[]>("/inventory-levels/expiring-soon"),
      ]);

      setInventoryLevels(allStock);
      setLowStockLevels(lowStock);
      setExpiringSoonBatches(expiringSoon);
    } catch {
      setError("Unable to load inventory levels. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const getProductInventoryDetails = (productId: string) =>
    apiGet<ProductInventoryDetails>(`/inventory-levels/products/${productId}`);

  return {
    inventoryLevels,
    lowStockLevels,
    expiringSoonBatches,
    isLoading,
    error,
    reload: loadInventory,
    getProductInventoryDetails,
  };
}
