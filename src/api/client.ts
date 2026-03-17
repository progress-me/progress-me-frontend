import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function tryRefreshToken(): Promise<string> {
  const stored = localStorage.getItem("refreshToken");
  if (!stored) throw new Error("No refresh token");

  const res = await axios.post<{ token: string; refreshToken: string }>(
    `${import.meta.env.VITE_API_BASE_URL ?? "/api"}/auth/refresh`,
    { refreshToken: stored },
    { headers: { "Content-Type": "application/json" } },
  );

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("refreshToken", res.data.refreshToken);
  return res.data.token;
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const url = originalRequest.url ?? "";
      const isAuthRoute = url.startsWith("/auth/");

      if (!isAuthRoute) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = tryRefreshToken().finally(() => {
              refreshPromise = null;
            });
          }
          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      }
    }
    return Promise.reject(error);
  },
);

export default client;
