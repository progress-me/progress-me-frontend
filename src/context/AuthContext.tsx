import { login as apiLogin, register as apiRegister } from "@/api/auth";
import type { LoginRequest, RegisterRequest } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.userId === "string" &&
    typeof obj.email === "string" &&
    typeof obj.name === "string"
  );
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function loadStoredAuth(): { user: AuthUser | null; token: string | null } {
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { user: null, token: null };
  }

  if (!raw) return { user: null, token: null };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isAuthUser(parsed)) {
      return { user: parsed, token };
    }
  } catch {
    // corrupted localStorage
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [{ user, token }, setAuth] = useState(loadStoredAuth);

  const saveAuth = useCallback((authUser: AuthUser, authToken: string) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
    setAuth({ user: authUser, token: authToken });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.clear();
    setAuth({ user: null, token: null });
    navigate("/login");
  }, [queryClient, navigate]);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await apiLogin(data);
      saveAuth(
        { userId: res.userId, email: res.email, name: res.name },
        res.token,
      );
    },
    [saveAuth],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const res = await apiRegister(data);
      saveAuth(
        { userId: res.userId, email: res.email, name: res.name },
        res.token,
      );
    },
    [saveAuth],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !isTokenExpired(token),
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
