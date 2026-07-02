import { InventoryLevelsTable } from "./InventoryLevelsTable";
import type { InventoryLevel } from "../../types/inventory-level";

type LowStockTableProps = {
  inventoryLevels: InventoryLevel[];
};

export function LowStockTable({ inventoryLevels }: LowStockTableProps) {
  return (
    <InventoryLevelsTable inventoryLevels={inventoryLevels} showActions={false} />
  );
}
