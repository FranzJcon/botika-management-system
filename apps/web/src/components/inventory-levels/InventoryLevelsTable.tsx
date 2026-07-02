import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { Button } from "../ui/Button";
import type { InventoryLevel } from "../../types/inventory-level";

type InventoryLevelsTableProps = {
  inventoryLevels: InventoryLevel[];
  showActions?: boolean;
  onViewBatches?: (inventoryLevel: InventoryLevel) => void;
};

const formatQuantity = (value: string | number) => Number(value).toLocaleString();

const relatedName = (value: { name: string } | null) => value?.name ?? "None";

export function InventoryLevelsTable({
  inventoryLevels,
  onViewBatches,
  showActions = true,
}: InventoryLevelsTableProps) {
  const columns: MasterDataColumn<InventoryLevel>[] = [
    {
      header: "Product Name",
      render: (item) => item.name,
    },
    {
      header: "SKU",
      render: (item) => item.sku || "None",
    },
    {
      header: "Brand",
      render: (item) => relatedName(item.brand),
    },
    {
      header: "Category",
      render: (item) => relatedName(item.category),
    },
    {
      header: "Total Quantity On Hand",
      render: (item) => formatQuantity(item.totalQuantityOnHand),
    },
    {
      header: "Reorder Level",
      render: (item) => formatQuantity(item.reorderLevel),
    },
    {
      header: "Status",
      render: (item) => (
        <span
          className={
            item.status === "ACTIVE" ? "status-pill active" : "status-pill archived"
          }
        >
          {item.status}
        </span>
      ),
    },
  ];

  if (showActions) {
    columns.push({
      header: "Actions",
      render: (item) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onViewBatches?.(item)}>
            View Batches
          </Button>
        </div>
      ),
    });
  }

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(item) => item.id}
      items={inventoryLevels}
    />
  );
}
