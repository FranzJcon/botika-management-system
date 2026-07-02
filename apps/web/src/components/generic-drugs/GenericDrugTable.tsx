import { Button } from "../ui/Button";
import { Table } from "../ui/Table";
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
        {genericDrugs.map((genericDrug) => (
          <tr key={genericDrug.id}>
            <td>
              <strong>{genericDrug.name}</strong>
            </td>
            <td>{genericDrug.description || "No description"}</td>
            <td>
              <span
                className={
                  genericDrug.isActive ? "status-pill active" : "status-pill archived"
                }
              >
                {genericDrug.isActive ? "Active" : "Archived"}
              </span>
            </td>
            <td>
              <div className="table-actions">
                <Button variant="secondary" onClick={() => onEdit(genericDrug)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => onArchive(genericDrug)}>
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
