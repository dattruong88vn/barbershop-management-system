import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

import {
  REVENUE_REPORT_ITEM_TYPE_COMBO,
  REVENUE_REPORT_ITEM_TYPE_SERVICE,
  REVENUE_REPORT_TAB_BRANCH,
  REVENUE_REPORT_TAB_ITEM,
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

function fail(message: string): never {
  throw new Error(message);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
  console.log(`[ok] ${message}`);
}

function asRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} is not an object.`);
  }

  return value as JsonRecord;
}

function asArray(value: unknown, label: string) {
  if (!Array.isArray(value)) fail(`${label} is not an array.`);

  return value;
}

async function readJson(response: Response) {
  const text = await response.text();

  return text ? asRecord(JSON.parse(text) as unknown, "JSON") : {};
}

async function api(cookie: string, path: string) {
  const response = await fetch(new URL(path, baseUrl), {
    headers: { ...DEFAULT_JSON_HEADERS, Cookie: cookie },
  });

  return { data: await readJson(response), status: response.status };
}

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
      passwordHash: hashPassword(`SmokeRevenueReport${stamp}!`),
      role: input.role,
      shopId,
      username: `smoke.revenue-report.${input.role}.${stamp}.${input.fullName.length}`,
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

async function createDirectServiceVisit(input: {
  barberId: string;
  branch: { address: string; id: string; name: string };
  customerId: string;
  receptionistId: string;
  revenue: number;
  service: { id: string; name: string };
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
      totalPrice: input.revenue,
      visitServices: {
        create: {
          allocatedPrice: input.revenue,
          price: input.revenue,
          responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
          serviceId: input.service.id,
          serviceNameSnapshot: input.service.name,
          servicePriceSnapshot: input.revenue,
          shopId,
        },
      },
    },
  });
}

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

async function setup() {
  const shop = await prisma.shop.create({
    data: {
      address: `SMOKE Revenue Report Address ${stamp}`,
      name: `SMOKE Revenue Report Shop ${stamp}`,
      trialExpiresAt: new Date(Date.now() + 86400000),
    },
  });
  shopId = shop.id;
  const owner = await createUser({
    fullName: `SMOKE Revenue Owner ${stamp}`,
    role: USER_ROLE_OWNER,
  });
  const activeBranch = await prisma.branch.create({
    data: {
      address: `SMOKE Revenue Branch Address ${stamp}`,
      createdAt: new Date("2026-06-24T12:00:00.000Z"),
      name: `SMOKE Revenue Branch ${stamp}`,
      shopId,
    },
  });
  const otherBranch = await prisma.branch.create({
    data: {
      address: `SMOKE Revenue Other Branch Address ${stamp}`,
      createdAt: new Date("2026-06-24T12:00:00.000Z"),
      name: `SMOKE Revenue Other Branch ${stamp}`,
      shopId,
    },
  });
  const manager = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Revenue Manager ${stamp}`,
    role: USER_ROLE_MANAGER,
  });
  await prisma.branch.update({
    data: { managerId: manager.id },
    where: { id: activeBranch.id },
  });
  const receptionist = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Revenue Reception ${stamp}`,
    role: USER_ROLE_RECEPTIONIST,
  });
  const barber = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Revenue Barber ${stamp}`,
    role: USER_ROLE_BARBER,
  });
  const skinner = await createUser({
    branchId: activeBranch.id,
    fullName: `SMOKE Revenue Skinner ${stamp}`,
    role: USER_ROLE_SKINNER,
  });
  const customer = await prisma.customer.create({
    data: {
      name: `SMOKE Revenue Customer ${stamp}`,
      phone: `07${stamp.slice(-8)}`,
      shopId,
    },
  });
  const directService = await prisma.service.create({
    data: {
      createdBy: owner.id,
      name: `SMOKE Revenue Direct Service ${stamp}`,
      price: 100000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_BARBER,
      shopId,
    },
  });
  const otherService = await prisma.service.create({
    data: {
      branchId: otherBranch.id,
      createdBy: owner.id,
      name: `SMOKE Revenue Other Service ${stamp}`,
      price: 50000,
      responsibleRole: SERVICE_RESPONSIBLE_ROLE_BARBER,
      shopId,
    },
  });
  const combo = await prisma.combo.create({
    data: {
      createdBy: owner.id,
      description: `SMOKE Revenue Combo Description ${stamp}`,
      name: `SMOKE Revenue Combo ${stamp}`,
      price: 180000,
      shopId,
    },
  });

  await createDirectServiceVisit({
    barberId: barber.id,
    branch: activeBranch,
    customerId: customer.id,
    receptionistId: receptionist.id,
    revenue: 100000,
    service: directService,
    skinnerId: skinner.id,
  });
  await createComboVisit({
    barberId: barber.id,
    branch: activeBranch,
    combo,
    customerId: customer.id,
    receptionistId: receptionist.id,
    service: directService,
    skinnerId: skinner.id,
  });
  await createDirectServiceVisit({
    barberId: barber.id,
    branch: otherBranch,
    customerId: customer.id,
    receptionistId: receptionist.id,
    revenue: 50000,
    service: otherService,
    skinnerId: skinner.id,
  });

  return { activeBranch, combo, directService, manager, otherBranch, owner };
}

