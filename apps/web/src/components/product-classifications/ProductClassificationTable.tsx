import { Button } from "../ui/Button";
import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { MasterDataStatusBadge } from "../master-data/MasterDataStatusBadge";
import type { ProductClassification } from "../../types/product-classification";

type ProductClassificationTableProps = {
  productClassifications: ProductClassification[];
  onEdit: (productClassification: ProductClassification) => void;
  onArchive: (productClassification: ProductClassification) => void;
};

export function ProductClassificationTable({
  productClassifications,
  onArchive,
  onEdit,
}: ProductClassificationTableProps) {
  const columns: MasterDataColumn<ProductClassification>[] = [
    {
      header: "Name",
      render: (productClassification) => (
        <strong>{productClassification.name}</strong>
      ),
    },
    {
      header: "Description",
      render: (productClassification) =>
        productClassification.description || "No description",
    },
    {
      header: "Status",
      render: (productClassification) => (
        <MasterDataStatusBadge isActive={productClassification.isActive} />
      ),
    },
    {
      header: "Actions",
      render: (productClassification) => (
        <div className="table-actions">
          <Button
            variant="secondary"
            onClick={() => onEdit(productClassification)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => onArchive(productClassification)}
          >
            Archive
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(productClassification) => productClassification.id}
      items={productClassifications}
    />
  );
}
