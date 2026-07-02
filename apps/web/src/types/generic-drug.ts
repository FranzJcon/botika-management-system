export type GenericDrug = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GenericDrugFormValues = {
  name: string;
  description: string;
};

export type GenericDrugPayload = {
  name: string;
  description?: string | null;
};
