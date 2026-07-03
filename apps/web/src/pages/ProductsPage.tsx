import { useMemo, useState } from "react";

import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { DeleteProductDialog } from "../components/products/DeleteProductDialog";
import { ProductForm } from "../components/products/ProductForm";
import { ProductTable } from "../components/products/ProductTable";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
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
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.sku,
        product.brand?.name,
        product.genericDrug?.name,
        product.category?.name,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [products, searchTerm]);

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
        showToast("success", "Product updated");
      } else {
        const { status: _status, ...createPayload } = payload;
        await createProduct(createPayload);
        showToast("success", "Product created");
      }

      closeForm();
    } catch {
      const message = "Unable to save product. Please check the details.";
      setMutationError(message);
      showToast("error", message);
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
      showToast("success", "Product archived");
    } catch {
      const message = "Unable to archive product. Please try again.";
      setMutationError(message);
      showToast("error", message);
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
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search products"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading products..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : products.length === 0 ? (
          <MasterDataEmptyState message="No products yet. Create your first product or add one during Stock In." />
        ) : filteredProducts.length === 0 ? (
          <MasterDataEmptyState message="No products match your search." />
        ) : (
          <ProductTable
            onArchive={openArchiveDialog}
            onEdit={openEditForm}
            products={filteredProducts}
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
