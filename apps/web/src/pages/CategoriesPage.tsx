import { useMemo, useState } from "react";

import { CategoryForm } from "../components/categories/CategoryForm";
import { CategoryTable } from "../components/categories/CategoryTable";
import { DeleteCategoryDialog } from "../components/categories/DeleteCategoryDialog";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
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
      <div className="page-heading">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Categories</h2>
        </div>
        <Button onClick={openCreateForm}>+ New Category</Button>
      </div>

      <Card className="content-card">
        <div className="toolbar">
          <Input
            label="Search"
            placeholder="Search categories"
            type="search"
          />
          {error ? (
            <Button variant="secondary" onClick={() => void reload()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="state-panel">Loading categories...</div>
        ) : error ? (
          <div className="state-panel error-state">{error}</div>
        ) : categories.length === 0 ? (
          <div className="state-panel">
            No categories yet. Create the first store category.
          </div>
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
        <DeleteCategoryDialog
          category={categoryToArchive}
          error={mutationError}
          isSubmitting={isSubmitting}
          onCancel={closeArchiveDialog}
          onConfirm={handleArchive}
        />
      ) : null}
    </section>
  );
}
