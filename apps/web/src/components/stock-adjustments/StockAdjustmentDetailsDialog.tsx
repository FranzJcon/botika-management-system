import { Button } from "../ui/Button";
import { Table } from "../ui/Table";
import type { StockAdjustment } from "../../types/stock-adjustment";

type StockAdjustmentDetailsDialogProps = {
  stockAdjustment: StockAdjustment;
  onClose: () => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));

export function StockAdjustmentDetailsDialog({
  onClose,
  stockAdjustment,
}: StockAdjustmentDetailsDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="stock-adjustment-details-title"
        aria-modal="true"
        className="modal stock-in-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Stock Adjustments</p>
            <h2 id="stock-adjustment-details-title">Adjustment Details</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="detail-grid">
          <div>
            <span>Reason</span>
            <strong>{stockAdjustment.reason}</strong>
          </div>
          <div>
            <span>Adjustment Date</span>
            <strong>{formatDate(stockAdjustment.adjustedAt)}</strong>
          </div>
          <div>
            <span>Adjusted By</span>
            <strong>{stockAdjustment.adjustedByUser?.displayName ?? "Unknown"}</strong>
          </div>
          <div>
            <span>Notes</span>
            <strong>{stockAdjustment.notes || "None"}</strong>
          </div>
        </div>

        <Table className="details-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Batch</th>
              <th>Quantity Change</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {stockAdjustment.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product?.name ?? item.productId}</td>
                <td>{item.inventoryBatch?.lotNumber ?? item.inventoryBatchId ?? "None"}</td>
                <td>{Number(item.quantityChange).toLocaleString()}</td>
                <td>{item.notes || "None"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
