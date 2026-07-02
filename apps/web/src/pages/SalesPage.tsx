import { useEffect, useRef, useState } from "react";

import { Cart } from "../components/sales/Cart";
import { CartSummary } from "../components/sales/CartSummary";
import { CompleteSaleDialog } from "../components/sales/CompleteSaleDialog";
import { ProductCatalog } from "../components/sales/ProductCatalog";
import { ProductSearch } from "../components/sales/ProductSearch";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { Card } from "../components/ui/Card";
import { useSales } from "../hooks/useSales";

export function SalesPage() {
  const {
    addProduct,
    cartItems,
    completeSale,
    error,
    isCompleting,
    isLoading,
    reloadProducts,
    removeItem,
    saleError,
    searchTerm,
    setSearchTerm,
    successMessage,
    updateQuantity,
    visibleProducts,
  } = useSales();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  useEffect(() => {
    if (successMessage) {
      searchInputRef.current?.focus();
    }
  }, [successMessage]);

  const handleCompleteSale = async () => {
    const completed = await completeSale();

    if (completed) {
      setIsCompleteDialogOpen(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader eyebrow="Sales" title="Sales" />

      {successMessage ? (
        <Card className="state-panel success-state">{successMessage}</Card>
      ) : null}

      {saleError && !isCompleteDialogOpen ? (
        <Card className="state-panel error-state">{saleError}</Card>
      ) : null}

      <div className="sales-workspace">
        <Card className="sales-panel sales-products-panel">
          <div className="sales-panel-header">
            <div>
              <p className="eyebrow">Products</p>
              <h2>Product Catalog</h2>
            </div>
            {error ? (
              <button
                className="button button-secondary"
                onClick={() => void reloadProducts()}
                type="button"
              >
                Retry
              </button>
            ) : null}
          </div>

          <ProductSearch
            onChange={setSearchTerm}
            ref={searchInputRef}
            value={searchTerm}
          />

          {isLoading ? (
            <MasterDataLoadingState message="Loading products..." />
          ) : error ? (
            <MasterDataErrorState message={error} />
          ) : (
            <ProductCatalog onAddProduct={addProduct} products={visibleProducts} />
          )}
        </Card>

        <Card className="sales-panel">
          <div className="sales-panel-header">
            <div>
              <p className="eyebrow">Current Sale</p>
              <h2>Cart</h2>
            </div>
          </div>

          <Cart
            items={cartItems}
            onRemove={removeItem}
            onUpdateQuantity={updateQuantity}
          />

          <CartSummary
            items={cartItems}
            onComplete={() => setIsCompleteDialogOpen(true)}
          />
        </Card>
      </div>

      {isCompleteDialogOpen ? (
        <CompleteSaleDialog
          error={saleError}
          isSubmitting={isCompleting}
          onCancel={() => setIsCompleteDialogOpen(false)}
          onConfirm={() => void handleCompleteSale()}
        />
      ) : null}
    </section>
  );
}
