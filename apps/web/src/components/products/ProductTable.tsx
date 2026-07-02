import { MasterDataStatusBadge } from "../master-data/MasterDataStatusBadge";
import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { Button } from "../ui/Button";
import type { Product } from "../../types/product";

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
};

const displayName = (value?: { name: string } | null) => value?.name ?? "None";

export function ProductTable({ products, onArchive, onEdit }: ProductTableProps) {
  const columns: MasterDataColumn<Product>[] = [
    {
      header: "SKU",
      render: (product) => product.sku || "No SKU",
    },
    {
      header: "Product Name",
      render: (product) => <strong>{product.name}</strong>,
    },
    {
      header: "Generic Drug",
      render: (product) => displayName(product.genericDrug),
    },
    {
      header: "Brand",
      render: (product) => displayName(product.brand),
    },
    {
      header: "Category",
      render: (product) => displayName(product.category),
    },
    {
      header: "Dosage Form",
      render: (product) => displayName(product.dosageFormRef),
    },
    {
      header: "Classification",
      render: (product) => displayName(product.classification),
    },
    {
      header: "Status",
      render: (product) => (
        <MasterDataStatusBadge isActive={product.status === "ACTIVE"} />
      ),
    },
    {
      header: "Actions",
      render: (product) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onEdit(product)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => onArchive(product)}>
            Archive
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(product) => product.id}
      items={products}
    />
  );
}
