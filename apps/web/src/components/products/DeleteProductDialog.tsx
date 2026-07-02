import { DeleteConfirmationDialog } from "../master-data/DeleteConfirmationDialog";
import type { Product } from "../../types/product";

type DeleteProductDialogProps = {
  product: Product;
  error: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteProductDialog({
  error,
  isSubmitting,
  onCancel,
  onConfirm,
  product,
}: DeleteProductDialogProps) {
  return (
    <DeleteConfirmationDialog
      confirmLabel="Archive Product"
      error={error}
      loading={isSubmitting}
      message="Existing inventory and sales history will not be modified."
      onCancel={onCancel}
      onConfirm={onConfirm}
      targetDescription={product.sku}
      targetName={product.name}
      title="Archive this product?"
    />
  );
}
