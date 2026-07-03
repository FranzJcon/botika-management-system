import { useMemo, useState } from "react";

import { ExpiringSoonTable } from "../components/inventory-levels/ExpiringSoonTable";
import { InventoryLevelsTable } from "../components/inventory-levels/InventoryLevelsTable";
import { LowStockTable } from "../components/inventory-levels/LowStockTable";
import { ProductBatchDetailsDialog } from "../components/inventory-levels/ProductBatchDetailsDialog";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
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
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const matchesInventoryQuery = (
    item: Pick<InventoryLevel, "name" | "sku" | "brand" | "category">,
  ) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [item.name, item.sku, item.brand?.name, item.category?.name]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query));
  };

  const filteredInventoryLevels = useMemo(
    () => inventoryLevels.filter(matchesInventoryQuery),
    [inventoryLevels, searchTerm],
  );
  const filteredLowStockLevels = useMemo(
    () => lowStockLevels.filter(matchesInventoryQuery),
    [lowStockLevels, searchTerm],
  );
  const filteredExpiringSoonBatches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return expiringSoonBatches;
    }

    return expiringSoonBatches.filter((batch) =>
      [batch.product.name, batch.product.sku, batch.lotNumber]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [expiringSoonBatches, searchTerm]);

  const openBatchDetails = async (inventoryLevel: InventoryLevel) => {
    setDetailsError(null);
    setIsLoadingDetails(true);

    try {
      const details = await getProductInventoryDetails(inventoryLevel.id);
      setSelectedDetails(details);
    } catch {
      const message = "Unable to load product batches. Please try again.";
      setDetailsError(message);
      showToast("error", message);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const renderActiveTable = () => {
    if (activeTab === "low") {
      return lowStockLevels.length === 0 ? (
        <MasterDataEmptyState message="No low-stock products right now." />
      ) : filteredLowStockLevels.length === 0 ? (
        <MasterDataEmptyState message="No low-stock products match your search." />
      ) : (
        <LowStockTable inventoryLevels={filteredLowStockLevels} />
      );
    }

    if (activeTab === "expiring") {
      return expiringSoonBatches.length === 0 ? (
        <MasterDataEmptyState message="No batches expiring soon." />
      ) : filteredExpiringSoonBatches.length === 0 ? (
        <MasterDataEmptyState message="No expiring batches match your search." />
      ) : (
        <ExpiringSoonTable batches={filteredExpiringSoonBatches} />
      );
    }

    return inventoryLevels.length === 0 ? (
      <MasterDataEmptyState message="No inventory available. Receive inventory through Stock In." />
    ) : filteredInventoryLevels.length === 0 ? (
      <MasterDataEmptyState message="No inventory items match your search." />
    ) : (
      <InventoryLevelsTable
        inventoryLevels={filteredInventoryLevels}
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

        <MasterDataToolbar
          onRetry={() => void reload()}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search inventory"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

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
