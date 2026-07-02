import { Button } from "../ui/Button";
import { Table } from "../ui/Table";
import type { Brand } from "../../types/brand";

type BrandTableProps = {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onArchive: (brand: Brand) => void;
};

export function BrandTable({ brands, onArchive, onEdit }: BrandTableProps) {
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
        {brands.map((brand) => (
          <tr key={brand.id}>
            <td>
              <strong>{brand.name}</strong>
            </td>
            <td>{brand.description || "No description"}</td>
            <td>
              <span
                className={brand.isActive ? "status-pill active" : "status-pill archived"}
              >
                {brand.isActive ? "Active" : "Archived"}
              </span>
            </td>
            <td>
              <div className="table-actions">
                <Button variant="secondary" onClick={() => onEdit(brand)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => onArchive(brand)}>
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
