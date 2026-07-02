import { useState } from "react";

import { DeleteGenericDrugDialog } from "../components/generic-drugs/DeleteGenericDrugDialog";
import { GenericDrugForm } from "../components/generic-drugs/GenericDrugForm";
import { GenericDrugTable } from "../components/generic-drugs/GenericDrugTable";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
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
      } else {
        await createGenericDrug(payload);
      }

      closeForm();
    } catch {
      setMutationError("Unable to save generic drug. Please check the details.");
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
    } catch {
      setMutationError("Unable to archive generic drug. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Generic Drugs</h2>
        </div>
        <Button onClick={openCreateForm}>+ New Generic Drug</Button>
      </div>

      <Card className="content-card">
        <div className="toolbar">
          <Input
            label="Search"
            placeholder="Search generic drugs"
            type="search"
          />
          {error ? (
            <Button variant="secondary" onClick={() => void reload()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="state-panel">Loading generic drugs...</div>
        ) : error ? (
          <div className="state-panel error-state">{error}</div>
        ) : genericDrugs.length === 0 ? (
          <div className="state-panel">
            No generic drugs yet. Create the first active ingredient.
          </div>
        ) : (
          <GenericDrugTable
            genericDrugs={genericDrugs}
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
        <DeleteGenericDrugDialog
          error={mutationError}
          genericDrug={genericDrugToArchive}
          isSubmitting={isSubmitting}
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
        />
      ) : null}
    </section>
  );
}
