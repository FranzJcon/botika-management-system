import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import type { Product } from "../../types/product";
import type { StockInItemFormValues } from "../../types/stock-in";

type StockInItemsTableProps = {
  items: StockInItemFormValues[];
  products: Product[];
  onChange: (
    id: string,
    field: keyof StockInItemFormValues,
    value: string,
  ) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
};

export function StockInItemsTable({
  items,
  onAdd,
  onChange,
  onRemove,
  products,
}: StockInItemsTableProps) {
  const activeProducts = products.filter((product) => product.status === "ACTIVE");

  return (
    <div className="stock-items">
      <div className="stock-items-header">
        <h3>Items</h3>
        <Button variant="secondary" onClick={onAdd}>
          Add Row
        </Button>
      </div>

      <div className="stock-items-list">
        {items.map((item, index) => (
          <div className="stock-item-card" key={item.id}>
            <div className="stock-item-title">
              <strong>Item {index + 1}</strong>
              {items.length > 1 ? (
                <Button variant="secondary" onClick={() => onRemove(item.id)}>
                  Remove
                </Button>
              ) : null}
            </div>

            <div className="stock-item-grid">
              <Select
                label="Product"
                onChange={(event) =>
                  onChange(item.id, "productId", event.target.value)
                }
                required
                value={item.productId}
              >
                <option value="">Select product</option>
                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Quantity"
                min="0.001"
                onChange={(event) =>
                  onChange(item.id, "quantity", event.target.value)
                }
                required
                step="0.001"
                type="number"
                value={item.quantity}
              />
              <Input
                label="Buying Price"
                min="0"
                onChange={(event) =>
                  onChange(item.id, "buyingPrice", event.target.value)
                }
                required
                step="0.01"
                type="number"
                value={item.buyingPrice}
              />
              <Input
                label="Selling Price"
                min="0"
                onChange={(event) =>
                  onChange(item.id, "sellingPrice", event.target.value)
                }
                step="0.01"
                type="number"
                value={item.sellingPrice}
              />
              <Input
                label="Expiration Date"
                onChange={(event) =>
                  onChange(item.id, "expirationDate", event.target.value)
                }
                type="date"
                value={item.expirationDate}
              />
              <Input
                label="Lot Number"
                onChange={(event) =>
                  onChange(item.id, "lotNumber", event.target.value)
                }
                value={item.lotNumber}
              />
            </div>

            <Textarea
              label="Notes"
              onChange={(event) => onChange(item.id, "notes", event.target.value)}
              value={item.notes}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
