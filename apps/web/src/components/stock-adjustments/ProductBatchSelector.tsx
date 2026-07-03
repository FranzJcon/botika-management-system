import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import type {
  InventoryBatch,
  InventoryLevel,
  ProductInventoryDetails,
} from "../../types/inventory-level";

type ProductBatchSelectorProps = {
  inventoryLevels: InventoryLevel[];
  productId: string;
  onProductChange: (productId: string) => void;
  onBatchesLoaded?: (batches: InventoryBatch[]) => void;
  getProductInventoryDetails: (
    productId: string,
  ) => Promise<ProductInventoryDetails>;
};

const quantityOf = (value: string | number) => Number(value);

export function ProductBatchSelector({
  getProductInventoryDetails,
  inventoryLevels,
  onBatchesLoaded,
  onProductChange,
  productId,
}: ProductBatchSelectorProps) {
  const [query, setQuery] = useState("");
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedProduct = inventoryLevels.find((product) => product.id === productId);

  useEffect(() => {
    setQuery(selectedProduct?.name ?? "");
  }, [selectedProduct?.name]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!productId) {
      return;
    }

    setIsLoadingBatches(true);
    getProductInventoryDetails(productId)
      .then((details) => {
        onBatchesLoaded?.(details.batches);
      })
      .catch(() => onBatchesLoaded?.([]))
      .finally(() => setIsLoadingBatches(false));
  }, [getProductInventoryDetails, productId]);

  const productOptions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery) {
      return inventoryLevels
        .filter((product) => quantityOf(product.totalQuantityOnHand) > 0)
        .slice(0, 24);
    }

    return inventoryLevels
      .filter(
        (product) =>
          product.name.toLowerCase().includes(trimmedQuery) ||
          (product.sku?.toLowerCase().includes(trimmedQuery) ?? false),
      )
      .slice(0, 24);
  }, [inventoryLevels, query]);

  const selectProduct = (productIdToSelect: string) => {
    onProductChange(productIdToSelect);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && ["ArrowDown", "Enter"].includes(event.key)) {
      setIsOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        Math.min(current + 1, productOptions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && productOptions[highlightedIndex]) {
      event.preventDefault();
      selectProduct(productOptions[highlightedIndex].id);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="product-picker" ref={wrapperRef}>
        <label className="field">
          <span>Product</span>
          <input
            className="input"
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightedIndex(0);
              setIsOpen(true);
              if (productId) {
                onProductChange("");
                onBatchesLoaded?.([]);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search product name or SKU"
            required
            value={query}
          />
        </label>

        {isOpen ? (
          <div className="product-picker-menu">
            {productOptions.length > 0 ? (
              productOptions.map((product, index) => (
                <button
                  className={
                    highlightedIndex === index
                      ? "product-picker-option highlighted"
                      : "product-picker-option"
                  }
                  key={product.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectProduct(product.id);
                  }}
                  type="button"
                >
                  <strong>{product.name}</strong>
                  <span>
                    {product.sku ? `SKU: ${product.sku}` : "No SKU"} | Stock:{" "}
                    {quantityOf(product.totalQuantityOnHand).toLocaleString()}
                  </span>
                </button>
              ))
            ) : (
              <div className="product-picker-empty">
                <p>No matching product found.</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
      {isLoadingBatches ? <p className="field-hint">Loading batches...</p> : null}
    </>
  );
}
