import { Button } from "../ui/Button";
import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { MasterDataStatusBadge } from "../master-data/MasterDataStatusBadge";
import type { Category } from "../../types/category";

type CategoryTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
};

export function CategoryTable({
  categories,
  onArchive,
  onEdit,
}: CategoryTableProps) {
  const columns: MasterDataColumn<Category>[] = [
    {
      header: "Name",
      render: (category) => <strong>{category.name}</strong>,
    },
    {
      header: "Description",
      render: (category) => category.description || "No description",
    },
    {
      header: "Parent Category",
      render: (category) => category.parent?.name ?? "None",
    },
    {
      header: "Status",
      render: (category) => (
        <MasterDataStatusBadge isActive={category.isActive} />
      ),
    },
    {
      header: "Actions",
      render: (category) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onEdit(category)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => onArchive(category)}>
            Archive
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(category) => category.id}
      items={categories}
    />
  );
}
