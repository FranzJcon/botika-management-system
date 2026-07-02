import { Button } from "../ui/Button";
import { Table } from "../ui/Table";
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
  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Parent Category</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <td>
              <strong>{category.name}</strong>
            </td>
            <td>{category.description || "No description"}</td>
            <td>{category.parent?.name ?? "None"}</td>
            <td>
              <span
                className={
                  category.isActive ? "status-pill active" : "status-pill archived"
                }
              >
                {category.isActive ? "Active" : "Archived"}
              </span>
            </td>
            <td>
              <div className="table-actions">
                <Button variant="secondary" onClick={() => onEdit(category)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => onArchive(category)}>
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
