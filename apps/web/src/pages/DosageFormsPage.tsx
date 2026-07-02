import { useState } from "react";

import { DeleteDosageFormDialog } from "../components/dosage-forms/DeleteDosageFormDialog";
import { DosageFormForm } from "../components/dosage-forms/DosageFormForm";
import { DosageFormTable } from "../components/dosage-forms/DosageFormTable";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
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
      } else {
        await createDosageForm(payload);
      }

      closeForm();
    } catch {
      setMutationError("Unable to save dosage form. Please check the details.");
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
    } catch {
      setMutationError("Unable to archive dosage form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Dosage Forms</h2>
        </div>
        <Button onClick={openCreateForm}>+ New Dosage Form</Button>
      </div>

      <Card className="content-card">
        <div className="toolbar">
          <Input
            label="Search"
            placeholder="Search dosage forms"
            type="search"
          />
          {error ? (
            <Button variant="secondary" onClick={() => void reload()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="state-panel">Loading dosage forms...</div>
        ) : error ? (
          <div className="state-panel error-state">{error}</div>
        ) : dosageForms.length === 0 ? (
          <div className="state-panel">
            No dosage forms yet. Create the first product form.
          </div>
        ) : (
          <DosageFormTable
            dosageForms={dosageForms}
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
        <DeleteDosageFormDialog
          dosageForm={dosageFormToArchive}
          error={mutationError}
          isSubmitting={isSubmitting}
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
        />
      ) : null}
    </section>
  );
}
