import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { Button } from "../ui/Button";
import type { Product } from "../../types/product";

type ProductPickerProps = {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
  onQuickAdd: (initialName: string) => void;
};

const matchesQuery = (product: Product, query: string) => {
  const normalizedQuery = query.toLowerCase();

  return (
    product.name.toLowerCase().includes(normalizedQuery) ||
    (product.sku?.toLowerCase().includes(normalizedQuery) ?? false)
  );
};

export function ProductPicker({
  onChange,
  onQuickAdd,
  products,
  value,
}: ProductPickerProps) {
  const selectedProduct = products.find((product) => product.id === value);
  const activeProducts = products.filter((product) => product.status === "ACTIVE");
  const [query, setQuery] = useState(selectedProduct?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const matchingProducts = useMemo(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return activeProducts.slice(0, 8);
    }

    return activeProducts
      .filter((product) => matchesQuery(product, trimmedQuery))
      .slice(0, 8);
  }, [activeProducts, query]);

  const selectProduct = (product: Product) => {
    onChange(product.id);
    setQuery(product.name);
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
        Math.min(current + 1, matchingProducts.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && matchingProducts[highlightedIndex]) {
      event.preventDefault();
      selectProduct(matchingProducts[highlightedIndex]);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="product-picker" ref={wrapperRef}>
      <label className="field">
        <span>Product</span>
        <input
          className="input"
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(0);
            setIsOpen(true);
            if (value) {
              onChange("");
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
          {matchingProducts.length > 0 ? (
            matchingProducts.map((product, index) => (
              <button
                className={
                  highlightedIndex === index
                    ? "product-picker-option highlighted"
                    : "product-picker-option"
                }
                key={product.id}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectProduct(product);
                }}
                type="button"
              >
                <strong>{product.name}</strong>
                <span>{product.sku ? `SKU: ${product.sku}` : "No SKU"}</span>
              </button>
            ))
          ) : (
            <div className="product-picker-empty">
              <p>No matching product found.</p>
              <Button
                variant="secondary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setIsOpen(false);
                  onQuickAdd(query.trim());
                }}
              >
                + Quick Add Product
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
