import { Button } from "../ui/Button";
import type { StockIn, StockInItem } from "../../types/stock-in";

type StockInDetailsDialogProps = {
  stockIn: StockIn;
  onClose: () => void;
};

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(value))
    : "None";

const formatNumber = (value: string | number | null) =>
  value === null ? "None" : Number(value).toLocaleString();

const productName = (item: StockInItem) => item.product?.name ?? item.productId;

export function StockInDetailsDialog({
  onClose,
  stockIn,
}: StockInDetailsDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="stock-in-details-title"
        aria-modal="true"
        className="modal stock-in-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Stock In</p>
            <h2 id="stock-in-details-title">Stock In Details</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="detail-grid">
          <div>
            <span>Received Date</span>
            <strong>{formatDate(stockIn.receivedDate)}</strong>
          </div>
          <div>
            <span>Reference Type</span>
            <strong>{stockIn.referenceType ?? "None"}</strong>
          </div>
          <div>
            <span>Reference Number</span>
            <strong>{stockIn.referenceNumber || "None"}</strong>
          </div>
          <div>
            <span>Source Type</span>
            <strong>{stockIn.sourceType}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{stockIn.status}</strong>
          </div>
          <div>
            <span>Notes</span>
            <strong>{stockIn.notes || "None"}</strong>
          </div>
        </div>

        <div className="details-table-wrap">
          <table className="table details-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Buying Price</th>
                <th>Selling Price</th>
                <th>Expiration Date</th>
                <th>Lot Number</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {stockIn.items.map((item) => (
                <tr key={item.id}>
                  <td>{productName(item)}</td>
                  <td>{formatNumber(item.quantity)}</td>
                  <td>{formatNumber(item.buyingPrice)}</td>
                  <td>{formatNumber(item.sellingPrice)}</td>
                  <td>{formatDate(item.expirationDate)}</td>
                  <td>{item.lotNumber || "None"}</td>
                  <td>{item.notes || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
