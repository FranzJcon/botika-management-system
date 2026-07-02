import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type { Brand } from "../types/brand";
import type { Category } from "../types/category";
import type { DosageForm } from "../types/dosage-form";
import type { GenericDrug } from "../types/generic-drug";
import type { ProductClassification } from "../types/product-classification";
import type { Product, ProductLookupData, ProductPayload } from "../types/product";

const emptyLookupData: ProductLookupData = {
  categories: [],
  brands: [],
  genericDrugs: [],
  dosageForms: [],
  productClassifications: [],
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lookups, setLookups] = useState<ProductLookupData>(emptyLookupData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        productsData,
        categories,
        brands,
        genericDrugs,
        dosageForms,
        productClassifications,
      ] = await Promise.all([
        apiGet<Product[]>("/products"),
        apiGet<Category[]>("/categories"),
        apiGet<Brand[]>("/brands"),
        apiGet<GenericDrug[]>("/generic-drugs"),
        apiGet<DosageForm[]>("/dosage-forms"),
        apiGet<ProductClassification[]>("/product-classifications"),
      ]);

      setProducts(productsData);
      setLookups({
        categories,
        brands,
        genericDrugs,
        dosageForms,
        productClassifications,
      });
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const createProduct = async (payload: ProductPayload) => {
    await apiPost<Product>("/products", payload);
    await loadProducts();
  };

  const updateProduct = async (id: string, payload: ProductPayload) => {
    await apiPatch<Product>(`/products/${id}`, payload);
    await loadProducts();
  };

  const archiveProduct = async (id: string) => {
    await apiDelete<{ message: string }>(`/products/${id}`);
    await loadProducts();
  };

  return {
    products,
    lookups,
    isLoading,
    error,
    reload: loadProducts,
    createProduct,
    updateProduct,
    archiveProduct,
  };
}
