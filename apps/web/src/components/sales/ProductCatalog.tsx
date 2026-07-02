import { ProductCard } from "./ProductCard";
import type { SaleProduct } from "../../types/sale";

type ProductCatalogProps = {
  products: SaleProduct[];
  onAddProduct: (product: SaleProduct) => void;
};

export function ProductCatalog({ onAddProduct, products }: ProductCatalogProps) {
  if (products.length === 0) {
    return <div className="state-panel">No matching products found.</div>;
  }

  return (
    <div className="sale-catalog">
      {products.map((product) => (
        <ProductCard key={product.id} onAdd={onAddProduct} product={product} />
      ))}
    </div>
  );
}
