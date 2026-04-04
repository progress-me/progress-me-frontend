import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage since Node 22 built-in conflicts with jsdom
const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
  key: () => null,
};

Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Must mock axios before importing client
vi.mock("axios", () => {
  const interceptors = {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  };
  const instance = {
    interceptors,
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
  };
  return {
    default: {
      create: vi.fn(() => instance),
    },
  };
});

describe("API client", () => {
  beforeEach(() => {
    store.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates client with correct config", async () => {
    const axios = await import("axios");
    await import("./client");

    expect(axios.default.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("request interceptor attaches token from localStorage", async () => {
    const axios = await import("axios");
    await import("./client");

    const requestUse = (axios.default.create as ReturnType<typeof vi.fn>).mock
      .results[0].value.interceptors.request.use;
    const interceptor = requestUse.mock.calls[0][0];

    store.set("token", "test-jwt-token");
    const config = { headers: {} as Record<string, string> };
    const result = interceptor(config);

    expect(result.headers.Authorization).toBe("Bearer test-jwt-token");
  });

  it("request interceptor skips token when not present", async () => {
    const axios = await import("axios");
    await import("./client");

    const requestUse = (axios.default.create as ReturnType<typeof vi.fn>).mock
      .results[0].value.interceptors.request.use;
    const interceptor = requestUse.mock.calls[0][0];

    const config = { headers: {} as Record<string, string> };
    const result = interceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it("response interceptor clears auth on 401 for non-auth routes", async () => {
    const axios = await import("axios");
    await import("./client");

    const responseUse = (axios.default.create as ReturnType<typeof vi.fn>).mock
      .results[0].value.interceptors.response.use;
    const errorHandler = responseUse.mock.calls[0][1];

    store.set("token", "some-token");
    store.set("user", '{"userId":"1","email":"a@b.c","name":"Test"}');

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    const error = {
      response: { status: 401 },
      config: { url: "/goals" },
    };

    await expect(errorHandler(error)).rejects.toBe(error);
    expect(store.has("token")).toBe(false);
    expect(store.has("user")).toBe(false);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  it("response interceptor does NOT clear auth on 401 for auth routes", async () => {
    const axios = await import("axios");
    await import("./client");

    const responseUse = (axios.default.create as ReturnType<typeof vi.fn>).mock
      .results[0].value.interceptors.response.use;
    const errorHandler = responseUse.mock.calls[0][1];

    store.set("token", "some-token");

    const error = {
      response: { status: 401 },
      config: { url: "/auth/login" },
    };

    await expect(errorHandler(error)).rejects.toBe(error);
    expect(store.get("token")).toBe("some-token");
  });
});
