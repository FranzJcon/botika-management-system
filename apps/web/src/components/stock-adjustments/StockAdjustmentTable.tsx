import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { Button } from "../ui/Button";
import type { StockAdjustment } from "../../types/stock-adjustment";

type StockAdjustmentTableProps = {
  stockAdjustments: StockAdjustment[];
  onView: (stockAdjustment: StockAdjustment) => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));

export function StockAdjustmentTable({
  onView,
  stockAdjustments,
}: StockAdjustmentTableProps) {
  const columns: MasterDataColumn<StockAdjustment>[] = [
    {
      header: "Adjustment Date",
      render: (stockAdjustment) => formatDate(stockAdjustment.adjustedAt),
    },
    {
      header: "Reason",
      render: (stockAdjustment) => stockAdjustment.reason,
    },
    {
      header: "Adjusted By",
      render: (stockAdjustment) =>
        stockAdjustment.adjustedByUser?.displayName ?? "Unknown",
    },
    {
      header: "Items",
      render: (stockAdjustment) => stockAdjustment.items.length,
    },
    {
      header: "Actions",
      render: (stockAdjustment) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onView(stockAdjustment)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(stockAdjustment) => stockAdjustment.id}
      items={stockAdjustments}
    />
  );
}
