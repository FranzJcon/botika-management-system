export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
};

export type CategoryFormValues = {
  name: string;
  description: string;
  parentId: string;
};

export type CategoryPayload = {
  name: string;
  description?: string | null;
  parentId?: string | null;
};
