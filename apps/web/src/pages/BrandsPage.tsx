import { useMemo, useState } from "react";

import { BrandForm } from "../components/brands/BrandForm";
import { BrandTable } from "../components/brands/BrandTable";
import { DeleteConfirmationDialog } from "../components/master-data/DeleteConfirmationDialog";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
import { useBrands } from "../hooks/useBrands";
import type { Brand, BrandPayload } from "../types/brand";

type FormMode = "create" | "edit";

export function BrandsPage() {
  const {
    archiveBrand,
    brands,
    createBrand,
    error,
    isLoading,
    reload,
    updateBrand,
  } = useBrands();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandToArchive, setBrandToArchive] = useState<Brand | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const filteredBrands = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return query
      ? brands.filter((brand) => brand.name.toLowerCase().includes(query))
      : brands;
  }, [brands, searchTerm]);

  const openCreateForm = () => {
    setMutationError(null);
    setSelectedBrand(null);
    setFormMode("create");
  };

  const openEditForm = (brand: Brand) => {
    setMutationError(null);
    setSelectedBrand(brand);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedBrand(null);
    setMutationError(null);
  };

  const handleSubmit = async (payload: BrandPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      if (formMode === "edit" && selectedBrand) {
        await updateBrand(selectedBrand.id, payload);
        showToast("success", "Brand updated");
      } else {
        await createBrand(payload);
        showToast("success", "Brand created");
      }

      closeForm();
    } catch {
      const message = "Unable to save brand. Please check the details.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchiveDialog = (brand: Brand) => {
    setMutationError(null);
    setBrandToArchive(brand);
  };

  const closeArchiveDialog = () => {
    setBrandToArchive(null);
    setMutationError(null);
  };

  const handleArchive = async () => {
    if (!brandToArchive) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await archiveBrand(brandToArchive.id);
      closeArchiveDialog();
      showToast("success", "Brand archived");
    } catch {
      const message = "Unable to archive brand. Please try again.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Brand"
        onAction={openCreateForm}
        title="Brands"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search brands"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading brands..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : brands.length === 0 ? (
          <MasterDataEmptyState message="No brands yet. Create the first product brand." />
        ) : filteredBrands.length === 0 ? (
          <MasterDataEmptyState message="No brands match your search." />
        ) : (
          <BrandTable
            brands={filteredBrands}
            onArchive={openArchiveDialog}
            onEdit={openEditForm}
          />
        )}
      </Card>

      {formMode ? (
        <BrandForm
          brand={selectedBrand}
          error={mutationError}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {brandToArchive ? (
        <DeleteConfirmationDialog
          confirmLabel="Archive Brand"
          error={mutationError}
          loading={isSubmitting}
          message="Products assigned to this brand will not be modified."
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
          targetDescription={brandToArchive.description}
          targetName={brandToArchive.name}
          title="Archive this brand?"
        />
      ) : null}
    </section>
  );
}
