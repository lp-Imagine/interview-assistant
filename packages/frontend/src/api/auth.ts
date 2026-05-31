import api from "./index";

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export function register(data: {
  email: string;
  password: string;
  name?: string;
}) {
  return api.post<AuthResponse>("/auth/register", data).then((r) => r.data);
}

export function login(data: { email: string; password: string }) {
  return api.post<AuthResponse>("/auth/login", data).then((r) => r.data);
}

export function getMe() {
  return api.get<AuthResponse["user"]>("/auth/me").then((r) => r.data);
}
