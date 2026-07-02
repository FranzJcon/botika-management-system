import { useState } from "react";

import {
  apiGet,
  apiPost,
  clearAuthSession,
  getAuthToken,
  getStoredAuthUser,
  setAuthSession,
} from "../lib/api";
import type { AuthUser, LoginResponse } from "../types/auth";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<AuthUser | null>(() =>
    getStoredAuthUser<AuthUser>(),
  );

  const login = async (email: string, password: string) => {
    const session = await apiPost<LoginResponse>("/auth/login", {
      email,
      password,
    });

    setAuthSession(session.token, session.user);
    setToken(session.token);
    setUser(session.user);

    return session.user;
  };

  const loadCurrentUser = async () => {
    const currentUser = await apiGet<AuthUser>("/auth/me");
    setUser(currentUser);
    setAuthSession(getAuthToken() ?? "", currentUser);
    return currentUser;
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  };

  return {
    isAuthenticated: Boolean(token),
    token,
    user,
    login,
    loadCurrentUser,
    logout,
  };
}
