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

type AuthCallbacks = NonNullable<typeof authOptions.callbacks>;
type JwtCallbackParams = Parameters<NonNullable<AuthCallbacks["jwt"]>>[0];
type SessionCallbackParams = Parameters<
  NonNullable<AuthCallbacks["session"]>
>[0];

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
  describe("session", () => {
    it("should keep jwt sessions for 30 days", () => {
      const thirtyDaysInSeconds = 60 * 60 * 24 * 30;

      expect(authOptions.session?.strategy).toBe("jwt");
      expect(authOptions.session?.maxAge).toBe(thirtyDaysInSeconds);
      expect(authOptions.session?.updateAge).toBe(60 * 60 * 24);
      expect(authOptions.jwt?.maxAge).toBe(thirtyDaysInSeconds);
    });
  });

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
        where: { username: "dat", status: "active" },
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

      const expectedUser = {
        id: "user-1",
        role: "owner",
        shop_id: "shop-1",
        branch_id: "branch-1",
        username: "dat",
        is_first_login: false,
      } satisfies AuthUserFields;

      await expect(
        authorize({
          username: "dat",
          password: "Secret123!",
        }),
      ).resolves.toEqual(expectedUser);
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
        account: null,
      } as JwtCallbackParams);

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
        user: undefined,
        account: null,
      } as unknown as JwtCallbackParams);

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
        user: undefined,
      } as unknown as SessionCallbackParams);

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
