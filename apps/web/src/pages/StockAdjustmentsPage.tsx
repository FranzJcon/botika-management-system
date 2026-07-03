import { useState } from "react";

import { StockAdjustmentDetailsDialog } from "../components/stock-adjustments/StockAdjustmentDetailsDialog";
import { StockAdjustmentForm } from "../components/stock-adjustments/StockAdjustmentForm";
import { StockAdjustmentTable } from "../components/stock-adjustments/StockAdjustmentTable";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useStockAdjustments } from "../hooks/useStockAdjustments";
import type {
  CreateStockAdjustmentPayload,
  StockAdjustment,
} from "../types/stock-adjustment";

export function StockAdjustmentsPage() {
  const {
    createStockAdjustment,
    error,
    getProductInventoryDetails,
    getStockAdjustment,
    inventoryLevels,
    isLoading,
    reload,
    stockAdjustments,
  } = useStockAdjustments();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<StockAdjustment | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeForm = () => {
    setIsFormOpen(false);
    setMutationError(null);
  };

  const handleCreate = async (payload: CreateStockAdjustmentPayload) => {
    setIsSubmitting(true);
    setMutationError(null);
    setSuccessMessage(null);

    try {
      await createStockAdjustment(payload);
      closeForm();
      setSuccessMessage("Stock adjustment applied successfully.");
    } catch (caughtError) {
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to apply stock adjustment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetails = async (stockAdjustment: StockAdjustment) => {
    setMutationError(null);

    try {
      const detail = await getStockAdjustment(stockAdjustment.id);
      setSelectedAdjustment(detail);
    } catch {
      setMutationError("Unable to load stock adjustment details.");
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="New Adjustment"
        eyebrow="Inventory"
        onAction={() => {
          setSuccessMessage(null);
          setIsFormOpen(true);
        }}
        title="Stock Adjustments"
      />

      {successMessage ? (
        <Card className="state-panel success-state">{successMessage}</Card>
      ) : null}

      {mutationError && !isFormOpen && !selectedAdjustment ? (
        <Card className="state-panel error-state">{mutationError}</Card>
      ) : null}

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          searchPlaceholder="Search adjustments"
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading stock adjustments..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : stockAdjustments.length === 0 ? (
          <MasterDataEmptyState message="No stock adjustments yet." />
        ) : (
          <StockAdjustmentTable
            onView={(stockAdjustment) => void openDetails(stockAdjustment)}
            stockAdjustments={stockAdjustments}
          />
        )}
      </Card>

      {isFormOpen ? (
        <StockAdjustmentForm
          error={mutationError}
          getProductInventoryDetails={getProductInventoryDetails}
          inventoryLevels={inventoryLevels}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleCreate}
        />
      ) : null}

      {selectedAdjustment ? (
        <StockAdjustmentDetailsDialog
          onClose={() => setSelectedAdjustment(null)}
          stockAdjustment={selectedAdjustment}
        />
      ) : null}
    </section>
  );
}
