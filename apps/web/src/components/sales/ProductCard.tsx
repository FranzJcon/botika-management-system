import { Button } from "../ui/Button";
import type { SaleProduct } from "../../types/sale";

type ProductCardProps = {
  product: SaleProduct;
  onAdd: (product: SaleProduct) => void;
};

const quantityOf = (value: string | number) => Number(value);

const formatMoney = (value: string | number | null | undefined) =>
  Number(value ?? 0).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function ProductCard({ onAdd, product }: ProductCardProps) {
  const stock = quantityOf(product.totalQuantityOnHand);
  const isOutOfStock = stock <= 0;

  return (
    <article className={isOutOfStock ? "sale-product out-of-stock" : "sale-product"}>
      <div className="sale-product-main">
        <div>
          <h3>{product.name}</h3>
          <p>SKU: {product.sku || "None"}</p>
          <p className="sale-product-stock">
            {isOutOfStock ? "Out of Stock" : `Stock: ${stock.toLocaleString()}`}
          </p>
        </div>
        <strong>PHP {formatMoney(product.sellingPrice)}</strong>
      </div>
      <Button disabled={isOutOfStock} onClick={() => onAdd(product)}>
        Add
      </Button>
    </article>
  );
}
