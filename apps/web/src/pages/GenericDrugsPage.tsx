import { useMemo, useState } from "react";

import { GenericDrugForm } from "../components/generic-drugs/GenericDrugForm";
import { GenericDrugTable } from "../components/generic-drugs/GenericDrugTable";
import { DeleteConfirmationDialog } from "../components/master-data/DeleteConfirmationDialog";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
import { useGenericDrugs } from "../hooks/useGenericDrugs";
import type { GenericDrug, GenericDrugPayload } from "../types/generic-drug";

type FormMode = "create" | "edit";

export function GenericDrugsPage() {
  const {
    archiveGenericDrug,
    createGenericDrug,
    error,
    genericDrugs,
    isLoading,
    reload,
    updateGenericDrug,
  } = useGenericDrugs();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedGenericDrug, setSelectedGenericDrug] =
    useState<GenericDrug | null>(null);
  const [genericDrugToArchive, setGenericDrugToArchive] =
    useState<GenericDrug | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const filteredGenericDrugs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return query
      ? genericDrugs.filter((drug) => drug.name.toLowerCase().includes(query))
      : genericDrugs;
  }, [genericDrugs, searchTerm]);

  const openCreateForm = () => {
    setMutationError(null);
    setSelectedGenericDrug(null);
    setFormMode("create");
  };

  const openEditForm = (genericDrug: GenericDrug) => {
    setMutationError(null);
    setSelectedGenericDrug(genericDrug);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedGenericDrug(null);
    setMutationError(null);
  };

  const handleSubmit = async (payload: GenericDrugPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      if (formMode === "edit" && selectedGenericDrug) {
        await updateGenericDrug(selectedGenericDrug.id, payload);
        showToast("success", "Generic drug updated");
      } else {
        await createGenericDrug(payload);
        showToast("success", "Generic drug created");
      }

      closeForm();
    } catch {
      const message = "Unable to save generic drug. Please check the details.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchiveDialog = (genericDrug: GenericDrug) => {
    setMutationError(null);
    setGenericDrugToArchive(genericDrug);
  };

  const closeArchiveDialog = () => {
    setGenericDrugToArchive(null);
    setMutationError(null);
  };

  const handleArchive = async () => {
    if (!genericDrugToArchive) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await archiveGenericDrug(genericDrugToArchive.id);
      closeArchiveDialog();
      showToast("success", "Generic drug archived");
    } catch {
      const message = "Unable to archive generic drug. Please try again.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Generic Drug"
        onAction={openCreateForm}
        title="Generic Drugs"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search generic drugs"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading generic drugs..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : genericDrugs.length === 0 ? (
          <MasterDataEmptyState message="No generic drugs yet. Create the first active ingredient." />
        ) : filteredGenericDrugs.length === 0 ? (
          <MasterDataEmptyState message="No generic drugs match your search." />
        ) : (
          <GenericDrugTable
            genericDrugs={filteredGenericDrugs}
            onArchive={openArchiveDialog}
            onEdit={openEditForm}
          />
        )}
      </Card>

      {formMode ? (
        <GenericDrugForm
          error={mutationError}
          genericDrug={selectedGenericDrug}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {genericDrugToArchive ? (
        <DeleteConfirmationDialog
          confirmLabel="Archive Generic Drug"
          error={mutationError}
          loading={isSubmitting}
          message="Products assigned to this generic drug will not be modified."
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
          targetDescription={genericDrugToArchive.description}
          targetName={genericDrugToArchive.name}
          title="Archive this generic drug?"
        />
      ) : null}
    </section>
  );
}
