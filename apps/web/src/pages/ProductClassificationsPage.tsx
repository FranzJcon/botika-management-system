import { useMemo, useState } from "react";

import { ProductClassificationForm } from "../components/product-classifications/ProductClassificationForm";
import { ProductClassificationTable } from "../components/product-classifications/ProductClassificationTable";
import { DeleteConfirmationDialog } from "../components/master-data/DeleteConfirmationDialog";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
import { useProductClassifications } from "../hooks/useProductClassifications";
import type {
  ProductClassification,
  ProductClassificationPayload,
} from "../types/product-classification";

type FormMode = "create" | "edit";

export function ProductClassificationsPage() {
  const {
    archiveProductClassification,
    createProductClassification,
    error,
    isLoading,
    productClassifications,
    reload,
    updateProductClassification,
  } = useProductClassifications();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedProductClassification, setSelectedProductClassification] =
    useState<ProductClassification | null>(null);
  const [productClassificationToArchive, setProductClassificationToArchive] =
    useState<ProductClassification | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const filteredProductClassifications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return query
      ? productClassifications.filter((classification) =>
          classification.name.toLowerCase().includes(query),
        )
      : productClassifications;
  }, [productClassifications, searchTerm]);

  const openCreateForm = () => {
    setMutationError(null);
    setSelectedProductClassification(null);
    setFormMode("create");
  };

  const openEditForm = (productClassification: ProductClassification) => {
    setMutationError(null);
    setSelectedProductClassification(productClassification);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedProductClassification(null);
    setMutationError(null);
  };

  const handleSubmit = async (payload: ProductClassificationPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      if (formMode === "edit" && selectedProductClassification) {
        await updateProductClassification(selectedProductClassification.id, payload);
        showToast("success", "Product classification updated");
      } else {
        await createProductClassification(payload);
        showToast("success", "Product classification created");
      }

      closeForm();
    } catch {
      const message =
        "Unable to save product classification. Please check the details.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchiveDialog = (
    productClassification: ProductClassification,
  ) => {
    setMutationError(null);
    setProductClassificationToArchive(productClassification);
  };

  const closeArchiveDialog = () => {
    setProductClassificationToArchive(null);
    setMutationError(null);
  };

  const handleArchive = async () => {
    if (!productClassificationToArchive) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await archiveProductClassification(productClassificationToArchive.id);
      closeArchiveDialog();
      showToast("success", "Product classification archived");
    } catch {
      const message =
        "Unable to archive product classification. Please try again.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Product Classification"
        onAction={openCreateForm}
        title="Product Classifications"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search product classifications"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading product classifications..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : productClassifications.length === 0 ? (
          <MasterDataEmptyState message="No product classifications yet. Create the first classification." />
        ) : filteredProductClassifications.length === 0 ? (
          <MasterDataEmptyState message="No product classifications match your search." />
        ) : (
          <ProductClassificationTable
            onArchive={openArchiveDialog}
            onEdit={openEditForm}
            productClassifications={filteredProductClassifications}
          />
        )}
      </Card>

      {formMode ? (
        <ProductClassificationForm
          error={mutationError}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
          productClassification={selectedProductClassification}
        />
      ) : null}

      {productClassificationToArchive ? (
        <DeleteConfirmationDialog
          confirmLabel="Archive Product Classification"
          error={mutationError}
          loading={isSubmitting}
          message="Products assigned to this classification will not be modified."
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
          targetDescription={productClassificationToArchive.description}
          targetName={productClassificationToArchive.name}
          title="Archive this product classification?"
        />
      ) : null}
    </section>
  );
}
