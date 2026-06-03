import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthUserFields } from "@/types";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/password", () => ({
  verifyPassword: mocks.verifyPassword,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: mocks.findFirst,
    },
  },
}));

import { authOptions } from "@/lib/auth";

type CredentialsProvider = {
  options: {
    authorize: (credentials?: {
      username?: string;
      password?: string;
    }) => Promise<unknown> | unknown;
  };
};

function getCredentialsProvider(): CredentialsProvider {
  return authOptions.providers[0] as CredentialsProvider;
}

async function authorize(credentials?: {
  username?: string;
  password?: string;
}): Promise<unknown> {
  return getCredentialsProvider().options.authorize(credentials);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("authOptions", () => {
  describe("authorize", () => {
    it("should return null when username or password is missing", async () => {
      await expect(authorize()).resolves.toBeNull();
      await expect(authorize({ username: "dat" })).resolves.toBeNull();
    });

    it("should return null when user is not found", async () => {
      mocks.findFirst.mockResolvedValue(null);

      await expect(
        authorize({
          username: "dat",
          password: "Secret123!",
        }),
      ).resolves.toBeNull();
      expect(mocks.findFirst).toHaveBeenCalledWith({
        where: { username: "dat" },
        select: {
          id: true,
          role: true,
          shopId: true,
          branchId: true,
          username: true,
          passwordHash: true,
          isFirstLogin: true,
        },
      });
    });

    it("should return null when password does not match", async () => {
      mocks.findFirst.mockResolvedValue({
        id: "user-1",
        role: "owner",
        shopId: "shop-1",
        branchId: null,
        username: "dat",
        passwordHash: "hashed-password",
        isFirstLogin: true,
      });
      mocks.verifyPassword.mockReturnValue(false);

      await expect(
        authorize({
          username: "dat",
          password: "Secret123!",
        }),
      ).resolves.toBeNull();
      expect(mocks.verifyPassword).toHaveBeenCalledWith(
        "Secret123!",
        "hashed-password",
      );
    });

    it("should return mapped user fields on success", async () => {
      const _user = {
        id: "user-1",
        role: "owner",
        shopId: "shop-1",
        branchId: "branch-1",
        username: "dat",
        passwordHash: "hashed-password",
        isFirstLogin: false,
      };

      mocks.findFirst.mockResolvedValue(_user);
      mocks.verifyPassword.mockReturnValue(true);

      await expect(
        authorize({
          username: "dat",
          password: "Secret123!",
        }),
      ).resolves.toEqual<AuthUserFields>({
        id: "user-1",
        role: "owner",
        shop_id: "shop-1",
        branch_id: "branch-1",
        username: "dat",
        is_first_login: false,
      });
    });
  });

  describe("callbacks", () => {
    it("should map user fields into jwt token", async () => {
      const _token = await authOptions.callbacks?.jwt?.({
        token: {
          id: "",
          role: "owner",
          shop_id: null,
          branch_id: null,
          username: "",
          is_first_login: false,
        },
        user: {
          id: "user-1",
          role: "barber",
          shop_id: "shop-1",
          branch_id: "branch-1",
          username: "dat",
          is_first_login: true,
        } as AuthUserFields,
      });

      expect(_token).toEqual({
        id: "user-1",
        role: "barber",
        shop_id: "shop-1",
        branch_id: "branch-1",
        username: "dat",
        is_first_login: true,
      });
    });

    it("should update the jwt first login flag from session updates", async () => {
      const _token = await authOptions.callbacks?.jwt?.({
        token: {
          id: "user-1",
          role: "owner",
          shop_id: "shop-1",
          branch_id: null,
          username: "dat",
          is_first_login: false,
        },
        trigger: "update",
        session: {
          user: {
            is_first_login: true,
          },
        },
      });

      expect(_token?.is_first_login).toBe(true);
    });

    it("should map token fields into session user", async () => {
      const _session = await authOptions.callbacks?.session?.({
        session: {
          user: {
            name: "Dat",
            email: "dat@example.com",
            image: null,
          },
        } as never,
        token: {
          id: "user-1",
          role: "owner",
          shop_id: "shop-1",
          branch_id: "branch-1",
          username: "dat",
          is_first_login: false,
        },
      });

      expect(_session?.user).toEqual({
        name: "Dat",
        email: "dat@example.com",
        image: null,
        id: "user-1",
        role: "owner",
        shop_id: "shop-1",
        branch_id: "branch-1",
        username: "dat",
        is_first_login: false,
      });
    });
  });
});