async function run() {
  await fetch(new URL("/api/auth/session", baseUrl));
  const context = await setup();
  const ownerCookie = await cookieFor(context.owner);
  const managerCookie = await cookieFor(context.manager, context.activeBranch.id);
  const range = { fromDate: "2026-06-25", toDate: "2026-06-25" };

  const ownerBranchResponse = await api(
    ownerCookie,
    API_ROUTES.revenueReport({ ...range, tab: REVENUE_REPORT_TAB_BRANCH }),
  );
  const ownerBranchReport = asRecord(
    ownerBranchResponse.data.report,
    "owner branch report",
  );
  const ownerBranchRows = asArray(
    ownerBranchReport.branchRows,
    "owner branch rows",
  ).map((row) => asRecord(row, "owner branch row"));
  const activeBranchRow = ownerBranchRows.find(
    (row) => row.branchId === context.activeBranch.id,
  );
  assert(
    ownerBranchResponse.status === 200 &&
      ownerBranchRows.length === 2 &&
      activeBranchRow?.revenue === 280000 &&
      activeBranchRow.serviceCount === 2,
    "owner revenue branch tab includes all branches and counts one combo as one item",
  );

  const managerBranchResponse = await api(
    managerCookie,
    API_ROUTES.revenueReport({ ...range, tab: REVENUE_REPORT_TAB_BRANCH }),
  );
  const managerRows = asArray(
    asRecord(managerBranchResponse.data.report, "manager branch report")
      .branchRows,
    "manager rows",
  );
  assert(
    managerBranchResponse.status === 200 && managerRows.length === 1,
    "manager revenue branch tab is scoped to active branch",
  );

  const itemResponse = await api(
    ownerCookie,
    API_ROUTES.revenueReport({ ...range, tab: REVENUE_REPORT_TAB_ITEM }),
  );
  const itemReport = asRecord(itemResponse.data.report, "item report");
  const itemRows = asArray(itemReport.itemRows, "item rows").map((row) =>
    asRecord(row, "item row"),
  );
  const serviceRow = itemRows.find(
    (row) =>
      row.itemId === context.directService.id &&
      row.itemType === REVENUE_REPORT_ITEM_TYPE_SERVICE,
  );
  const comboRow = itemRows.find(
    (row) =>
      row.itemId === context.combo.id &&
      row.itemType === REVENUE_REPORT_ITEM_TYPE_COMBO,
  );
  const typePie = asArray(itemReport.itemTypePie, "item type pie").map((row) =>
    asRecord(row, "type pie row"),
  );
  const servicePie = typePie.find(
    (row) => row.id === REVENUE_REPORT_ITEM_TYPE_SERVICE,
  );
  const comboPie = typePie.find(
    (row) => row.id === REVENUE_REPORT_ITEM_TYPE_COMBO,
  );
  assert(
    itemResponse.status === 200 &&
      serviceRow?.revenue === 100000 &&
      serviceRow.usageCount === 1 &&
      comboRow?.revenue === 180000 &&
      comboRow.usageCount === 1 &&
      servicePie?.revenue === 150000 &&
      comboPie?.revenue === 180000,
    "revenue item tab separates direct service revenue from combo revenue",
  );

  const invalidRange = await api(
    ownerCookie,
    API_ROUTES.revenueReport({
      fromDate: "2026-06-26",
      tab: REVENUE_REPORT_TAB_BRANCH,
      toDate: "2026-06-25",
    }),
  );
  assert(invalidRange.status === 400, "invalid revenue report date range returns 400");

  const branchDetail = await api(
    ownerCookie,
    API_ROUTES.revenueReportDetails({
      ...range,
      drilldownId: context.activeBranch.id,
      page: 1,
      pageSize: 1,
      tab: REVENUE_REPORT_TAB_BRANCH,
    }),
  );
  const branchDetailReport = asRecord(
    branchDetail.data.report,
    "branch detail report",
  );
  const branchPagination = asRecord(
    branchDetailReport.pagination,
    "branch pagination",
  );
  assert(
    branchDetail.status === 200 &&
      branchPagination.total === 2 &&
      branchPagination.totalPages === 2,
    "revenue branch detail uses paginated visit results",
  );

  const comboDetail = await api(
    ownerCookie,
    API_ROUTES.revenueReportDetails({
      ...range,
      drilldownId: context.combo.id,
      itemType: REVENUE_REPORT_ITEM_TYPE_COMBO,
      page: 1,
      pageSize: 10,
      tab: REVENUE_REPORT_TAB_ITEM,
    }),
  );
  const comboDetailRows = asArray(
    asRecord(comboDetail.data.report, "combo detail report").details,
    "combo detail rows",
  ).map((row) => asRecord(row, "combo detail row"));
  assert(
    comboDetail.status === 200 &&
      comboDetailRows.length === 1 &&
      comboDetailRows[0]?.revenue === 180000,
    "revenue combo detail groups combo rows by visit",
  );
}

async function cleanup() {
  if (shopId) {
    await prisma.shop.delete({ where: { id: shopId } }).catch(() => undefined);
  }
  await prisma.$disconnect();
}

console.log(`Running revenue report smoke against ${baseUrl}`);
run()
  .then(() => console.log("Revenue report smoke passed."))
  .finally(cleanup)
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
