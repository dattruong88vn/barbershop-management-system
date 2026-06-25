import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

import {
  REPORT_ITEM_TAB_COMBO,
  REPORT_ITEM_TAB_SERVICE,
  REPORT_USAGE_SORT_ASC,
  REPORT_USAGE_SORT_DESC,
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

// Dừng smoke ngay khi response report dịch vụ/combo lệch khỏi rule đã chốt.
function fail(message: string): never {
  throw new Error(message);
}

// Ghi checkpoint pass ra log để biết flow đang qua bước nào.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
  console.log(`[ok] ${message}`);
}

// Ép JSON unknown về object thường để đọc field response an toàn.
function asRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} is not an object.`);
  }
  return value as JsonRecord;
}

// Ép JSON unknown về array để kiểm rows/details.
function asArray(value: unknown, label: string) {
  if (!Array.isArray(value)) fail(`${label} is not an array.`);
  return value;
}

// Đọc JSON response, hỗ trợ body rỗng khi API trả lỗi.
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

// Tạo cookie NextAuth theo role và active branch để kiểm owner/manager scope.
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
      passwordHash: hashPassword(`SmokeServiceComboReport${stamp}!`),
      role: input.role,
      shopId,
      username: `smoke.service-combo-report.${input.role}.${stamp}.${input.fullName.length}`,
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

// Tạo visit dịch vụ lẻ để service tab tăng lượt sử dụng.
async function createServiceVisit(input: {
  barberId: string;
  branch: { address: string; id: string; name: string };
  customerId: string;
  receptionistId: string;
  service: { id: string; name: string; price: unknown };
  skinnerId: string;
}) {
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
      totalPrice: 100000,
      visitServices: {
        create: {
          allocatedPrice: 100000,
          price: 100000,
          responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
          serviceId: input.service.id,
          serviceNameSnapshot: input.service.name,
          servicePriceSnapshot: 100000,
          shopId,
        },
      },
    },
  });
}

// Tạo visit combo, service con không được tăng usage trong service tab.
async function createComboVisit(input: {
  barberId: string;
  branch: { address: string; id: string; name: string };
  combo: { id: string; name: string };
  customerId: string;
  receptionistId: string;
  service: { id: string; name: string };
  skinnerId: string;
}) {
  return prisma.visit.create({
    data: {
      barberId: input.barberId,
      branchAddressSnapshot: input.branch.address,
      branchId: input.branch.id,
      branchNameSnapshot: input.branch.name,
      completedAt: new Date("2026-06-25T04:00:00.000Z"),
      createdBy: input.receptionistId,
      customerId: input.customerId,
      shopId,
      skinnerId: input.skinnerId,
      status: VISIT_STATUS_COMPLETED,
      totalPrice: 180000,
      visitServices: {
        create: [
          {
            allocatedPrice: 100000,
            comboId: input.combo.id,
            comboNameSnapshot: input.combo.name,
            comboPriceSnapshot: 180000,
            price: 100000,
            responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
            serviceId: input.service.id,
            serviceNameSnapshot: input.service.name,
            servicePriceSnapshot: 100000,
            shopId,
          },
          {
            allocatedPrice: 80000,
            comboId: input.combo.id,
            comboNameSnapshot: input.combo.name,
            comboPriceSnapshot: 180000,
            price: 80000,
            responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_SKINNER,
            serviceId: input.service.id,
            serviceNameSnapshot: input.service.name,
            servicePriceSnapshot: 80000,
            shopId,
          },
        ],
      },
    },
  });
}

// Dựng tenant, hai branch, service/combo và dữ liệu usage riêng.
async function setup() {
  const shop = await prisma.shop.create({
    data: {
      address: `SMOKE Service Combo Report Address ${stamp}`,
      name: `SMOKE Service Combo Report Shop ${stamp}`,
      trialExpiresAt: new Date(Date.now() + 86400000),
    },
  });
  shopId = shop.id;
  const owner = await createUser({
    fullName: `SMOKE Report Owner ${stamp}`,
    role: USER_ROLE_OWNER,
  });
  const branch = await prisma.branch.create({
    data: {
      address: `SMOKE Service Branch Address ${stamp}`,
      name: `SMOKE Service Branch ${stamp}`,
      shopId,
    },
  });
  const otherBranch = await prisma.branch.create({
    data: {
      address: `SMOKE Other Branch Address ${stamp}`,
      name: `SMOKE Other Branch ${stamp}`,
      shopId,
    },
  });
  const manager = await createUser({
    branchId: branch.id,
    fullName: `SMOKE Report Manager ${stamp}`,
    role: USER_ROLE_MANAGER,
  });
  await prisma.branch.update({
    data: { managerId: manager.id },
    where: { id: branch.id },
  });
  const receptionist = await createUser({
    branchId: branch.id,
    fullName: `SMOKE Report Reception ${stamp}`,
    role: USER_ROLE_RECEPTIONIST,
  });
  const barber = await createUser({
    branchId: branch.id,
    fullName: `SMOKE Report Barber ${stamp}`,
    role: USER_ROLE_BARBER,
  });
  const skinner = await createUser({
    branchId: branch.id,
    fullName: `SMOKE Report Skinner ${stamp}`,
    role: USER_ROLE_SKINNER,
  });
  const customer = await prisma.customer.create({
    data: {
      name: `SMOKE Service Combo Customer ${stamp}`,
      phone: `07${stamp.slice(-8)}`,
      shopId,
    },
  });
  const service = await prisma.service.create({
    data: {
      createdBy: owner.id,
      name: `SMOKE Direct Service ${stamp}`,
      price: 100000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_BARBER,
      shopId,
    },
  });
  const unusedService = await prisma.service.create({
    data: {
      branchId: otherBranch.id,
      createdBy: owner.id,
      name: `SMOKE Unused Skinner Service ${stamp}`,
      price: 50000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_SKINNER,
      shopId,
    },
  });
  const combo = await prisma.combo.create({
    data: {
      createdBy: owner.id,
      description: `SMOKE Combo Report Description ${stamp}`,
      name: `SMOKE Report Combo ${stamp}`,
      price: 180000,
      shopId,
    },
  });

  await createServiceVisit({
    barberId: barber.id,
    branch,
    customerId: customer.id,
    receptionistId: receptionist.id,
    service,
    skinnerId: skinner.id,
  });
  await createServiceVisit({
    barberId: barber.id,
    branch,
    customerId: customer.id,
    receptionistId: receptionist.id,
    service,
    skinnerId: skinner.id,
  });
  await createComboVisit({
    barberId: barber.id,
    branch,
    combo,
    customerId: customer.id,
    receptionistId: receptionist.id,
    service,
    skinnerId: skinner.id,
  });

  return { branch, combo, manager, owner, service, unusedService };
}

// Kiểm service tab, combo tab, manager scope, filter/sort và detail pagination.
async function run() {
  await fetch(new URL("/api/auth/session", baseUrl));
  const context = await setup();
  const ownerCookie = await cookieFor(context.owner);
  const managerCookie = await cookieFor(context.manager, context.branch.id);
  const range = { fromDate: "2026-06-25", toDate: "2026-06-25" };

  const serviceResponse = await api(
    ownerCookie,
    API_ROUTES.serviceComboReport({
      ...range,
      search: "Direct Service",
      sort: REPORT_USAGE_SORT_DESC,
      tab: REPORT_ITEM_TAB_SERVICE,
    }),
  );
  assert(serviceResponse.status === 200, "owner can load service report tab");
  const serviceRows = asArray(
    asRecord(serviceResponse.data.report, "service report").rows,
    "service rows",
  ).map((row) => asRecord(row, "service row"));
  const directServiceRow = serviceRows.find(
    (row) => row.itemId === context.service.id,
  );
  assert(
    directServiceRow?.usageCount === 2,
    "service tab counts direct service usage only",
  );

  const comboResponse = await api(
    ownerCookie,
    API_ROUTES.serviceComboReport({
      ...range,
      tab: REPORT_ITEM_TAB_COMBO,
    }),
  );
  const comboRows = asArray(
    asRecord(comboResponse.data.report, "combo report").rows,
    "combo rows",
  ).map((row) => asRecord(row, "combo row"));
  const comboRow = comboRows.find((row) => row.itemId === context.combo.id);
  assert(
    comboResponse.status === 200 && comboRow?.usageCount === 1,
    "combo tab counts one combo per visit",
  );

  const roleFilterResponse = await api(
    ownerCookie,
    API_ROUTES.serviceComboReport({
      ...range,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_SKINNER,
      sort: REPORT_USAGE_SORT_ASC,
      tab: REPORT_ITEM_TAB_SERVICE,
    }),
  );
  const roleRows = asArray(
    asRecord(roleFilterResponse.data.report, "role report").rows,
    "role rows",
  ).map((row) => asRecord(row, "role row"));
  assert(
    roleFilterResponse.status === 200 &&
      roleRows[0]?.itemId === context.unusedService.id,
    "service role filter and ascending usage sort are applied by the API",
  );

  const managerResponse = await api(
    managerCookie,
    API_ROUTES.serviceComboReport({
      ...range,
      branchId: context.unusedService.branchId ?? undefined,
      tab: REPORT_ITEM_TAB_SERVICE,
    }),
  );
  const managerReport = asRecord(managerResponse.data.report, "manager report");
  assert(
    managerResponse.status === 200 &&
      managerReport.branchId === context.branch.id,
    "manager service report is scoped to active managed branch",
  );

  const invalidRange = await api(
    ownerCookie,
    API_ROUTES.serviceComboReport({
      fromDate: "2026-06-26",
      tab: REPORT_ITEM_TAB_SERVICE,
      toDate: "2026-06-25",
    }),
  );
  assert(invalidRange.status === 400, "invalid service report date range returns 400");

  const detailPageOne = await api(
    ownerCookie,
    API_ROUTES.serviceComboReportDetails({
      ...range,
      itemId: context.service.id,
      page: 1,
      pageSize: 1,
      tab: REPORT_ITEM_TAB_SERVICE,
    }),
  );
  const detailReport = asRecord(detailPageOne.data.report, "detail report");
  const pagination = asRecord(detailReport.pagination, "pagination");
  assert(
    detailPageOne.status === 200 &&
      pagination.total === 2 &&
      pagination.totalPages === 2 &&
      asArray(detailReport.details, "details").length === 1,
    "service detail uses paginated database results",
  );
}

// Xóa tenant smoke cùng dữ liệu con sau khi hoàn tất.
async function cleanup() {
  if (shopId) {
    await prisma.shop.delete({ where: { id: shopId } }).catch(() => undefined);
  }
  await prisma.$disconnect();
}

console.log(`Running service/combo report smoke against ${baseUrl}`);
run()
  .then(() => console.log("Service/combo report smoke passed."))
  .finally(cleanup)
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
