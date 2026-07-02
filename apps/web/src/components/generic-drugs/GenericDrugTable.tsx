import { Button } from "../ui/Button";
import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { MasterDataStatusBadge } from "../master-data/MasterDataStatusBadge";
import type { GenericDrug } from "../../types/generic-drug";

type GenericDrugTableProps = {
  genericDrugs: GenericDrug[];
  onEdit: (genericDrug: GenericDrug) => void;
  onArchive: (genericDrug: GenericDrug) => void;
};

export function GenericDrugTable({
  genericDrugs,
  onArchive,
  onEdit,
}: GenericDrugTableProps) {
  const columns: MasterDataColumn<GenericDrug>[] = [
    {
      header: "Name",
      render: (genericDrug) => <strong>{genericDrug.name}</strong>,
    },
    {
      header: "Description",
      render: (genericDrug) => genericDrug.description || "No description",
    },
    {
      header: "Status",
      render: (genericDrug) => (
        <MasterDataStatusBadge isActive={genericDrug.isActive} />
      ),
    },
    {
      header: "Actions",
      render: (genericDrug) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onEdit(genericDrug)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => onArchive(genericDrug)}>
            Archive
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(genericDrug) => genericDrug.id}
      items={genericDrugs}
    />
  );
}
