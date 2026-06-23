import { PrismaClient } from "@prisma/client";

import {
  USER_ROLE_RECEPTIONIST,
  type UserRoleValue,
} from "../../src/constants/common";
import { API_ROUTES, ROUTES } from "../../src/constants/routes";
import { DEFAULT_JSON_HEADERS } from "../../src/lib/apiConfig";
import { hashPassword } from "../../src/lib/password";
import type { UserStatus } from "../../src/types/auth";

type JsonRecord = Record<string, unknown>;

type SmokeUserInput = {
  isFirstLogin: boolean;
  password: string;
  role: UserRoleValue;
  status: UserStatus;
  username: string;
};

type SignInResult = {
  body: JsonRecord;
  cookie: string;
  status: number;
};

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const stamp = Date.now().toString();
const createdUserIds: string[] = [];

// In ra một bước đã qua để người chạy biết smoke đang kiểm tra tới đâu.
function logStep(message: string) {
  console.log(`[ok] ${message}`);
}

// Dừng smoke ngay khi gặp lỗi khiến kết quả không còn đáng tin.
function fail(message: string): never {
  throw new Error(message);
}

// Kiểm tra một kỳ vọng trong auth flow và ghi log khi kỳ vọng đúng.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    fail(message);
  }

  logStep(message);
}

