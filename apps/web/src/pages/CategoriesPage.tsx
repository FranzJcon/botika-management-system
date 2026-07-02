import { useMemo, useState } from "react";

import { CategoryForm } from "../components/categories/CategoryForm";
import { CategoryTable } from "../components/categories/CategoryTable";
import { DeleteConfirmationDialog } from "../components/master-data/DeleteConfirmationDialog";
import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { MasterDataToolbar } from "../components/master-data/MasterDataToolbar";
import { Card } from "../components/ui/Card";
import { useCategories } from "../hooks/useCategories";
import type { Category, CategoryPayload } from "../types/category";

type FormMode = "create" | "edit";

export function CategoriesPage() {
  const {
    archiveCategory,
    categories,
    createCategory,
    error,
    isLoading,
    reload,
    updateCategory,
  } = useCategories();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToArchive, setCategoryToArchive] = useState<Category | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

  const openCreateForm = () => {
    setMutationError(null);
    setSelectedCategory(null);
    setFormMode("create");
  };

  const openEditForm = (category: Category) => {
    setMutationError(null);
    setSelectedCategory(category);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedCategory(null);
    setMutationError(null);
  };

  const handleSubmit = async (payload: CategoryPayload) => {
    setIsSubmitting(true);
    setMutationError(null);

    try {
      if (formMode === "edit" && selectedCategory) {
        await updateCategory(selectedCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      closeForm();
    } catch {
      setMutationError("Unable to save category. Please check the details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchiveDialog = (category: Category) => {
    setMutationError(null);
    setCategoryToArchive(category);
  };

  const closeArchiveDialog = () => {
    setCategoryToArchive(null);
    setMutationError(null);
  };

  const handleArchive = async () => {
    if (!categoryToArchive) {
      return;
    }

    setIsSubmitting(true);
    setMutationError(null);

    try {
      await archiveCategory(categoryToArchive.id);
      closeArchiveDialog();
    } catch {
      setMutationError("Unable to archive category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader
        actionLabel="+ New Category"
        onAction={openCreateForm}
        title="Categories"
      />

      <Card className="content-card">
        <MasterDataToolbar
          onRetry={() => void reload()}
          searchPlaceholder="Search categories"
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading categories..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : categories.length === 0 ? (
          <MasterDataEmptyState message="No categories yet. Create the first store category." />
        ) : (
          <CategoryTable
            categories={categories}
            onArchive={openArchiveDialog}
            onEdit={openEditForm}
          />
        )}
      </Card>

      {formMode ? (
        <CategoryForm
          categories={activeCategories}
          category={selectedCategory}
          error={mutationError}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {categoryToArchive ? (
        <DeleteConfirmationDialog
          confirmLabel="Archive Category"
          error={mutationError}
          loading={isSubmitting}
          message="Products assigned to this category will not be modified."
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
          targetDescription={categoryToArchive.description}
          targetName={categoryToArchive.name}
          title="Archive this category?"
        />
      ) : null}
    </section>
  );
}
