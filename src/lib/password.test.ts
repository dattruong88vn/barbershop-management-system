import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";

describe("hashPassword", () => {
  it("should return a stable sha256 hash", () => {
    const _firstHash = hashPassword("Secret123!");
    const _secondHash = hashPassword("Secret123!");

    expect(_firstHash).toHaveLength(64);
    expect(_firstHash).toBe(_secondHash);
  });
});

describe("verifyPassword", () => {
  it("should return true when password matches hash", () => {
    const _passwordHash = hashPassword("Secret123!");

    expect(verifyPassword("Secret123!", _passwordHash)).toBe(true);
  });

  it("should return false when password does not match hash", () => {
    const _passwordHash = hashPassword("Secret123!");

    expect(verifyPassword("Wrong123!", _passwordHash)).toBe(false);
  });
});
