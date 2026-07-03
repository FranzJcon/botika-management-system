import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPost } from "../lib/api";
import type { Category } from "../types/category";
import type { DosageForm } from "../types/dosage-form";
import type { Product, ProductPayload } from "../types/product";
import type { ProductClassification } from "../types/product-classification";
import type { CreateStockInPayload, StockIn } from "../types/stock-in";

export function useStockImport() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dosageForms, setDosageForms] = useState<DosageForm[]>([]);
  const [productClassifications, setProductClassifications] = useState<
    ProductClassification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLookups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        productData,
        categoryData,
        dosageFormData,
        productClassificationData,
      ] = await Promise.all([
        apiGet<Product[]>("/products"),
        apiGet<Category[]>("/categories"),
        apiGet<DosageForm[]>("/dosage-forms"),
        apiGet<ProductClassification[]>("/product-classifications"),
      ]);

      setProducts(productData);
      setCategories(categoryData);
      setDosageForms(dosageFormData);
      setProductClassifications(productClassificationData);
    } catch {
      setError("Unable to load import lookups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  const createProduct = async (payload: ProductPayload) => {
    const product = await apiPost<Product>("/products", payload);
    await loadLookups();

    return product;
  };

  const createStockInDraft = async (payload: CreateStockInPayload) =>
    apiPost<StockIn>("/stock-ins", payload);

  return {
    categories,
    createProduct,
    createStockInDraft,
    dosageForms,
    error,
    isLoading,
    productClassifications,
    products,
    reload: loadLookups,
  };
}
