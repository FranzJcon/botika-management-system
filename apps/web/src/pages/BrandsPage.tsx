import { useState } from "react";

import { BrandForm } from "../components/brands/BrandForm";
import { BrandTable } from "../components/brands/BrandTable";
import { DeleteBrandDialog } from "../components/brands/DeleteBrandDialog";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
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
      } else {
        await createBrand(payload);
      }

      closeForm();
    } catch {
      setMutationError("Unable to save brand. Please check the details.");
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
    } catch {
      setMutationError("Unable to archive brand. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Brands</h2>
        </div>
        <Button onClick={openCreateForm}>+ New Brand</Button>
      </div>

      <Card className="content-card">
        <div className="toolbar">
          <Input label="Search" placeholder="Search brands" type="search" />
          {error ? (
            <Button variant="secondary" onClick={() => void reload()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="state-panel">Loading brands...</div>
        ) : error ? (
          <div className="state-panel error-state">{error}</div>
        ) : brands.length === 0 ? (
          <div className="state-panel">
            No brands yet. Create the first product brand.
          </div>
        ) : (
          <BrandTable
            brands={brands}
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
        <DeleteBrandDialog
          brand={brandToArchive}
          error={mutationError}
          isSubmitting={isSubmitting}
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
        />
      ) : null}
    </section>
  );
}