// Ép response JSON về object thường để đọc payload mà không dùng any.
function asRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} response is not an object.`);
  }

  return value as JsonRecord;
}

// Ghép nhiều Set-Cookie header thành Cookie header cho các request sau.
function toCookieHeader(headers: Headers) {
  const getSetCookie = "getSetCookie" in headers ? headers.getSetCookie : null;
  const cookies =
    typeof getSetCookie === "function"
      ? getSetCookie.call(headers)
      : [headers.get("set-cookie") ?? ""];

  return cookies
    .flatMap((cookie) => cookie.split(/,\s*(?=[^;,]+=)/))
    .map((cookie) => cookie.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

// Đọc JSON response; nếu response rỗng thì trả object rỗng để assert dễ hơn.
async function readJson(response: Response) {
  const text = await response.text();
  return text ? asRecord(JSON.parse(text) as unknown, "JSON") : {};
}

// Gọi API thật của dev server với JSON headers chuẩn.
async function api(
  path: string,
  options: {
    body?: JsonRecord;
    cookie?: string;
    method?: "GET" | "POST";
  } = {},
) {
  const response = await fetch(new URL(path, baseUrl), {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      ...DEFAULT_JSON_HEADERS,
      ...(options.cookie ? { Cookie: options.cookie } : {}),
    },
    method: options.method ?? "GET",
    redirect: "manual",
  });

  return {
    body: await readJson(response),
    headers: response.headers,
    status: response.status,
  };
}

// Kiểm tra dev server đã sẵn sàng trước khi tạo user smoke và gọi NextAuth.
async function assertServerIsRunning() {
  try {
    await fetch(new URL("/api/auth/session", baseUrl));
  } catch {
    fail(`Dev server is not reachable at ${baseUrl}. Start it with npm run dev -- -p 3000.`);
  }
}

// Lấy CSRF token của NextAuth để POST credentials callback như form login thật.
async function getCsrfToken() {
  const response = await api("/api/auth/csrf");
  const csrfToken =
    typeof response.body.csrfToken === "string" ? response.body.csrfToken : "";

  if (!csrfToken) {
    fail("NextAuth did not return a CSRF token.");
  }

  return csrfToken;
}

// Đăng nhập qua credentials callback thật và trả cookie session nếu thành công.
async function signIn(username: string, password: string): Promise<SignInResult> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(new URL("/api/auth/callback/credentials", baseUrl), {
    body: new URLSearchParams({
      csrfToken,
      json: "true",
      password,
      redirect: "false",
      username,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    redirect: "manual",
  });

  return {
    body: await readJson(response),
    cookie: toCookieHeader(response.headers),
    status: response.status,
  };
}

// Lấy session hiện tại để kiểm tra token user đã được NextAuth ghi đúng.
async function getSession(cookie: string) {
  return api("/api/auth/session", { cookie });
}

// Gọi một route page qua middleware và trả Location redirect nếu có.
async function getPageRedirect(path: string, cookie: string) {
  const response = await fetch(new URL(path, baseUrl), {
    headers: { Cookie: cookie },
    redirect: "manual",
  });

  return {
    location: response.headers.get("location") ?? "",
    status: response.status,
  };
}

// Tìm shop/branch active để user smoke có tenant và branch hợp lệ.
async function findActiveBranchContext() {
  const branch = await prisma.branch.findFirst({
    where: {
      shop: { status: "active" },
      status: "active",
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      shopId: true,
    },
  });

  if (!branch) {
    fail("No active branch was found for auth smoke.");
  }

  return branch;
}

// Tạo user smoke riêng để kiểm tra auth mà không đụng tài khoản thật.
async function createSmokeUser(
  input: SmokeUserInput,
  context: {
    branchId: string;
    shopId: string;
  },
) {
  const user = await prisma.user.create({
    data: {
      branchId: context.branchId,
      fullName: `SMOKE Auth ${stamp}`,
      isFirstLogin: input.isFirstLogin,
      passwordHash: hashPassword(input.password),
      role: input.role,
      shopId: context.shopId,
      status: input.status,
      username: input.username,
    },
    select: { id: true },
  });

  createdUserIds.push(user.id);

  return user.id;
}

// Đổi mật khẩu bằng API thật để kiểm tra first-login flow cập nhật DB.
async function changePassword(cookie: string, password: string) {
  return api(API_ROUTES.changePassword, {
    body: {
      confirmPassword: password,
      password,
    },
    cookie,
    method: "POST",
  });
}

// Xoá các user smoke vừa tạo nếu chúng chưa phát sinh dữ liệu nghiệp vụ khác.
async function cleanupSmokeUsers() {
  if (!createdUserIds.length) {
    return;
  }

  await prisma.user.deleteMany({
    where: {
      id: { in: createdUserIds },
      username: { startsWith: "smoke.auth." },
    },
  });
}

// Điều phối toàn bộ auth smoke: login, first-login, đổi mật khẩu, suspended/inactive.
async function run() {
  await assertServerIsRunning();
  const context = await findActiveBranchContext();
  const firstLoginUsername = `smoke.auth.first.${stamp}`;
  const suspendedUsername = `smoke.auth.suspended.${stamp}`;
  const inactiveUsername = `smoke.auth.inactive.${stamp}`;
  const initialPassword = `SmokeOld${stamp}!`;
  const nextPassword = `SmokeNew${stamp}!`;

  await createSmokeUser(
    {
      isFirstLogin: true,
      password: initialPassword,
      role: USER_ROLE_RECEPTIONIST,
      status: "active",
      username: firstLoginUsername,
    },
    { branchId: context.id, shopId: context.shopId },
  );
  await createSmokeUser(
    {
      isFirstLogin: false,
      password: initialPassword,
      role: USER_ROLE_RECEPTIONIST,
      status: "branch_suspended",
      username: suspendedUsername,
    },
    { branchId: context.id, shopId: context.shopId },
  );
  await createSmokeUser(
    {
      isFirstLogin: false,
      password: initialPassword,
      role: USER_ROLE_RECEPTIONIST,
      status: "inactive",
      username: inactiveUsername,
    },
    { branchId: context.id, shopId: context.shopId },
  );

  const badLogin = await signIn(firstLoginUsername, "wrong-password");
  assert(badLogin.status === 401, "wrong password is rejected");

  const firstLogin = await signIn(firstLoginUsername, initialPassword);
  assert(firstLogin.status === 200 && firstLogin.cookie, "first-login user can sign in");
  const firstLoginSession = await getSession(firstLogin.cookie);
  const firstLoginUser = asRecord(firstLoginSession.body.user, "First-login session user");
  assert(firstLoginUser.is_first_login === true, "session marks first-login user");

  const protectedRedirect = await getPageRedirect(ROUTES.customers, firstLogin.cookie);
  assert(
    protectedRedirect.status >= 300 &&
      protectedRedirect.status < 400 &&
      protectedRedirect.location.includes(ROUTES.changePassword),
    "first-login user is redirected to change password",
  );

  const passwordChange = await changePassword(firstLogin.cookie, nextPassword);
  assert(passwordChange.status === 200, "first-login user can change password");
  assert(
    passwordChange.body.redirectTo === ROUTES.customers,
    "change password returns staff workspace redirect",
  );

  const oldPasswordLogin = await signIn(firstLoginUsername, initialPassword);
  assert(oldPasswordLogin.status === 401, "old password is rejected after change");

  const newPasswordLogin = await signIn(firstLoginUsername, nextPassword);
  assert(newPasswordLogin.status === 200 && newPasswordLogin.cookie, "new password can sign in");
  const changedSession = await getSession(newPasswordLogin.cookie);
  const changedUser = asRecord(changedSession.body.user, "Changed session user");
  assert(changedUser.is_first_login === false, "new login is no longer first-login");

  const workspaceAccess = await getPageRedirect(ROUTES.customers, newPasswordLogin.cookie);
  assert(workspaceAccess.status === 200, "changed user can access staff workspace");

  const suspendedLogin = await signIn(suspendedUsername, initialPassword);
  assert(suspendedLogin.status === 200 && suspendedLogin.cookie, "branch_suspended user can sign in");
  const suspendedRedirect = await getPageRedirect(ROUTES.customers, suspendedLogin.cookie);
  assert(
    suspendedRedirect.status >= 300 &&
      suspendedRedirect.status < 400 &&
      suspendedRedirect.location.includes(ROUTES.branchUnavailable),
    "branch_suspended user is redirected to branch unavailable",
  );

  const branchUnavailable = await getPageRedirect(
    ROUTES.branchUnavailable,
    suspendedLogin.cookie,
  );
  assert(branchUnavailable.status === 200, "branch_suspended user can view unavailable page");

  const inactiveLogin = await signIn(inactiveUsername, initialPassword);
  assert(inactiveLogin.status === 401, "inactive user cannot sign in");

  console.log("Auth smoke passed.");
}

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanupSmokeUsers();
    await prisma.$disconnect();
  });
