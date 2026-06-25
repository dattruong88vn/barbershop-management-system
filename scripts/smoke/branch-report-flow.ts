import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_INACTIVE,
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

// Dừng smoke ngay khi dữ liệu thực tế lệch khỏi rule báo cáo chi nhánh.
function fail(message: string): never {
  throw new Error(message);
}

// Ghi nhận checkpoint đã pass để dễ đọc log smoke.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
  console.log(`[ok] ${message}`);
}

// Ép JSON unknown về object thường để kiểm response an toàn.
function asRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} is not an object.`);
  }
  return value as JsonRecord;
}

// Ép JSON unknown về array để kiểm collection trong response.
function asArray(value: unknown, label: string) {
  if (!Array.isArray(value)) fail(`${label} is not an array.`);
  return value;
}

// Đọc JSON response, hỗ trợ body rỗng khi API lỗi sớm.
async function readJson(response: Response) {
  const text = await response.text();
  return text ? asRecord(JSON.parse(text) as unknown, "JSON") : {};
}

// Gọi API thật trên dev server với cookie NextAuth smoke.
async function api(cookie: string, path: string) {
  const response = await fetch(new URL(path, baseUrl), {
    headers: { ...DEFAULT_JSON_HEADERS, Cookie: cookie },
  });
  return { data: await readJson(response), status: response.status };
}

// Tạo cookie NextAuth theo role để kiểm owner-only branch report.
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

// Tạo user smoke thuộc tenant hiện tại.
async function createUser(input: {
  branchId?: string;
  fullName: string;
  role: UserRoleValue;
}) {
  return prisma.user.create({
    data: {
      branchId: input.branchId,
      fullName: input.fullName,
      isFirstLogin: false,
      passwordHash: hashPassword(`SmokeBranchReport${stamp}!`),
      role: input.role,
      shopId,
      username: `smoke.branch-report.${input.role}.${stamp}.${input.fullName.length}`,
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

// Tạo một visit completed với service thường hoặc combo đã snapshot.
async function createCompletedVisit(input: {
  barberId: string;
  branch: { address: string; id: string; name: string };
  comboId?: string;
  customerId: string;
  receptionistId: string;
  skinnerId: string;
}) {
  const barberService = await prisma.service.create({
    data: {
      createdBy: input.receptionistId,
      name: `SMOKE Branch Barber Service ${stamp}.${input.branch.id.slice(0, 4)}`,
      price: 100000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_BARBER,
      shopId,
    },
  });
  const skinnerService = await prisma.service.create({
    data: {
      createdBy: input.receptionistId,
      name: `SMOKE Branch Skinner Service ${stamp}.${input.branch.id.slice(0, 4)}`,
      price: 80000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_SKINNER,
      shopId,
    },
  });

  return prisma.visit.create({
    data: {
      barberId: input.barberId,
      branchAddressSnapshot: input.branch.address,
      branchId: input.branch.id,
      branchNameSnapshot: input.branch.name,
      completedAt: new Date("2026-06-25T03:00:00.000Z"),
      createdBy: input.receptionistId,
      customerId: input.customerId,
      shopId,
      skinnerId: input.skinnerId,
      status: VISIT_STATUS_COMPLETED,
      totalPrice: 180000,
      visitServices: {
        create: input.comboId
          ? [
              {
                allocatedPrice: 100000,
                comboId: input.comboId,
                comboNameSnapshot: `SMOKE Combo ${stamp}`,
                comboPriceSnapshot: 180000,
                price: 100000,
                responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
                serviceId: barberService.id,
                serviceNameSnapshot: barberService.name,
                servicePriceSnapshot: 100000,
                shopId,
              },
              {
                allocatedPrice: 80000,
                comboId: input.comboId,
                comboNameSnapshot: `SMOKE Combo ${stamp}`,
                comboPriceSnapshot: 180000,
                price: 80000,
                responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_SKINNER,
                serviceId: skinnerService.id,
                serviceNameSnapshot: skinnerService.name,
                servicePriceSnapshot: 80000,
                shopId,
              },
            ]
          : [
              {
                allocatedPrice: 100000,
                price: 100000,
                responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
                serviceId: barberService.id,
                serviceNameSnapshot: barberService.name,
                servicePriceSnapshot: 100000,
                shopId,
              },
            ],
      },
    },
  });
}

// Dựng tenant với active branch, inactive branch và dữ liệu report riêng.
async function setup() {
  const shop = await prisma.shop.create({
    data: {
      address: `SMOKE Branch Report Address ${stamp}`,
      name: `SMOKE Branch Report Shop ${stamp}`,
      trialExpiresAt: new Date(Date.now() + 86400000),
    },
  });
  shopId = shop.id;
  const owner = await createUser({
    fullName: `SMOKE Branch Owner ${stamp}`,
    role: USER_ROLE_OWNER,
  });
  const activeBranch = await prisma.branch.create({
    data: {
      address: `SMOKE Active Branch Address ${stamp}`,
      name: `SMOKE Active Branch ${stamp}`,
      shopId,
      status: BRANCH_STATUS_ACTIVE,
    },
  });
  const inactiveBranch = await prisma.branch.create({
    data: {
      address: `SMOKE Inactive Branch Address ${stamp}`,
      deactivatedAt: new Date("2026-06-25T12:00:00.000Z"),
      name: `SMOKE Inactive Branch ${stamp}`,
      shopId,
      status: BRANCH_STATUS_INACTIVE,
    },
  });
  const manager = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Branch Manager ${stamp}`,
    role: USER_ROLE_MANAGER,
  });
  const receptionist = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Branch Reception ${stamp}`,
    role: USER_ROLE_RECEPTIONIST,
  });
  const barber = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Branch Barber ${stamp}`,
    role: USER_ROLE_BARBER,
  });
  const skinner = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Branch Skinner ${stamp}`,
    role: USER_ROLE_SKINNER,
  });
  const customer = await prisma.customer.create({
    data: {
      name: `SMOKE Branch Customer ${stamp}`,
      phone: `08${stamp.slice(-8)}`,
      shopId,
    },
  });
  const combo = await prisma.combo.create({
    data: {
      createdBy: owner.id,
      description: `SMOKE Combo Description ${stamp}`,
      name: `SMOKE Combo ${stamp}`,
      price: 180000,
      shopId,
    },
  });

  await createCompletedVisit({
    barberId: barber.id,
    branch: activeBranch,
    comboId: combo.id,
    customerId: customer.id,
    receptionistId: receptionist.id,
    skinnerId: skinner.id,
  });
  await createCompletedVisit({
    barberId: barber.id,
    branch: activeBranch,
    customerId: customer.id,
    receptionistId: receptionist.id,
    skinnerId: skinner.id,
  });
  await createCompletedVisit({
    barberId: barber.id,
    branch: inactiveBranch,
    customerId: customer.id,
    receptionistId: receptionist.id,
    skinnerId: skinner.id,
  });

  return { activeBranch, inactiveBranch, manager, owner };
}

// Kiểm owner-only, status filter, inactive branch lịch sử, item count và detail paging.
async function run() {
  await fetch(new URL("/api/auth/session", baseUrl));
  const context = await setup();
  const ownerCookie = await cookieFor(context.owner);
  const managerCookie = await cookieFor(context.manager, context.activeBranch.id);
  const range = {
    fromDate: "2026-06-25",
    toDate: "2026-06-25",
  };

  const ownerResponse = await api(
    ownerCookie,
    API_ROUTES.branchReport({ ...range }),
  );
  assert(ownerResponse.status === 200, "owner can load branch report");
  const rows = asArray(
    asRecord(ownerResponse.data.report, "report").rows,
    "rows",
  ).map((row) => asRecord(row, "row"));
  const activeRow = rows.find(
    (row) => row.branchId === context.activeBranch.id,
  );
  const inactiveRow = rows.find(
    (row) => row.branchId === context.inactiveBranch.id,
  );
  assert(Boolean(inactiveRow), "inactive branch is kept when active in range");
  assert(
    activeRow?.serviceCount === 2 && activeRow?.revenue === 280000,
    "branch report counts one combo as one item and sums allocated revenue",
  );

  const inactiveResponse = await api(
    ownerCookie,
    API_ROUTES.branchReport({ ...range, status: BRANCH_STATUS_INACTIVE }),
  );
  const inactiveRows = asArray(
    asRecord(inactiveResponse.data.report, "inactive report").rows,
    "inactive rows",
  );
  assert(
    inactiveResponse.status === 200 && inactiveRows.length === 1,
    "branch status filter is applied by the API",
  );

  const managerResponse = await api(
    managerCookie,
    API_ROUTES.branchReport({ ...range }),
  );
  assert(managerResponse.status === 403, "manager cannot load branch report");

  const invalidRange = await api(
    ownerCookie,
    API_ROUTES.branchReport({
      fromDate: "2026-06-26",
      toDate: "2026-06-25",
    }),
  );
  assert(invalidRange.status === 400, "invalid branch report date range returns 400");

  const detailPageOne = await api(
    ownerCookie,
    API_ROUTES.branchReportDetails({
      ...range,
      branchId: context.activeBranch.id,
      page: 1,
      pageSize: 1,
    }),
  );
  const detailReport = asRecord(detailPageOne.data.report, "detail report");
  const pagination = asRecord(detailReport.pagination, "pagination");
  assert(
    detailPageOne.status === 200 &&
      pagination.total === 2 &&
      pagination.totalPages === 2 &&
      asArray(detailReport.details, "details").length === 1,
    "branch detail uses paginated database results",
  );
}

// Xóa tenant smoke cùng dữ liệu con sau khi chạy xong.
async function cleanup() {
  if (shopId) {
    await prisma.shop.delete({ where: { id: shopId } }).catch(() => undefined);
  }
  await prisma.$disconnect();
}

console.log(`Running branch report smoke against ${baseUrl}`);
run()
  .then(() => console.log("Branch report smoke passed."))
  .finally(cleanup)
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
