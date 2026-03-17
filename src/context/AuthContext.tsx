import {
  login as apiLogin,
  apiLogout,
  register as apiRegister,
  refreshToken as apiRefreshToken,
} from "@/api/auth";
import type { LoginRequest, RegisterRequest } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

const REFRESH_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

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

function isTokenNearExpiry(
  token: string,
  thresholdMs = 5 * 60 * 1000,
): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      typeof payload.exp === "number" &&
      payload.exp * 1000 - Date.now() < thresholdMs
    );
  } catch {
    return true;
  }
}

function loadStoredAuth(): {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
} {
  const token = localStorage.getItem("token");
  const storedRefreshToken = localStorage.getItem("refreshToken");
  const raw = localStorage.getItem("user");

  if (!token || isTokenExpired(token)) {
    // Don't clear refresh token — we might still be able to refresh
    if (!storedRefreshToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { user: null, token: null, refreshToken: null };
    }
    // Access token expired but we have a refresh token — return user info if available
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (isAuthUser(parsed)) {
          return {
            user: parsed,
            token: null,
            refreshToken: storedRefreshToken,
          };
        }
      } catch {
        // corrupted
      }
    }
    return { user: null, token: null, refreshToken: storedRefreshToken };
  }

  if (!raw) return { user: null, token: null, refreshToken: null };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isAuthUser(parsed)) {
      return { user: parsed, token, refreshToken: storedRefreshToken };
    }
  } catch {
    // corrupted localStorage
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  return { user: null, token: null, refreshToken: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(loadStoredAuth);
  const refreshingRef = useRef(false);

  const saveAuth = useCallback(
    (authUser: AuthUser, authToken: string, authRefreshToken: string) => {
      localStorage.setItem("token", authToken);
      localStorage.setItem("refreshToken", authRefreshToken);
      localStorage.setItem("user", JSON.stringify(authUser));
      setAuth({
        user: authUser,
        token: authToken,
        refreshToken: authRefreshToken,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    // Fire-and-forget server-side logout
    apiLogout().catch(() => {});

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    queryClient.clear();
    setAuth({ user: null, token: null, refreshToken: null });
    navigate("/login");
  }, [queryClient, navigate]);

  // Listen for auth:logout events from the API interceptor
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  // Proactive token refresh interval
  useEffect(() => {
    if (!auth.refreshToken) return;

    const attemptRefresh = async () => {
      if (refreshingRef.current) return;
      const currentToken = localStorage.getItem("token");
      if (currentToken && !isTokenNearExpiry(currentToken)) return;

      const storedRefresh = localStorage.getItem("refreshToken");
      if (!storedRefresh) return;

      refreshingRef.current = true;
      try {
        const res = await apiRefreshToken(storedRefresh);
        saveAuth(
          { userId: res.userId, email: res.email, name: res.name },
          res.token,
          res.refreshToken,
        );
      } catch {
        logout();
      } finally {
        refreshingRef.current = false;
      }
    };

    // Refresh immediately if token is expired/near-expiry on mount
    attemptRefresh();

    const intervalId = setInterval(attemptRefresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [auth.refreshToken, saveAuth, logout]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await apiLogin(data);
      saveAuth(
        { userId: res.userId, email: res.email, name: res.name },
        res.token,
        res.refreshToken,
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
        res.refreshToken,
      );
    },
    [saveAuth],
  );

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthenticated: !!auth.token && !isTokenExpired(auth.token),
      login,
      register,
      logout,
    }),
    [auth.user, auth.token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
