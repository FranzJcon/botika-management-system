import { useMemo, useState } from "react";

import { StockAdjustmentDetailsDialog } from "../components/stock-adjustments/StockAdjustmentDetailsDialog";
import { StockAdjustmentForm } from "../components/stock-adjustments/StockAdjustmentForm";
import { StockAdjustmentTable } from "../components/stock-adjustments/StockAdjustmentTable";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const filteredStockAdjustments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return stockAdjustments;
    }

    return stockAdjustments.filter((adjustment) =>
      [
        adjustment.reason,
        adjustment.notes,
        adjustment.adjustedByUser.displayName,
        ...adjustment.items.map((item) => item.product?.name),
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [searchTerm, stockAdjustments]);

  const closeForm = () => {
    setIsFormOpen(false);
    setMutationError(null);
  };

  const handleCreate = async (payload: CreateStockAdjustmentPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      await createStockAdjustment(payload);
      closeForm();
      showToast("success", "Stock adjustment applied");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to apply stock adjustment.";
      setMutationError(message);
      showToast("error", message);
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
      const message = "Unable to load stock adjustment details.";
      setMutationError(message);
      showToast("error", message);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="New Adjustment"
        eyebrow="Inventory"
        onAction={() => {
          setIsFormOpen(true);
        }}
        title="Stock Adjustments"
      />

      {mutationError && !isFormOpen && !selectedAdjustment ? (
        <Card className="state-panel error-state">{mutationError}</Card>
      ) : null}

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search adjustments"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading stock adjustments..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : stockAdjustments.length === 0 ? (
          <MasterDataEmptyState message="No adjustments have been recorded." />
        ) : filteredStockAdjustments.length === 0 ? (
          <MasterDataEmptyState message="No stock adjustments match your search." />
        ) : (
          <StockAdjustmentTable
            onView={(stockAdjustment) => void openDetails(stockAdjustment)}
            stockAdjustments={filteredStockAdjustments}
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
