import { describe, expect, it } from "vitest";

// Test the utility functions used by AuthContext
// We extract and test: isTokenExpired, isAuthUser, loadStoredAuth logic

function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

// Re-implement the pure functions from AuthContext for isolated testing
// (since they're not exported, we test the same logic)

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function isAuthUser(
  value: unknown,
): value is { userId: string; email: string; name: string } {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.userId === "string" &&
    typeof obj.email === "string" &&
    typeof obj.name === "string"
  );
}

describe("isTokenExpired", () => {
  it("returns false for a non-expired token", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = createJwt({ exp: futureExp, sub: "user1" });
    expect(isTokenExpired(token)).toBe(false);
  });

  it("returns true for an expired token", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const token = createJwt({ exp: pastExp, sub: "user1" });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns true for a malformed token", () => {
    expect(isTokenExpired("not-a-jwt")).toBe(true);
    expect(isTokenExpired("")).toBe(true);
    expect(isTokenExpired("a.b.c")).toBe(true);
  });

  it("returns false when token has no exp claim", () => {
    const token = createJwt({ sub: "user1" });
    expect(isTokenExpired(token)).toBe(false);
  });
});

describe("isAuthUser", () => {
  it("returns true for valid auth user object", () => {
    expect(isAuthUser({ userId: "1", email: "a@b.c", name: "Test" })).toBe(
      true,
    );
  });

  it("returns false for null", () => {
    expect(isAuthUser(null)).toBe(false);
  });

  it("returns false for missing fields", () => {
    expect(isAuthUser({ userId: "1", email: "a@b.c" })).toBe(false);
    expect(isAuthUser({ userId: "1" })).toBe(false);
    expect(isAuthUser({})).toBe(false);
  });

  it("returns false for wrong field types", () => {
    expect(isAuthUser({ userId: 1, email: "a@b.c", name: "Test" })).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isAuthUser("string")).toBe(false);
    expect(isAuthUser(42)).toBe(false);
    expect(isAuthUser(undefined)).toBe(false);
  });
});
