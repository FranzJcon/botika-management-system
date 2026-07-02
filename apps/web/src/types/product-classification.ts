export type ProductClassification = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductClassificationFormValues = {
  name: string;
  description: string;
};

export type ProductClassificationPayload = {
  name: string;
  description?: string | null;
};
