import { useState } from "react";

import { ExpiringSoonTable } from "../components/inventory-levels/ExpiringSoonTable";
import { InventoryLevelsTable } from "../components/inventory-levels/InventoryLevelsTable";
import { LowStockTable } from "../components/inventory-levels/LowStockTable";
import { ProductBatchDetailsDialog } from "../components/inventory-levels/ProductBatchDetailsDialog";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { Card } from "../components/ui/Card";
import { useInventoryLevels } from "../hooks/useInventoryLevels";
import type {
  InventoryLevel,
  ProductInventoryDetails,
} from "../types/inventory-level";

type InventoryTab = "all" | "low" | "expiring";

const tabLabels: Record<InventoryTab, string> = {
  all: "All Stock",
  low: "Low Stock",
  expiring: "Expiring Soon",
};

export function InventoryLevelsPage() {
  const {
    error,
    expiringSoonBatches,
    getProductInventoryDetails,
    inventoryLevels,
    isLoading,
    lowStockLevels,
    reload,
  } = useInventoryLevels();
  const [activeTab, setActiveTab] = useState<InventoryTab>("all");
  const [selectedDetails, setSelectedDetails] =
    useState<ProductInventoryDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const openBatchDetails = async (inventoryLevel: InventoryLevel) => {
    setDetailsError(null);
    setIsLoadingDetails(true);

    try {
      const details = await getProductInventoryDetails(inventoryLevel.id);
      setSelectedDetails(details);
    } catch {
      setDetailsError("Unable to load product batches. Please try again.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const renderActiveTable = () => {
    if (activeTab === "low") {
      return lowStockLevels.length === 0 ? (
        <MasterDataEmptyState message="No low-stock products right now." />
      ) : (
        <LowStockTable inventoryLevels={lowStockLevels} />
      );
    }

    if (activeTab === "expiring") {
      return expiringSoonBatches.length === 0 ? (
        <MasterDataEmptyState message="No batches expiring soon." />
      ) : (
        <ExpiringSoonTable batches={expiringSoonBatches} />
      );
    }

    return inventoryLevels.length === 0 ? (
      <MasterDataEmptyState message="No inventory levels found." />
    ) : (
      <InventoryLevelsTable
        inventoryLevels={inventoryLevels}
        onViewBatches={(item) => void openBatchDetails(item)}
      />
    );
  };

  return (
    <section className="page">
      <MasterDataPageHeader eyebrow="Inventory" title="Inventory Levels" />

      <Card className="content-card">
        <div className="inventory-tabs">
          {(Object.keys(tabLabels) as InventoryTab[]).map((tab) => (
            <button
              className={
                activeTab === tab
                  ? "inventory-tab inventory-tab-active"
                  : "inventory-tab"
              }
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tabLabels[tab]}
            </button>
          ))}
          {error ? (
            <button
              className="button button-secondary inventory-retry"
              onClick={() => void reload()}
              type="button"
            >
              Retry
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <MasterDataLoadingState message="Loading inventory levels..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : (
          renderActiveTable()
        )}
      </Card>

      {isLoadingDetails ? (
        <Card className="state-panel">Loading product batches...</Card>
      ) : null}

      {detailsError ? (
        <Card className="state-panel error-state">{detailsError}</Card>
      ) : null}

      {selectedDetails ? (
        <ProductBatchDetailsDialog
          details={selectedDetails}
          onClose={() => setSelectedDetails(null)}
        />
      ) : null}
    </section>
  );
}
