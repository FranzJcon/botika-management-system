import { useMemo, useState } from "react";

import { DosageFormForm } from "../components/dosage-forms/DosageFormForm";
import { DosageFormTable } from "../components/dosage-forms/DosageFormTable";
import { DeleteConfirmationDialog } from "../components/master-data/DeleteConfirmationDialog";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/ToastProvider";
import { useDosageForms } from "../hooks/useDosageForms";
import type { DosageForm, DosageFormPayload } from "../types/dosage-form";

type FormMode = "create" | "edit";

export function DosageFormsPage() {
  const {
    archiveDosageForm,
    createDosageForm,
    dosageForms,
    error,
    isLoading,
    reload,
    updateDosageForm,
  } = useDosageForms();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedDosageForm, setSelectedDosageForm] =
    useState<DosageForm | null>(null);
  const [dosageFormToArchive, setDosageFormToArchive] =
    useState<DosageForm | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const filteredDosageForms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return query
      ? dosageForms.filter((form) => form.name.toLowerCase().includes(query))
      : dosageForms;
  }, [dosageForms, searchTerm]);

  const openCreateForm = () => {
    setMutationError(null);
    setSelectedDosageForm(null);
    setFormMode("create");
  };

  const openEditForm = (dosageForm: DosageForm) => {
    setMutationError(null);
    setSelectedDosageForm(dosageForm);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedDosageForm(null);
    setMutationError(null);
  };

  const handleSubmit = async (payload: DosageFormPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      if (formMode === "edit" && selectedDosageForm) {
        await updateDosageForm(selectedDosageForm.id, payload);
        showToast("success", "Dosage form updated");
      } else {
        await createDosageForm(payload);
        showToast("success", "Dosage form created");
      }

      closeForm();
    } catch {
      const message = "Unable to save dosage form. Please check the details.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchiveDialog = (dosageForm: DosageForm) => {
    setMutationError(null);
    setDosageFormToArchive(dosageForm);
  };

  const closeArchiveDialog = () => {
    setDosageFormToArchive(null);
    setMutationError(null);
  };

  const handleArchive = async () => {
    if (!dosageFormToArchive) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await archiveDosageForm(dosageFormToArchive.id);
      closeArchiveDialog();
      showToast("success", "Dosage form archived");
    } catch {
      const message = "Unable to archive dosage form. Please try again.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Dosage Form"
        onAction={openCreateForm}
        title="Dosage Forms"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search dosage forms"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading dosage forms..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : dosageForms.length === 0 ? (
          <MasterDataEmptyState message="No dosage forms yet. Create the first product form." />
        ) : filteredDosageForms.length === 0 ? (
          <MasterDataEmptyState message="No dosage forms match your search." />
        ) : (
          <DosageFormTable
            dosageForms={filteredDosageForms}
            onArchive={openArchiveDialog}
            onEdit={openEditForm}
          />
        )}
      </Card>

      {formMode ? (
        <DosageFormForm
          dosageForm={selectedDosageForm}
          error={mutationError}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {dosageFormToArchive ? (
        <DeleteConfirmationDialog
          confirmLabel="Archive Dosage Form"
          error={mutationError}
          loading={isSubmitting}
          message="Products assigned to this dosage form will not be modified."
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
          targetDescription={dosageFormToArchive.description}
          targetName={dosageFormToArchive.name}
          title="Archive this dosage form?"
        />
      ) : null}
    </section>
  );
}
