import { Button } from "../ui/Button";
import type { CartItem as CartItemType } from "../../types/sale";

type CartItemProps = {
  item: CartItemType;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
};

const quantityOf = (value: string | number) => Number(value);

const formatMoney = (value: number) =>
  value.toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: CartItemProps) {
  const availableStock = quantityOf(item.product.totalQuantityOnHand);
  const lineTotal = item.quantity * item.sellingPrice;
  const canDecrease = item.quantity > 1;
  const canIncrease = item.quantity < availableStock;

  return (
    <div className="cart-item">
      <div className="cart-item-main">
        <strong>{item.product.name}</strong>
        <span>PHP {formatMoney(item.sellingPrice)}</span>
      </div>
      <div className="cart-quantity">
        <Button
          disabled={!canDecrease}
          variant="secondary"
          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
        >
          -
        </Button>
        <input
          aria-label={`Quantity for ${item.product.name}`}
          className="cart-quantity-input"
          min={1}
          max={availableStock}
          onChange={(event) =>
            onUpdateQuantity(item.product.id, Number(event.target.value))
          }
          type="number"
          value={item.quantity}
        />
        <Button
          disabled={!canIncrease}
          variant="secondary"
          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
        >
          +
        </Button>
      </div>
      <strong className="cart-line-total">PHP {formatMoney(lineTotal)}</strong>
      <Button variant="secondary" onClick={() => onRemove(item.product.id)}>
        Remove
      </Button>
    </div>
  );
}
