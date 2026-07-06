import { useMemo, useState } from "react";

import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { DeleteStockInDraftDialog } from "../components/stock-ins/DeleteStockInDraftDialog";
import { PostStockInDialog } from "../components/stock-ins/PostStockInDialog";
import { StockInDetailsDialog } from "../components/stock-ins/StockInDetailsDialog";
import { StockInForm } from "../components/stock-ins/StockInForm";
import { StockInTable } from "../components/stock-ins/StockInTable";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
import { useStockIns } from "../hooks/useStockIns";
import type { CreateStockInPayload, StockIn } from "../types/stock-in";

export function StockInsPage() {
  const {
    createStockIn,
    createProduct,
    categories,
    deleteStockIn,
    error,
    getStockIn,
    isLoading,
    postStockIn,
    products,
    reload,
    stockIns,
    updateStockIn,
  } = useStockIns();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStockIn, setEditingStockIn] = useState<StockIn | null>(null);
  const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
  const [stockInToDelete, setStockInToDelete] = useState<StockIn | null>(null);
  const [stockInToPost, setStockInToPost] = useState<StockIn | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const filteredStockIns = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return stockIns;
    }

    return stockIns.filter((stockIn) =>
      [
        stockIn.referenceNumber,
        stockIn.referenceType,
        stockIn.sourceType,
        stockIn.status,
        stockIn.notes,
        ...stockIn.items.map((item) => item.product?.name),
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [searchTerm, stockIns]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStockIn(null);
    setMutationError(null);
  };

  const openCreateForm = () => {
    setMutationError(null);
    setEditingStockIn(null);
    setIsFormOpen(true);
  };

  const openEditForm = async (stockIn: StockIn) => {
    setMutationError(null);

    try {
      const detail = await getStockIn(stockIn.id);
      setEditingStockIn(detail);
      setIsFormOpen(true);
    } catch {
      const message = "Unable to load stock in draft. Please try again.";
      setMutationError(message);
      showToast("error", message);
    }
  };

  const handleSaveDraft = async (payload: CreateStockInPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      if (editingStockIn) {
        await updateStockIn(editingStockIn.id, payload);
        showToast("success", "Draft updated successfully.");
      } else {
        await createStockIn(payload);
        showToast("success", "Stock in draft saved");
      }

      closeForm();
    } catch {
      const message = "Unable to save stock in draft. Please check the details.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetails = async (stockIn: StockIn) => {
    setMutationError(null);

    try {
      const detail = await getStockIn(stockIn.id);
      setSelectedStockIn(detail);
    } catch {
      const message = "Unable to load stock in details. Please try again.";
      setMutationError(message);
      showToast("error", message);
    }
  };

  const closeDetails = () => {
    setSelectedStockIn(null);
    setMutationError(null);
  };

  const openDeleteDialog = (stockIn: StockIn) => {
    setMutationError(null);
    setStockInToDelete(stockIn);
  };

  const closeDeleteDialog = () => {
    setStockInToDelete(null);
    setMutationError(null);
  };

  const handleDeleteDraft = async () => {
    if (!stockInToDelete) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await deleteStockIn(stockInToDelete.id);
      closeDeleteDialog();
      showToast("success", "Draft deleted successfully.");
    } catch {
      const message = "Unable to delete stock in draft. Please try again.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPostDialog = (stockIn: StockIn) => {
    setMutationError(null);
    setStockInToPost(stockIn);
  };

  const closePostDialog = () => {
    setStockInToPost(null);
    setMutationError(null);
  };

  const handlePost = async () => {
    if (!stockInToPost) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await postStockIn(stockInToPost.id);
      closePostDialog();
      showToast("success", "Stock In finalized successfully.");
    } catch {
      const message = "Unable to finalize stock in. Please try again.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Stock In"
        onAction={openCreateForm}
        title="Stock In"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search stock-ins"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading stock-ins..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : stockIns.length === 0 ? (
          <MasterDataEmptyState message="No stock-ins yet. Receive inventory by creating the first draft." />
        ) : filteredStockIns.length === 0 ? (
          <MasterDataEmptyState message="No stock-ins match your search." />
        ) : (
          <StockInTable
            onDelete={openDeleteDialog}
            onEdit={(stockIn) => void openEditForm(stockIn)}
            onPost={openPostDialog}
            onView={(stockIn) => void openDetails(stockIn)}
            stockIns={filteredStockIns}
          />
        )}
      </Card>

      {mutationError &&
      !isFormOpen &&
      !selectedStockIn &&
      !stockInToDelete &&
      !stockInToPost ? (
        <Card className="state-panel error-state">{mutationError}</Card>
      ) : null}

      {isFormOpen ? (
        <StockInForm
          error={mutationError}
          categories={categories}
          isSubmitting={isSubmitting}
          onCreateProduct={createProduct}
          onClose={closeForm}
          onSubmit={handleSaveDraft}
          products={products}
          stockIn={editingStockIn}
        />
      ) : null}

      {selectedStockIn ? (
        <StockInDetailsDialog onClose={closeDetails} stockIn={selectedStockIn} />
      ) : null}

      {stockInToPost ? (
        <PostStockInDialog
          error={mutationError}
          isSubmitting={isSubmitting}
          onCancel={closePostDialog}
          onConfirm={handlePost}
          stockIn={stockInToPost}
        />
      ) : null}

      {stockInToDelete ? (
        <DeleteStockInDraftDialog
          error={mutationError}
          isSubmitting={isSubmitting}
          onCancel={closeDeleteDialog}
          onConfirm={handleDeleteDraft}
          stockIn={stockInToDelete}
        />
      ) : null}
    </section>
  );
}
