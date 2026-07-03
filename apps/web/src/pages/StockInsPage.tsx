import { useState } from "react";

import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { PostStockInDialog } from "../components/stock-ins/PostStockInDialog";
import { StockInDetailsDialog } from "../components/stock-ins/StockInDetailsDialog";
import { StockInForm } from "../components/stock-ins/StockInForm";
import { StockInTable } from "../components/stock-ins/StockInTable";
import { Card } from "../components/ui/Card";
import { useStockIns } from "../hooks/useStockIns";
import type { CreateStockInPayload, StockIn } from "../types/stock-in";

export function StockInsPage() {
  const {
    createStockIn,
    createProduct,
    categories,
    error,
    getStockIn,
    isLoading,
    postStockIn,
    products,
    reload,
    stockIns,
  } = useStockIns();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
  const [stockInToPost, setStockInToPost] = useState<StockIn | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeForm = () => {
    setIsFormOpen(false);
    setMutationError(null);
  };

  const handleCreate = async (payload: CreateStockInPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      await createStockIn(payload);
      closeForm();
    } catch {
      setMutationError("Unable to save stock in draft. Please check the details.");
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
      setMutationError("Unable to load stock in details. Please try again.");
    }
  };

  const closeDetails = () => {
    setSelectedStockIn(null);
    setMutationError(null);
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
    } catch {
      setMutationError("Unable to post stock in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Stock In"
        onAction={() => setIsFormOpen(true)}
        title="Stock In"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          searchPlaceholder="Search stock-ins"
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading stock-ins..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : stockIns.length === 0 ? (
          <MasterDataEmptyState message="No stock-ins yet. Create the first receiving draft." />
        ) : (
          <StockInTable
            onPost={openPostDialog}
            onView={(stockIn) => void openDetails(stockIn)}
            stockIns={stockIns}
          />
        )}
      </Card>

      {mutationError && !isFormOpen && !selectedStockIn && !stockInToPost ? (
        <Card className="state-panel error-state">{mutationError}</Card>
      ) : null}

      {isFormOpen ? (
        <StockInForm
          error={mutationError}
          categories={categories}
          isSubmitting={isSubmitting}
          onCreateProduct={createProduct}
          onClose={closeForm}
          onSubmit={handleCreate}
          products={products}
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
    </section>
  );
}
