import { Button } from "../ui/Button";
import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { MasterDataStatusBadge } from "../master-data/MasterDataStatusBadge";
import type { Brand } from "../../types/brand";

type BrandTableProps = {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onArchive: (brand: Brand) => void;
};

export function BrandTable({ brands, onArchive, onEdit }: BrandTableProps) {
  const columns: MasterDataColumn<Brand>[] = [
    {
      header: "Name",
      render: (brand) => <strong>{brand.name}</strong>,
    },
    {
      header: "Description",
      render: (brand) => brand.description || "No description",
    },
    {
      header: "Status",
      render: (brand) => <MasterDataStatusBadge isActive={brand.isActive} />,
    },
    {
      header: "Actions",
      render: (brand) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onEdit(brand)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => onArchive(brand)}>
            Archive
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(brand) => brand.id}
      items={brands}
    />
  );
}
