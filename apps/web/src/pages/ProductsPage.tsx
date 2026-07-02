import { useState } from "react";

import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { DeleteProductDialog } from "../components/products/DeleteProductDialog";
import { ProductForm } from "../components/products/ProductForm";
import { ProductTable } from "../components/products/ProductTable";
import { Card } from "../components/ui/Card";
import { useProducts } from "../hooks/useProducts";
import type { Product, ProductPayload } from "../types/product";

type FormMode = "create" | "edit";

export function ProductsPage() {
  const {
    archiveProduct,
    createProduct,
    error,
    isLoading,
    lookups,
    products,
    reload,
    updateProduct,
  } = useProducts();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateForm = () => {
    setMutationError(null);
    setSelectedProduct(null);
    setFormMode("create");
  };

  const openEditForm = (product: Product) => {
    setMutationError(null);
    setSelectedProduct(product);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedProduct(null);
    setMutationError(null);
  };

  const handleSubmit = async (payload: ProductPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      if (formMode === "edit" && selectedProduct) {
        await updateProduct(selectedProduct.id, payload);
      } else {
        const { status: _status, ...createPayload } = payload;
        await createProduct(createPayload);
      }

      closeForm();
    } catch {
      setMutationError("Unable to save product. Please check the details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchiveDialog = (product: Product) => {
    setMutationError(null);
    setProductToArchive(product);
  };

  const closeArchiveDialog = () => {
    setProductToArchive(null);
    setMutationError(null);
  };

  const handleArchive = async () => {
    if (!productToArchive) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await archiveProduct(productToArchive.id);
      closeArchiveDialog();
    } catch {
      setMutationError("Unable to archive product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Product"
        onAction={openCreateForm}
        title="Products"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          searchPlaceholder="Search products"
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading products..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : products.length === 0 ? (
          <MasterDataEmptyState message="No products yet. Create the first catalog product." />
        ) : (
          <ProductTable
            onArchive={openArchiveDialog}
            onEdit={openEditForm}
            products={products}
          />
        )}
      </Card>

      {formMode ? (
        <ProductForm
          error={mutationError}
          isSubmitting={isSubmitting}
          lookups={lookups}
          onClose={closeForm}
          onSubmit={handleSubmit}
          product={selectedProduct}
        />
      ) : null}

      {productToArchive ? (
        <DeleteProductDialog
          error={mutationError}
          isSubmitting={isSubmitting}
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
          product={productToArchive}
        />
      ) : null}
    </section>
  );
}
