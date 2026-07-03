const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

const AUTH_TOKEN_KEY = "botika_auth_token";
const AUTH_USER_KEY = "botika_auth_user";

export class ApiRequestError extends Error {
  status?: number;
  responseMessage?: string;

  constructor(message: string, status?: number, responseMessage?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.responseMessage = responseMessage;
  }
}

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getStoredAuthUser = <T>() => {
  const value = localStorage.getItem(AUTH_USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const setAuthSession = (token: string, user: unknown) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = (await response
      .clone()
      .json()
      .catch(() => null)) as { message?: string } | null;

    throw new ApiRequestError(
      `API request failed with status ${response.status}`,
      response.status,
      errorBody?.message,
    );
  }

  return response.json() as Promise<T>;
};

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiPatch = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(path: string) =>
  request<T>(path, {
    method: "DELETE",
  });
