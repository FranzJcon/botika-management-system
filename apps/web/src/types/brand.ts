export type Brand = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BrandFormValues = {
  name: string;
  description: string;
};

export type BrandPayload = {
  name: string;
  description?: string | null;
};
