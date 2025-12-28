// AuthResponse matches structure of API response in userController.js
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    name?: string;
    role: string;
  };
}

export type RegisterUserPayload = {
  email: string;
  username: string;
  password: string;
  name: string;
  role: "user" | "admin";
};

export type LoginUserPayload = { password: string } & ({ email: string } | { username: string });

// Base API URL - see server/router/userRoutes.js
const API_BASE = "/api/users";

export async function registerUser(payload: RegisterUserPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text()); // Sends the error message from the API
  }
  return await res.json();
}

export async function loginUser(
  payload: LoginUserPayload
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function authHeader(): Record<string, string> | undefined {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
