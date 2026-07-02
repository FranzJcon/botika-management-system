import { Button } from "../ui/Button";
import { Table } from "../ui/Table";
import type { ProductInventoryDetails } from "../../types/inventory-level";

type ProductBatchDetailsDialogProps = {
  details: ProductInventoryDetails;
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

const formatQuantity = (value: string | number) => Number(value).toLocaleString();

const formatMoney = (value: string | number | null) =>
  value === null
    ? "None"
    : Number(value).toLocaleString("en", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const relatedName = (value: { name: string } | null) => value?.name ?? "None";

export function ProductBatchDetailsDialog({
  details,
  onClose,
}: ProductBatchDetailsDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="product-batch-details-title"
        aria-modal="true"
        className="modal stock-in-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Inventory</p>
            <h2 id="product-batch-details-title">Product Batches</h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="detail-grid">
          <div>
            <span>Product</span>
            <strong>{details.product.name}</strong>
          </div>
          <div>
            <span>SKU</span>
            <strong>{details.product.sku || "None"}</strong>
          </div>
          <div>
            <span>Total Quantity On Hand</span>
            <strong>{formatQuantity(details.totalQuantityOnHand)}</strong>
          </div>
          <div>
            <span>Brand</span>
            <strong>{relatedName(details.product.brand)}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{relatedName(details.product.category)}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{details.product.status}</strong>
          </div>
        </div>

        {details.batches.length === 0 ? (
          <div className="state-panel">No available batches for this product.</div>
        ) : (
          <Table className="details-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Remaining Quantity</th>
                <th>Initial Quantity</th>
                <th>Buying Price</th>
                <th>Selling Price</th>
                <th>Received Date</th>
                <th>Expiration Date</th>
                <th>Lot Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {details.batches.map((batch) => (
                <tr key={batch.id}>
                  <td>{batch.id}</td>
                  <td>{formatQuantity(batch.remainingQuantity)}</td>
                  <td>{formatQuantity(batch.initialQuantity)}</td>
                  <td>{formatMoney(batch.buyingPrice)}</td>
                  <td>{formatMoney(batch.sellingPrice)}</td>
                  <td>{formatDate(batch.receivedDate)}</td>
                  <td>{formatDate(batch.expirationDate)}</td>
                  <td>{batch.lotNumber || "None"}</td>
                  <td>
                    <span className="status-pill active">{batch.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
