import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type { DosageForm, DosageFormPayload } from "../types/dosage-form";

export function useDosageForms() {
  const [dosageForms, setDosageForms] = useState<DosageForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDosageForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<DosageForm[]>("/dosage-forms");
      setDosageForms(data);
    } catch {
      setError("Unable to load dosage forms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDosageForms();
  }, [loadDosageForms]);

  const createDosageForm = async (payload: DosageFormPayload) => {
    await apiPost<DosageForm>("/dosage-forms", payload);
    await loadDosageForms();
  };

  const updateDosageForm = async (id: string, payload: DosageFormPayload) => {
    await apiPatch<DosageForm>(`/dosage-forms/${id}`, payload);
    await loadDosageForms();
  };

  const archiveDosageForm = async (id: string) => {
    await apiDelete<{ message: string }>(`/dosage-forms/${id}`);
    await loadDosageForms();
  };

  return {
    dosageForms,
    isLoading,
    error,
    reload: loadDosageForms,
    createDosageForm,
    updateDosageForm,
    archiveDosageForm,
  };
}
