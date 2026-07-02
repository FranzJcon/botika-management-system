export type DosageForm = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DosageFormFormValues = {
  name: string;
  description: string;
};

export type DosageFormPayload = {
  name: string;
  description?: string | null;
};
