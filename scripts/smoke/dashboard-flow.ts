import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_INACTIVE,
  REPORT_PERIOD_ALL,
  REPORT_PERIOD_MONTH,
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  VISIT_STATUS_COMPLETED,
  type UserRoleValue,
} from "../../src/constants/common";
import { API_ROUTES } from "../../src/constants/routes";
import { DEFAULT_JSON_HEADERS } from "../../src/lib/apiConfig";
import { hashPassword } from "../../src/lib/password";
import type { UserStatus } from "../../src/types/auth";

type JsonRecord = Record<string, unknown>;

type SmokeUser = {
  id: string;
  branchId: string | null;
  fullName: string | null;
  role: UserRoleValue;
  shopId: string | null;
  status: UserStatus;
  username: string;
};

type TenantSmokeUser = SmokeUser & {
  shopId: string;
};

type SmokeBranch = {
  id: string;
  address: string;
  name: string;
};

type SmokeContext = {
  activeBranch: SmokeBranch;
  inactiveBranch: SmokeBranch;
  manager: SmokeUser;
  otherBranch: SmokeBranch;
  owner: TenantSmokeUser;
  shopId: string;
};

type ApiResponse = {
  data: JsonRecord;
  status: number;
};

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.NEXTAUTH_SECRET;
const stamp = Date.now().toString();
const createdBranchIds: string[] = [];
const createdCustomerIds: string[] = [];
const createdServiceIds: string[] = [];
const createdShopIds: string[] = [];
const createdUserIds: string[] = [];
const createdVisitIds: string[] = [];

// In tiến độ từng checkpoint dashboard để người chạy smoke thấy đang kiểm gì.
function logStep(message: string) {
  console.log(`[ok] ${message}`);
}

// Dừng dashboard smoke ngay khi dữ liệu nền hoặc response không đúng kỳ vọng.
function fail(message: string): never {
  throw new Error(message);
}

// Kiểm tra một kỳ vọng của dashboard API và log khi kỳ vọng đúng.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    fail(message);
  }

  logStep(message);
}

