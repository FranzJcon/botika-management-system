import { Button } from "../ui/Button";
import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import { MasterDataStatusBadge } from "../master-data/MasterDataStatusBadge";
import type { DosageForm } from "../../types/dosage-form";

type DosageFormTableProps = {
  dosageForms: DosageForm[];
  onEdit: (dosageForm: DosageForm) => void;
  onArchive: (dosageForm: DosageForm) => void;
};

export function DosageFormTable({
  dosageForms,
  onArchive,
  onEdit,
}: DosageFormTableProps) {
  const columns: MasterDataColumn<DosageForm>[] = [
    {
      header: "Name",
      render: (dosageForm) => <strong>{dosageForm.name}</strong>,
    },
    {
      header: "Description",
      render: (dosageForm) => dosageForm.description || "No description",
    },
    {
      header: "Status",
      render: (dosageForm) => (
        <MasterDataStatusBadge isActive={dosageForm.isActive} />
      ),
    },
    {
      header: "Actions",
      render: (dosageForm) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => onEdit(dosageForm)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => onArchive(dosageForm)}>
            Archive
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(dosageForm) => dosageForm.id}
      items={dosageForms}
    />
  );
}
