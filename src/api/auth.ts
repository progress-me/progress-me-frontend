import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/api";
import client from "./client";

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/register", data);
  return res.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/refresh", {
    refreshToken: token,
  });
  return res.data;
}

export async function apiLogout(): Promise<void> {
  await client.post("/auth/logout");
}
