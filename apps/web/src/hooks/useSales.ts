import { useCallback, useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "../lib/api";
import type { InventoryLevel } from "../types/inventory-level";
import type { CartItem, CreateSalePayload, SaleProduct } from "../types/sale";

const quantityOf = (value: string | number) => Number(value);

const priceOf = (product: SaleProduct) => Number(product.sellingPrice);

const today = () => new Date().toISOString().slice(0, 10);

export function useSales() {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<InventoryLevel[]>("/inventory-levels");
      setProducts(data);
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const visibleProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return products.filter((product) => quantityOf(product.totalQuantityOnHand) > 0);
    }

    return products.filter((product) => {
      const nameMatches = product.name.toLowerCase().includes(query);
      const skuMatches = product.sku?.toLowerCase().includes(query) ?? false;

      return nameMatches || skuMatches;
    });
  }, [products, searchTerm]);

  const addProduct = (product: SaleProduct) => {
    const availableStock = quantityOf(product.totalQuantityOnHand);

    if (availableStock <= 0) {
      return;
    }

    setSuccessMessage(null);
    setSaleError(null);
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      );

      if (!existingItem) {
        return [
          ...currentItems,
          {
            product,
            quantity: 1,
            sellingPrice: priceOf(product),
          },
        ];
      }

      return currentItems.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, availableStock),
            }
          : item,
      );
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setSuccessMessage(null);
    setSaleError(null);
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.product.id !== productId) {
            return item;
          }

          const availableStock = quantityOf(item.product.totalQuantityOnHand);
          const clampedQuantity = Math.max(0, Math.min(quantity, availableStock));

          return {
            ...item,
            quantity: clampedQuantity,
          };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  };

  const completeSale = async () => {
    if (cartItems.length === 0) {
      return false;
    }

    setIsCompleting(true);
    setSaleError(null);
    setSuccessMessage(null);

    const payload: CreateSalePayload = {
      saleDate: today(),
      notes: "Simple sale",
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
      })),
    };

    try {
      await apiPost<unknown>("/sales", payload);
      setCartItems([]);
      await loadProducts();
      setSuccessMessage("Sale completed successfully.");
      return true;
    } catch {
      setSaleError(
        "Unable to complete sale. One or more products no longer have sufficient inventory. Please review the cart and try again.",
      );
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    products,
    visibleProducts,
    cartItems,
    searchTerm,
    isLoading,
    isCompleting,
    error,
    saleError,
    successMessage,
    setSearchTerm,
    addProduct,
    updateQuantity,
    removeItem,
    completeSale,
    reloadProducts: loadProducts,
  };
}
