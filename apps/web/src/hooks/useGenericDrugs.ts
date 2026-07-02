import { useCallback, useEffect, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type { GenericDrug, GenericDrugPayload } from "../types/generic-drug";

export function useGenericDrugs() {
  const [genericDrugs, setGenericDrugs] = useState<GenericDrug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGenericDrugs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<GenericDrug[]>("/generic-drugs");
      setGenericDrugs(data);
    } catch {
      setError("Unable to load generic drugs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGenericDrugs();
  }, [loadGenericDrugs]);

  const createGenericDrug = async (payload: GenericDrugPayload) => {
    await apiPost<GenericDrug>("/generic-drugs", payload);
    await loadGenericDrugs();
  };

  const updateGenericDrug = async (id: string, payload: GenericDrugPayload) => {
    await apiPatch<GenericDrug>(`/generic-drugs/${id}`, payload);
    await loadGenericDrugs();
  };

  const archiveGenericDrug = async (id: string) => {
    await apiDelete<{ message: string }>(`/generic-drugs/${id}`);
    await loadGenericDrugs();
  };

  return {
    genericDrugs,
    isLoading,
    error,
    reload: loadGenericDrugs,
    createGenericDrug,
    updateGenericDrug,
    archiveGenericDrug,
  };
}
