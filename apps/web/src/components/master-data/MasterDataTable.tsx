import type { ReactNode } from "react";

import { Table } from "../ui/Table";

export type MasterDataColumn<TItem> = {
  header: string;
  render: (item: TItem) => ReactNode;
};

type MasterDataTableProps<TItem> = {
  columns: MasterDataColumn<TItem>[];
  items: TItem[];
  getRowKey: (item: TItem) => string;
};

export function MasterDataTable<TItem>({
  columns,
  getRowKey,
  items,
}: MasterDataTableProps<TItem>) {
  return (
    <Table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={getRowKey(item)}>
            {columns.map((column) => (
              <td key={column.header}>{column.render(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
