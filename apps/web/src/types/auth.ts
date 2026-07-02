export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "STAFF";
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};
