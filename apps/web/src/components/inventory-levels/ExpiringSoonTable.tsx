import {
  MasterDataTable,
  type MasterDataColumn,
} from "../master-data/MasterDataTable";
import type { ExpiringSoonBatch } from "../../types/inventory-level";

type ExpiringSoonTableProps = {
  batches: ExpiringSoonBatch[];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));

const formatQuantity = (value: string | number) => Number(value).toLocaleString();

export function ExpiringSoonTable({ batches }: ExpiringSoonTableProps) {
  const columns: MasterDataColumn<ExpiringSoonBatch>[] = [
    {
      header: "Product Name",
      render: (batch) => batch.product.name,
    },
    {
      header: "Batch ID",
      render: (batch) => batch.id,
    },
    {
      header: "Lot Number",
      render: (batch) => batch.lotNumber || "None",
    },
    {
      header: "Expiration Date",
      render: (batch) => formatDate(batch.expirationDate),
    },
    {
      header: "Remaining Quantity",
      render: (batch) => formatQuantity(batch.remainingQuantity),
    },
  ];

  return (
    <MasterDataTable
      columns={columns}
      getRowKey={(batch) => batch.id}
      items={batches}
    />
  );
}
