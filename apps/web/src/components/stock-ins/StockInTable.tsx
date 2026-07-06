import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { Button } from "../ui/Button";
import type { StockIn } from "../../types/stock-in";

type StockInTableProps = {
  stockIns: StockIn[];
  onView: (stockIn: StockIn) => void;
  onEdit: (stockIn: StockIn) => void;
  onDelete: (stockIn: StockIn) => void;
  onPost: (stockIn: StockIn) => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));

export function StockInTable({
  onDelete,
  onEdit,
  onPost,
  onView,
  stockIns,
}: StockInTableProps) {
  const columns: MasterDataColumn<StockIn>[] = [
    {
      header: "Received Date",
      render: (stockIn) => formatDate(stockIn.receivedDate),
    },
    {
      header: "Reference Type",
      render: (stockIn) => stockIn.referenceType ?? "None",
    },
    {
      header: "Reference Number",
      render: (stockIn) => stockIn.referenceNumber || "None",
    },
    {
      header: "Status",
      render: (stockIn) => (
        <span
          className={
            stockIn.status === "POSTED" ? "status-pill active" : "status-pill draft"
          }
        >
          {stockIn.status}
        </span>
      ),
    },
    {
      header: "Items",
      render: (stockIn) => stockIn.items.length,
    },
    {
      header: "Actions",
      render: (stockIn) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onView(stockIn)}>
            View
          </Button>
          {stockIn.status === "DRAFT" ? (
            <>
              <Button variant="secondary" onClick={() => onEdit(stockIn)}>
                Edit
              </Button>
              <Button variant="secondary" onClick={() => onDelete(stockIn)}>
                Delete
              </Button>
              <Button variant="secondary" onClick={() => onPost(stockIn)}>
                Finalize Stock In
              </Button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(stockIn) => stockIn.id}
      items={stockIns}
    />
  );
}
