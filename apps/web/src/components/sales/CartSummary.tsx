import { Button } from "../ui/Button";
import type { CartItem } from "../../types/sale";

type CartSummaryProps = {
  items: CartItem[];
  onComplete: () => void;
};

const formatMoney = (value: number) =>
  value.toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function CartSummary({ items, onComplete }: CartSummaryProps) {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const grandTotal = items.reduce(
    (total, item) => total + item.quantity * item.sellingPrice,
    0,
  );

  return (
    <div className="cart-summary">
      <div>
        <span>Items</span>
        <strong>{totalItems}</strong>
      </div>
      <div>
        <span>Grand Total</span>
        <strong>PHP {formatMoney(grandTotal)}</strong>
      </div>
      <Button disabled={items.length === 0} onClick={onComplete}>
        Complete Sale
      </Button>
    </div>
  );
}
