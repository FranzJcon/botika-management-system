import { Button } from "../ui/Button";
import { Table } from "../ui/Table";
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
  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {dosageForms.map((dosageForm) => (
          <tr key={dosageForm.id}>
            <td>
              <strong>{dosageForm.name}</strong>
            </td>
            <td>{dosageForm.description || "No description"}</td>
            <td>
              <span
                className={
                  dosageForm.isActive ? "status-pill active" : "status-pill archived"
                }
              >
                {dosageForm.isActive ? "Active" : "Archived"}
              </span>
            </td>
            <td>
              <div className="table-actions">
                <Button variant="secondary" onClick={() => onEdit(dosageForm)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => onArchive(dosageForm)}>
                  Archive
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