// Ép unknown JSON về object thường để đọc payload mà không dùng any.
function asRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} response is not an object.`);
  }

  return value as JsonRecord;
}

// Đọc JSON response từ API; nếu rỗng thì trả object rỗng.
async function readJson(response: Response): Promise<JsonRecord> {
  const text = await response.text();
  return text ? asRecord(JSON.parse(text) as unknown, "JSON") : {};
}

// Gọi dashboard API thật trên dev server với session cookie tương ứng.
async function api(cookie: string, path: string): Promise<ApiResponse> {
  const response = await fetch(new URL(path, baseUrl), {
    headers: {
      ...DEFAULT_JSON_HEADERS,
      Cookie: cookie,
    },
  });

  return {
    data: await readJson(response),
    status: response.status,
  };
}

// Tạo NextAuth JWT cookie để smoke gọi API đúng role và branch context.
async function cookieFor(user: SmokeUser, branchId = user.branchId) {
  if (!secret) {
    fail("NEXTAUTH_SECRET is required. Run with .env.local loaded.");
  }

  const token = await encode({
    secret,
    token: {
      active_branch_id: branchId,
      branch_id: branchId,
      full_name: user.fullName,
      id: user.id,
      is_first_login: false,
      role: user.role,
      shop_id: user.shopId,
      status: user.status,
      username: user.username,
    },
  });

  return [
    `next-auth.session-token=${token}`,
    `__Secure-next-auth.session-token=${token}`,
  ].join("; ");
}

// Kiểm tra dev server đang chạy trước khi tạo dữ liệu smoke.
async function assertServerIsRunning() {
  try {
    await fetch(new URL("/api/auth/session", baseUrl));
  } catch {
    fail(`Dev server is not reachable at ${baseUrl}. Start it with npm run dev -- -p 3000.`);
  }
}

// Tạo shop + owner riêng để dashboard all-branches không nhiễu dữ liệu dev có sẵn.
async function createOwnerContext(): Promise<TenantSmokeUser> {
  const shop = await prisma.shop.create({
    data: {
      address: `SMOKE Dashboard Shop Address ${stamp}`,
      name: `SMOKE Dashboard Shop ${stamp}`,
      trialExpiresAt: new Date(Date.now() + 86400000),
    },
    select: { id: true },
  });
  createdShopIds.push(shop.id);

  const owner = await prisma.user.create({
    data: {
      fullName: `SMOKE Dashboard Owner ${stamp}`,
      isFirstLogin: false,
      passwordHash: hashPassword(`SmokeDashboardOwner${stamp}!`),
      role: USER_ROLE_OWNER,
      shopId: shop.id,
      status: "active",
      username: `smoke.dashboard.owner.${stamp}`,
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
  createdUserIds.push(owner.id);

  return {
    ...owner,
    shopId: shop.id,
  };
}

// Tạo branch smoke, có thể inactive, để kiểm owner filter cả dữ liệu lịch sử.
async function createBranch(input: {
  shopId: string;
  status?: typeof BRANCH_STATUS_ACTIVE | typeof BRANCH_STATUS_INACTIVE;
  suffix: string;
}): Promise<SmokeBranch> {
  const branch = await prisma.branch.create({
    data: {
      address: `SMOKE Dashboard Address ${stamp}-${input.suffix}`,
      name: `SMOKE Dashboard Branch ${stamp}-${input.suffix}`,
      shopId: input.shopId,
      status: input.status ?? BRANCH_STATUS_ACTIVE,
    },
    select: {
      address: true,
      id: true,
      name: true,
    },
  });

  createdBranchIds.push(branch.id);

  return branch;
}

// Tạo manager smoke được assign vào branch active để kiểm scope dashboard.
async function createManager(shopId: string, branchId: string): Promise<SmokeUser> {
  const manager = await prisma.user.create({
    data: {
      fullName: `SMOKE Dashboard Manager ${stamp}`,
      isFirstLogin: false,
      passwordHash: hashPassword(`SmokeDashboardManager${stamp}!`),
      role: USER_ROLE_MANAGER,
      shopId,
      status: "active",
      username: `smoke.dashboard.manager.${stamp}`,
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

  createdUserIds.push(manager.id);

  await prisma.branch.update({
    where: { id: branchId },
    data: { managerId: manager.id },
  });

  return manager;
}

// Tạo service snapshot nguồn để visit_services có serviceId hợp lệ cho dashboard top/warning.
async function createService(shopId: string, createdBy: string) {
  const service = await prisma.service.create({
    data: {
      createdBy,
      isHaircut: true,
      name: `SMOKE Dashboard Haircut ${stamp}`,
      price: 100000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_BARBER,
      shopId,
    },
    select: { id: true },
  });

  createdServiceIds.push(service.id);

  return service.id;
}

// Tạo customer smoke để dựng các tình huống khách mới/quay lại.
async function createCustomer(shopId: string, suffix: string) {
  const customer = await prisma.customer.create({
    data: {
      name: `SMOKE Dashboard Customer ${stamp}-${suffix}`,
      phone: `09${stamp.slice(-7)}${createdCustomerIds.length}`,
      shopId,
    },
    select: { id: true },
  });

  createdCustomerIds.push(customer.id);

  return customer.id;
}

// Tạo visit completed cùng một dòng service snapshot để dashboard cộng doanh thu.
async function createCompletedVisit(input: {
  branch: SmokeBranch;
  completedAt: Date;
  createdBy: string;
  customerId: string;
  serviceId: string;
  shopId: string;
}) {
  const visit = await prisma.visit.create({
    data: {
      branchAddressSnapshot: input.branch.address,
      branchId: input.branch.id,
      branchNameSnapshot: input.branch.name,
      completedAt: input.completedAt,
      createdBy: input.createdBy,
      customerId: input.customerId,
      shopId: input.shopId,
      status: VISIT_STATUS_COMPLETED,
      totalPrice: 100000,
      visitServices: {
        create: {
          allocatedPrice: 100000,
          price: 100000,
          responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
          serviceId: input.serviceId,
          serviceNameSnapshot: `SMOKE Dashboard Haircut ${stamp}`,
          servicePriceSnapshot: 100000,
          shopId: input.shopId,
        },
      },
    },
    select: { id: true },
  });

  createdVisitIds.push(visit.id);
}

// Chuẩn bị dữ liệu cố ý: nhiều branch, inactive branch, khách mới và khách quay lại.
async function setupContext(): Promise<SmokeContext> {
  const owner = await createOwnerContext();
  const activeBranch = await createBranch({
    shopId: owner.shopId,
    suffix: "active",
  });
  const otherBranch = await createBranch({
    shopId: owner.shopId,
    suffix: "other",
  });
  const inactiveBranch = await createBranch({
    shopId: owner.shopId,
    status: BRANCH_STATUS_INACTIVE,
    suffix: "inactive",
  });
  const manager = await createManager(owner.shopId, activeBranch.id);
  const serviceId = await createService(owner.shopId, owner.id);
  const currentDate = new Date();
  const currentPeriodDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    10,
    12,
  );
  const previousPeriodDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    10,
    12,
  );
  const newActiveCustomerId = await createCustomer(owner.shopId, "new-active");
  const returningCustomerId = await createCustomer(owner.shopId, "returning");
  const samePeriodRepeatCustomerId = await createCustomer(
    owner.shopId,
    "same-period-repeat",
  );
  const otherBranchCustomerId = await createCustomer(owner.shopId, "other");
  const inactiveBranchCustomerId = await createCustomer(owner.shopId, "inactive");

  await createCompletedVisit({
    branch: activeBranch,
    completedAt: currentPeriodDate,
    createdBy: owner.id,
    customerId: newActiveCustomerId,
    serviceId,
    shopId: owner.shopId,
  });
  await createCompletedVisit({
    branch: activeBranch,
    completedAt: previousPeriodDate,
    createdBy: owner.id,
    customerId: returningCustomerId,
    serviceId,
    shopId: owner.shopId,
  });
  await createCompletedVisit({
    branch: activeBranch,
    completedAt: currentPeriodDate,
    createdBy: owner.id,
    customerId: returningCustomerId,
    serviceId,
    shopId: owner.shopId,
  });
  await createCompletedVisit({
    branch: activeBranch,
    completedAt: currentPeriodDate,
    createdBy: owner.id,
    customerId: samePeriodRepeatCustomerId,
    serviceId,
    shopId: owner.shopId,
  });
  await createCompletedVisit({
    branch: activeBranch,
    completedAt: new Date(
      currentPeriodDate.getFullYear(),
      currentPeriodDate.getMonth(),
      currentPeriodDate.getDate() + 1,
      12,
    ),
    createdBy: owner.id,
    customerId: samePeriodRepeatCustomerId,
    serviceId,
    shopId: owner.shopId,
  });
  await createCompletedVisit({
    branch: otherBranch,
    completedAt: currentPeriodDate,
    createdBy: owner.id,
    customerId: otherBranchCustomerId,
    serviceId,
    shopId: owner.shopId,
  });
  await createCompletedVisit({
    branch: inactiveBranch,
    completedAt: currentPeriodDate,
    createdBy: owner.id,
    customerId: inactiveBranchCustomerId,
    serviceId,
    shopId: owner.shopId,
  });

  return {
    activeBranch,
    inactiveBranch,
    manager,
    otherBranch,
    owner,
    shopId: owner.shopId,
  };
}

// Lấy dashboard object từ response API.
function readDashboard(data: JsonRecord) {
  return asRecord(data.dashboard, "dashboard");
}

// Lấy value của một metric theo label tiếng Việt dashboard đang trả về.
function readMetric(dashboard: JsonRecord, label: string) {
  const metrics = Array.isArray(dashboard.metrics) ? dashboard.metrics : [];
  const metric = metrics
    .map((item) => asRecord(item, "metric"))
    .find((item) => item.label === label);

  if (!metric || typeof metric.value !== "string") {
    fail(`Dashboard metric ${label} is missing.`);
  }

  return metric.value;
}

// Kiểm số visit metric và customer metric trên payload dashboard.
function assertDashboardMetrics(
  dashboard: JsonRecord,
  expected: {
    branchId: string | null;
    newCustomers: string;
    returningCustomers: string;
    totalVisits: string;
  },
  message: string,
) {
  assert(
    dashboard.branchId === expected.branchId &&
      readMetric(dashboard, "Tổng visit") === expected.totalVisits &&
      readMetric(dashboard, "Khách mới") === expected.newCustomers &&
      readMetric(dashboard, "Khách quay lại") === expected.returningCustomers,
    message,
  );
}

// Kiểm owner mặc định xem tất cả branch, và branch filter chỉ lấy đúng branch.
async function smokeOwnerDashboard(context: SmokeContext, ownerCookie: string) {
  const allResponse = await api(
    ownerCookie,
    API_ROUTES.dashboard({ month: undefined, period: REPORT_PERIOD_MONTH }),
  );
  assert(allResponse.status === 200, "owner can load dashboard across all branches");
  assertDashboardMetrics(
    readDashboard(allResponse.data),
    {
      branchId: null,
      newCustomers: "4",
      returningCustomers: "1",
      totalVisits: "6",
    },
    "owner all-branch dashboard counts first-completed and returning customers",
  );

  const branchResponse = await api(
    ownerCookie,
    API_ROUTES.dashboard({
      branchId: context.activeBranch.id,
      period: REPORT_PERIOD_MONTH,
    }),
  );
  assert(branchResponse.status === 200, "owner can filter dashboard by active branch");
  assertDashboardMetrics(
    readDashboard(branchResponse.data),
    {
      branchId: context.activeBranch.id,
      newCustomers: "2",
      returningCustomers: "1",
      totalVisits: "4",
    },
    "owner active-branch dashboard excludes other branches",
  );

  const inactiveResponse = await api(
    ownerCookie,
    API_ROUTES.dashboard({
      branchId: context.inactiveBranch.id,
      period: REPORT_PERIOD_MONTH,
    }),
  );
  assert(inactiveResponse.status === 200, "owner can filter dashboard by inactive branch");
  assertDashboardMetrics(
    readDashboard(inactiveResponse.data),
    {
      branchId: context.inactiveBranch.id,
      newCustomers: "1",
      returningCustomers: "0",
      totalVisits: "1",
    },
    "owner inactive-branch dashboard keeps historical data visible",
  );
}

// Kiểm manager dashboard chỉ dùng active branch, kể cả khi truyền branchId khác.
async function smokeManagerDashboard(
  context: SmokeContext,
  managerCookie: string,
) {
  const response = await api(
    managerCookie,
    API_ROUTES.dashboard({ period: REPORT_PERIOD_MONTH }),
  );
  assert(response.status === 200, "manager can load dashboard for active branch");
  assertDashboardMetrics(
    readDashboard(response.data),
    {
      branchId: context.activeBranch.id,
      newCustomers: "2",
      returningCustomers: "1",
      totalVisits: "4",
    },
    "manager dashboard is scoped to active managed branch",
  );

  const ignoredFilterResponse = await api(
    managerCookie,
    API_ROUTES.dashboard({
      branchId: context.otherBranch.id,
      period: REPORT_PERIOD_MONTH,
    }),
  );
  assert(ignoredFilterResponse.status === 200, "manager branchId query is ignored");
  assertDashboardMetrics(
    readDashboard(ignoredFilterResponse.data),
    {
      branchId: context.activeBranch.id,
      newCustomers: "2",
      returningCustomers: "1",
      totalVisits: "4",
    },
    "manager cannot switch dashboard scope with branchId query",
  );

  const missingBranchCookie = await cookieFor(context.manager, null);
  const missingBranchResponse = await api(
    missingBranchCookie,
    API_ROUTES.dashboard({ period: REPORT_PERIOD_MONTH }),
  );
  assert(missingBranchResponse.status === 403, "manager without active branch cannot load dashboard");
}

// Kiểm period=all dùng định nghĩa quay lại là khách có từ hai completed visits.
async function smokeAllTimeCustomerMetrics(
  context: SmokeContext,
  ownerCookie: string,
) {
  const response = await api(
    ownerCookie,
    API_ROUTES.dashboard({
      branchId: context.activeBranch.id,
      period: REPORT_PERIOD_ALL,
    }),
  );

  assert(response.status === 200, "owner can load all-time dashboard by branch");
  assertDashboardMetrics(
    readDashboard(response.data),
    {
      branchId: context.activeBranch.id,
      newCustomers: "3",
      returningCustomers: "2",
      totalVisits: "5",
    },
    "all-time dashboard counts repeat completed customers as returning",
  );
}

// Dọn dữ liệu smoke theo thứ tự tránh vướng foreign key.
async function cleanupSmokeData() {
  await prisma.visitPhoto.deleteMany({
    where: { visitId: { in: createdVisitIds } },
  });
  await prisma.visitService.deleteMany({
    where: { visitId: { in: createdVisitIds } },
  });
  await prisma.visit.deleteMany({
    where: { id: { in: createdVisitIds } },
  });
  await prisma.customer.deleteMany({
    where: { id: { in: createdCustomerIds } },
  });
  await prisma.service.deleteMany({
    where: { id: { in: createdServiceIds } },
  });
  await prisma.branch.updateMany({
    where: { id: { in: createdBranchIds } },
    data: { managerId: null },
  });
  await prisma.user.deleteMany({
    where: {
      id: { in: createdUserIds },
      username: { startsWith: "smoke.dashboard." },
    },
  });
  await prisma.branch.deleteMany({
    where: {
      id: { in: createdBranchIds },
      name: { startsWith: "SMOKE Dashboard Branch" },
    },
  });
  await prisma.shop.deleteMany({
    where: {
      id: { in: createdShopIds },
      name: { startsWith: "SMOKE Dashboard Shop" },
    },
  });
}

// Điều phối dashboard smoke cho owner filter, manager scope và metric khách.
async function run() {
  await assertServerIsRunning();
  const context = await setupContext();
  const ownerCookie = await cookieFor(context.owner);
  const managerCookie = await cookieFor(context.manager, context.activeBranch.id);

  console.log(`Running dashboard smoke against ${baseUrl}`);
  await smokeOwnerDashboard(context, ownerCookie);
  await smokeManagerDashboard(context, managerCookie);
  await smokeAllTimeCustomerMetrics(context, ownerCookie);
  console.log("Dashboard smoke passed.");
}

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanupSmokeData();
    await prisma.$disconnect();
  });
