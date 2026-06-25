import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

import {
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  USER_ROLE_BARBER,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_SKINNER,
  VISIT_STATUS_COMPLETED,
  type UserRoleValue,
} from "../../src/constants/common";
import { API_ROUTES } from "../../src/constants/routes";
import { DEFAULT_JSON_HEADERS } from "../../src/lib/apiConfig";
import { hashPassword } from "../../src/lib/password";

type JsonRecord = Record<string, unknown>;

type SmokeUser = {
  branchId: string | null;
  fullName: string | null;
  id: string;
  role: UserRoleValue;
  shopId: string | null;
  status: "active" | "inactive" | "branch_suspended";
  username: string;
};

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.NEXTAUTH_SECRET;
const stamp = Date.now().toString();
let shopId = "";

// Dừng smoke ngay khi response hoặc dữ liệu nền không đúng kỳ vọng.
function fail(message: string): never {
  throw new Error(message);
}

// Xác nhận một checkpoint nghiệp vụ và in tiến độ khi checkpoint pass.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
  console.log(`[ok] ${message}`);
}

// Ép JSON unknown về object thường mà không dùng any.
function asRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} is not an object.`);
  }
  return value as JsonRecord;
}

// Ép JSON unknown về array để kiểm các collection trong response.
function asArray(value: unknown, label: string) {
  if (!Array.isArray(value)) fail(`${label} is not an array.`);
  return value;
}

// Đọc JSON response, hỗ trợ cả response body rỗng.
async function readJson(response: Response) {
  const text = await response.text();
  return text ? asRecord(JSON.parse(text) as unknown, "JSON") : {};
}

// Gọi API thật trên dev server với session cookie được truyền vào.
async function api(cookie: string, path: string) {
  const response = await fetch(new URL(path, baseUrl), {
    headers: { ...DEFAULT_JSON_HEADERS, Cookie: cookie },
  });
  return { data: await readJson(response), status: response.status };
}

// Tạo cookie NextAuth theo role và active branch để kiểm scope report.
async function cookieFor(user: SmokeUser, activeBranchId = user.branchId) {
  if (!secret) fail("NEXTAUTH_SECRET is required.");
  const token = await encode({
    secret,
    token: {
      active_branch_id: activeBranchId,
      branch_id: user.branchId,
      full_name: user.fullName,
      id: user.id,
      is_first_login: false,
      role: user.role,
      shop_id: user.shopId,
      status: user.status,
      username: user.username,
    },
  });
  return `next-auth.session-token=${token}; __Secure-next-auth.session-token=${token}`;
}

// Tạo user smoke thuộc shop hiện tại với role/status cần kiểm.
async function createUser(input: {
  branchId?: string;
  fullName: string;
  role: UserRoleValue;
  status?: "active" | "inactive";
}) {
  return prisma.user.create({
    data: {
      branchId: input.branchId,
      fullName: input.fullName,
      isFirstLogin: false,
      passwordHash: hashPassword(`SmokeStaffReport${stamp}!`),
      role: input.role,
      shopId,
      status: input.status ?? "active",
      username: `smoke.staff-report.${input.role}.${stamp}.${input.fullName.length}`,
    },
    select: {
      branchId: true,
      fullName: true,
      id: true,
      role: true,
      shopId: true,
      status: true,
      username: true,
    },
  });
}

// Dựng tenant, branch, staff và completed visits riêng cho staff report smoke.
async function setup() {
  const shop = await prisma.shop.create({
    data: {
      address: `SMOKE Staff Report Address ${stamp}`,
      name: `SMOKE Staff Report Shop ${stamp}`,
      trialExpiresAt: new Date(Date.now() + 86400000),
    },
  });
  shopId = shop.id;
  const owner = await createUser({
    fullName: `SMOKE Owner ${stamp}`,
    role: USER_ROLE_OWNER,
  });
  const branch = await prisma.branch.create({
    data: {
      address: `SMOKE Branch Address ${stamp}`,
      name: `SMOKE Branch ${stamp}`,
      shopId,
    },
  });
  const manager = await createUser({
    fullName: `SMOKE Manager ${stamp}`,
    role: USER_ROLE_MANAGER,
  });
  await prisma.branch.update({
    data: { managerId: manager.id },
    where: { id: branch.id },
  });
  const receptionist = await createUser({
    branchId: branch.id,
    fullName: `SMOKE Reception ${stamp}`,
    role: USER_ROLE_RECEPTIONIST,
  });
  const barber = await createUser({
    branchId: branch.id,
    fullName: `SMOKE Barber ${stamp}`,
    role: USER_ROLE_BARBER,
  });
  const inactiveSkinner = await createUser({
    branchId: branch.id,
    fullName: `SMOKE Inactive Skinner ${stamp}`,
    role: USER_ROLE_SKINNER,
    status: "inactive",
  });
  const customer = await prisma.customer.create({
    data: {
      name: `SMOKE Customer ${stamp}`,
      phone: `09${stamp.slice(-8)}`,
      shopId,
    },
  });
  const barberService = await prisma.service.create({
    data: {
      createdBy: owner.id,
      name: `SMOKE Barber Service ${stamp}`,
      price: 100000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_BARBER,
      shopId,
    },
  });
  const skinnerService = await prisma.service.create({
    data: {
      createdBy: owner.id,
      name: `SMOKE Skinner Service ${stamp}`,
      price: 80000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_SKINNER,
      shopId,
    },
  });
  const completedAt = new Date("2026-06-25T03:00:00.000Z");

  for (let index = 0; index < 2; index += 1) {
    await prisma.visit.create({
      data: {
        barberId: barber.id,
        branchAddressSnapshot: branch.address,
        branchId: branch.id,
        branchNameSnapshot: branch.name,
        completedAt,
        createdBy: receptionist.id,
        customerId: customer.id,
        shopId,
        status: VISIT_STATUS_COMPLETED,
        totalPrice: 180000,
        visitServices: {
          create: [
            {
              allocatedPrice: 100000,
              price: 100000,
              responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
              serviceId: barberService.id,
              serviceNameSnapshot: barberService.name,
              servicePriceSnapshot: 100000,
              shopId,
            },
            {
              allocatedPrice: 80000,
              price: 80000,
              responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_SKINNER,
              serviceId: skinnerService.id,
              serviceNameSnapshot: skinnerService.name,
              servicePriceSnapshot: 80000,
              shopId,
            },
          ],
        },
      },
    });
  }

  return { barber, branch, inactiveSkinner, manager, owner };
}

// Chạy các checkpoint date range, scope, filter, inactive, unknown và pagination.
async function run() {
  await fetch(new URL("/api/auth/session", baseUrl));
  const context = await setup();
  const ownerCookie = await cookieFor(context.owner);
  const managerCookie = await cookieFor(context.manager, context.branch.id);
  const range = {
    fromDate: "2026-06-25",
    toDate: "2026-06-25",
  };

  const ownerResponse = await api(
    ownerCookie,
    API_ROUTES.staffReport({ ...range, branchId: context.branch.id }),
  );
  assert(ownerResponse.status === 200, "owner can load branch staff report");
  const ownerRows = asArray(
    asRecord(ownerResponse.data.report, "report").rows,
    "rows",
  ).map((row) => asRecord(row, "row"));
  assert(
    ownerRows.some((row) => row.staffId === context.inactiveSkinner.id),
    "staff report keeps inactive staff for historical reporting",
  );
  assert(
    ownerRows.some((row) => row.staffId === "unknown"),
    "missing skinner assignment is grouped under unknown",
  );

  const filteredResponse = await api(
    ownerCookie,
    API_ROUTES.staffReport({
      ...range,
      branchId: context.branch.id,
      role: USER_ROLE_BARBER,
      search: "SMOKE Barber",
    }),
  );
  const filteredRows = asArray(
    asRecord(filteredResponse.data.report, "filtered report").rows,
    "filtered rows",
  );
  assert(
    filteredResponse.status === 200 && filteredRows.length === 1,
    "role and staff search filters are applied by the API",
  );

  const managerResponse = await api(
    managerCookie,
    API_ROUTES.staffReport({ ...range }),
  );
  assert(
    managerResponse.status === 200 &&
      asRecord(managerResponse.data.report, "manager report").branchId ===
        context.branch.id,
    "manager report is scoped to active managed branch",
  );

  const invalidRange = await api(
    ownerCookie,
    API_ROUTES.staffReport({
      branchId: context.branch.id,
      fromDate: "2026-06-26",
      toDate: "2026-06-25",
    }),
  );
  assert(invalidRange.status === 400, "invalid date range returns 400");

  const detailPageOne = await api(
    ownerCookie,
    API_ROUTES.staffReportDetails({
      ...range,
      branchId: context.branch.id,
      page: 1,
      pageSize: 1,
      staffId: context.barber.id,
    }),
  );
  const pageOneReport = asRecord(detailPageOne.data.report, "detail report");
  const pageOnePagination = asRecord(pageOneReport.pagination, "pagination");
  assert(
    detailPageOne.status === 200 &&
      pageOnePagination.total === 2 &&
      pageOnePagination.totalPages === 2 &&
      asArray(pageOneReport.details, "details").length === 1,
    "staff detail uses paginated database results",
  );
}

// Xóa tenant smoke cùng dữ liệu con sau khi hoàn tất.
async function cleanup() {
  if (shopId) {
    await prisma.shop.delete({ where: { id: shopId } }).catch(() => undefined);
  }
  await prisma.$disconnect();
}

console.log(`Running staff report smoke against ${baseUrl}`);
run()
  .then(() => console.log("Staff report smoke passed."))
  .finally(cleanup)
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
