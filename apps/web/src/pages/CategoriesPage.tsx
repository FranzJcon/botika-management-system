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
import { useToast } from "../components/ui/ToastProvider";
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
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );
  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, searchTerm]);

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
        showToast("success", "Category updated");
      } else {
        await createCategory(payload);
        showToast("success", "Category created");
      }

      closeForm();
    } catch {
      const message = "Unable to save category. Please check the details.";
      setMutationError(message);
      showToast("error", message);
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
      showToast("success", "Category archived");
    } catch {
      const message = "Unable to archive category. Please try again.";
      setMutationError(message);
      showToast("error", message);
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
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search categories"
          searchValue={searchTerm}
          showRetry={Boolean(error)}
        />

        {isLoading ? (
          <MasterDataLoadingState message="Loading categories..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : categories.length === 0 ? (
          <MasterDataEmptyState message="No categories yet. Create the first store category." />
        ) : filteredCategories.length === 0 ? (
          <MasterDataEmptyState message="No categories match your search." />
        ) : (
          <CategoryTable
            categories={filteredCategories}
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
