import { CartItem } from "./CartItem";
import type { CartItem as CartItemType } from "../../types/sale";

type CartProps = {
  items: CartItemType[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
};

export function Cart({ items, onRemove, onUpdateQuantity }: CartProps) {
  if (items.length === 0) {
    return <div className="state-panel">No products in the current sale.</div>;
  }

  return (
    <div className="cart-list">
      {items.map((item) => (
        <CartItem
          item={item}
          key={item.product.id}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
        />
      ))}
    </div>
  );
}
