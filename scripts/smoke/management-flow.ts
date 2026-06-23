import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

import {
  CATALOG_STATUS_DELETED,
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  USER_ROLE_BARBER,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
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

type ApiResponse = {
  data: JsonRecord;
  status: number;
};

type SmokeContext = {
  manager: SmokeUser;
  managerBranchId: string;
  owner: TenantSmokeUser;
  otherBranchId: string;
  ownerBranchIds: string[];
  shopId: string;
  unassignedBranchId: string;
};

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.NEXTAUTH_SECRET;
const stamp = Date.now().toString();
const createdBranchIds: string[] = [];
const createdUserIds: string[] = [];
const createdServiceIds: string[] = [];
const createdComboIds: string[] = [];

// In ra một bước đã qua để người chạy thấy tiến độ theo từng flow.
function logStep(message: string) {
  console.log(`[ok] ${message}`);
}

// Dừng smoke ngay khi dữ liệu nền hoặc response không đúng kỳ vọng.
function fail(message: string): never {
  throw new Error(message);
}

// Kiểm tra một kỳ vọng của management flow và log khi kỳ vọng đó đúng.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    fail(message);
  }

  logStep(message);
}

// Ép unknown JSON về object thường để đọc response mà không dùng any.
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

// Gọi API thật của dev server với session cookie tương ứng.
async function api(
  cookie: string,
  path: string,
  options: {
    body?: JsonRecord;
    method?: "DELETE" | "GET" | "PATCH" | "POST";
  } = {},
): Promise<ApiResponse> {
  const response = await fetch(new URL(path, baseUrl), {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      ...DEFAULT_JSON_HEADERS,
      Cookie: cookie,
    },
    method: options.method ?? "GET",
  });

  return {
    data: await readJson(response),
    status: response.status,
  };
}

// Tạo NextAuth JWT cookie để smoke gọi API theo đúng role cần kiểm.
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

// Lấy owner active làm actor chính để tạo và kiểm các API quản lý.
async function findOwner(): Promise<TenantSmokeUser> {
  const owner = await prisma.user.findFirst({
    where: {
      role: USER_ROLE_OWNER,
      shop: { status: "active" },
      shopId: process.env.SMOKE_SHOP_ID || undefined,
      status: "active",
    },
    orderBy: { username: "asc" },
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

  if (!owner?.shopId) {
    fail("No active owner was found for management smoke.");
  }

  return {
    ...owner,
    shopId: owner.shopId,
  };
}

// Tạo branch smoke bằng Prisma để làm branch context cho manager.
async function createBranch(shopId: string, suffix: string) {
  const branch = await prisma.branch.create({
    data: {
      address: `SMOKE Address ${stamp}-${suffix}`,
      name: `SMOKE Branch ${stamp}-${suffix}`,
      shopId,
    },
    select: { id: true },
  });

  createdBranchIds.push(branch.id);

  return branch.id;
}

// Tạo manager smoke và assign vào hai branch để kiểm branch context.
async function createManager(shopId: string, branchIds: string[]): Promise<SmokeUser> {
  const manager = await prisma.user.create({
    data: {
      fullName: `SMOKE Manager ${stamp}`,
      isFirstLogin: false,
      passwordHash: hashPassword(`SmokeManager${stamp}!`),
      role: USER_ROLE_MANAGER,
      shopId,
      status: "active",
      username: `smoke.manager.${stamp}`,
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

  await prisma.branch.updateMany({
    where: { id: { in: branchIds }, shopId },
    data: { managerId: manager.id },
  });

  return manager;
}

// Chuẩn bị toàn bộ dữ liệu nền dùng chung cho bốn flow management.
async function setupContext(): Promise<SmokeContext> {
  const owner = await findOwner();
  const managerBranchId = await createBranch(owner.shopId, "manager-a");
  const otherBranchId = await createBranch(owner.shopId, "manager-b");
  const unassignedBranchId = await createBranch(owner.shopId, "unassigned");
  const ownerBranchIds = [
    await createBranch(owner.shopId, "owner-a"),
    await createBranch(owner.shopId, "owner-b"),
  ];
  const manager = await createManager(owner.shopId, [
    managerBranchId,
    otherBranchId,
  ]);

  return {
    manager,
    managerBranchId,
    otherBranchId,
    owner,
    ownerBranchIds,
    shopId: owner.shopId,
    unassignedBranchId,
  };
}

// Lấy object theo key trong response API và đảm bảo có id.
function readEntityId(data: JsonRecord, key: string) {
  const entity = asRecord(data[key], key);
  const id = typeof entity.id === "string" ? entity.id : "";

  if (!id) {
    fail(`${key} response is missing id.`);
  }

  return id;
}

// Tạo service bằng API để dùng tiếp cho service và combo smoke.
async function createService(
  cookie: string,
  input: {
    isHaircut: boolean;
    name: string;
    price: number;
    responsibleRole: string;
  },
) {
  const response = await api(cookie, API_ROUTES.services(), {
    body: input,
    method: "POST",
  });

  assert(response.status === 201, `service ${input.name} can be created`);
  const id = readEntityId(response.data, "service");
  createdServiceIds.push(id);

  return id;
}

// Tạo combo bằng API để dùng cho combo smoke và kiểm list/detail.
async function createCombo(
  cookie: string,
  input: {
    description: string;
    name: string;
    price: number;
    serviceIds: string[];
  },
) {
  const response = await api(cookie, API_ROUTES.combos(), {
    body: input,
    method: "POST",
  });

  assert(response.status === 201, `combo ${input.name} can be created`);
  const id = readEntityId(response.data, "combo");
  createdComboIds.push(id);

  return id;
}

// Kiểm manager bắt buộc có branch context và chỉ dùng được branch được assign.
async function smokeManagerBranchContext(context: SmokeContext) {
  const managerWithoutBranchCookie = await cookieFor(context.manager, null);
  const assignedBranchCookie = await cookieFor(
    context.manager,
    context.managerBranchId,
  );
  const unassignedBranchCookie = await cookieFor(
    context.manager,
    context.unassignedBranchId,
  );

  const missingBranchResponse = await api(
    managerWithoutBranchCookie,
    API_ROUTES.services(),
  );
  assert(missingBranchResponse.status === 403, "manager without branch context is blocked");

  const assignedResponse = await api(assignedBranchCookie, API_ROUTES.services());
  assert(assignedResponse.status === 200, "manager can use assigned active branch");

  const unassignedResponse = await api(
    unassignedBranchCookie,
    API_ROUTES.services(),
  );
  assert(unassignedResponse.status === 403, "manager cannot use unassigned branch");

  const branchListResponse = await api(assignedBranchCookie, API_ROUTES.branches);
  const branches = Array.isArray(branchListResponse.data.branches)
    ? branchListResponse.data.branches
    : [];
  assert(
    branchListResponse.status === 200 &&
      branches.some((branch) => asRecord(branch, "branch").id === context.managerBranchId) &&
      branches.some((branch) => asRecord(branch, "branch").id === context.otherBranchId) &&
      !branches.some((branch) => asRecord(branch, "branch").id === context.unassignedBranchId),
    "manager branch list only returns assigned branches",
  );
}

// Kiểm service management: create, list, edit, soft delete, deleted tab.
async function smokeServiceManagement(managerCookie: string) {
  const serviceId = await createService(managerCookie, {
    isHaircut: true,
    name: `SMOKE Service ${stamp}`,
    price: 120000,
    responsibleRole: SERVICE_RESPONSIBLE_ROLE_BARBER,
  });
  const listResponse = await api(managerCookie, API_ROUTES.services());
  const services = Array.isArray(listResponse.data.services)
    ? listResponse.data.services
    : [];
  assert(
    services.some((service) => asRecord(service, "service").id === serviceId),
    "active service list includes created service",
  );

  const updateResponse = await api(
    managerCookie,
    API_ROUTES.serviceDetail(serviceId),
    {
      body: {
        isHaircut: false,
        name: `SMOKE Service Updated ${stamp}`,
        price: 130000,
        responsibleRole: SERVICE_RESPONSIBLE_ROLE_SKINNER,
      },
      method: "PATCH",
    },
  );
  const updatedService = asRecord(updateResponse.data.service, "updated service");
  assert(
    updateResponse.status === 200 &&
      updatedService.name === `SMOKE Service Updated ${stamp}` &&
      updatedService.responsibleRole === SERVICE_RESPONSIBLE_ROLE_SKINNER,
    "service can be edited by creator",
  );

  const deleteResponse = await api(
    managerCookie,
    API_ROUTES.serviceDetail(serviceId),
    { method: "DELETE" },
  );
  assert(deleteResponse.status === 200, "service can be soft deleted");

  const deletedResponse = await api(
    managerCookie,
    API_ROUTES.services({ status: CATALOG_STATUS_DELETED }),
  );
  const deletedServices = Array.isArray(deletedResponse.data.services)
    ? deletedResponse.data.services
    : [];
  assert(
    deletedServices.some((service) => asRecord(service, "deleted service").id === serviceId),
    "deleted service list includes soft deleted service",
  );
}

// Kiểm combo management: reject combo rỗng, create, edit, soft delete, deleted tab.
async function smokeComboManagement(managerCookie: string) {
  const serviceId = await createService(managerCookie, {
    isHaircut: false,
    name: `SMOKE Combo Service ${stamp}`,
    price: 90000,
    responsibleRole: SERVICE_RESPONSIBLE_ROLE_SKINNER,
  });
  const emptyComboResponse = await api(managerCookie, API_ROUTES.combos(), {
    body: {
      description: "SMOKE empty combo",
      name: `SMOKE Empty Combo ${stamp}`,
      price: 100000,
      serviceIds: [],
    },
    method: "POST",
  });
  assert(emptyComboResponse.status === 400, "empty combo is rejected");

  const comboId = await createCombo(managerCookie, {
    description: "SMOKE combo description",
    name: `SMOKE Combo ${stamp}`,
    price: 100000,
    serviceIds: [serviceId],
  });
  const updateResponse = await api(
    managerCookie,
    API_ROUTES.comboDetail(comboId),
    {
      body: {
        description: "SMOKE combo updated",
        name: `SMOKE Combo Updated ${stamp}`,
        price: 110000,
        serviceIds: [serviceId],
      },
      method: "PATCH",
    },
  );
  const updatedCombo = asRecord(updateResponse.data.combo, "updated combo");
  assert(
    updateResponse.status === 200 &&
      updatedCombo.name === `SMOKE Combo Updated ${stamp}`,
    "combo can be edited by creator before visits",
  );

  const deleteResponse = await api(
    managerCookie,
    API_ROUTES.comboDetail(comboId),
    { method: "DELETE" },
  );
  assert(deleteResponse.status === 200, "combo can be soft deleted");

  const deletedResponse = await api(
    managerCookie,
    API_ROUTES.combos({ status: CATALOG_STATUS_DELETED }),
  );
  const deletedCombos = Array.isArray(deletedResponse.data.combos)
    ? deletedResponse.data.combos
    : [];
  assert(
    deletedCombos.some((combo) => asRecord(combo, "deleted combo").id === comboId),
    "deleted combo list includes soft deleted combo",
  );
}

// Tạo body staff hợp lệ dùng chung cho create/edit staff API.
function buildStaffBody(input: {
  branchId?: string | null;
  fullName: string;
  managedBranchIds?: string[];
  password?: string;
  role: UserRoleValue;
  username: string;
}) {
  return {
    branchId: input.branchId ?? null,
    currentAddress: "",
    currentAddressLine: null,
    currentProvinceCode: null,
    currentWardCode: null,
    dateOfBirth: "1995-01-01",
    fullName: input.fullName,
    gender: "male",
    hometown: "",
    hometownProvinceCode: null,
    identityCardBackKey: "",
    identityCardFrontKey: "",
    managedBranchIds: input.managedBranchIds ?? [],
    password: input.password ?? "",
    phone: `08${stamp.slice(-7)}${input.username.slice(-1)}`,
    role: input.role,
    username: input.username,
  };
}

// Kiểm staff management cho manager và owner, gồm role guard và đổi role manager.
async function smokeStaffManagement(
  context: SmokeContext,
  ownerCookie: string,
  managerCookie: string,
) {
  const managerStaffResponse = await api(managerCookie, API_ROUTES.staff, {
    body: buildStaffBody({
      fullName: `SMOKE Receptionist ${stamp}`,
      password: `SmokeStaff${stamp}!`,
      role: USER_ROLE_RECEPTIONIST,
      username: `smoke.receptionist.${stamp}`,
    }),
    method: "POST",
  });
  assert(managerStaffResponse.status === 201, "manager can create regular staff");
  const managerStaffId = readEntityId(managerStaffResponse.data, "staffMember");
  createdUserIds.push(managerStaffId);
  const managerStaff = asRecord(managerStaffResponse.data.staffMember, "manager staff");
  assert(
    managerStaff.branchId === context.managerBranchId,
    "manager-created staff is scoped to active branch",
  );

  const managerRoleResponse = await api(managerCookie, API_ROUTES.staff, {
    body: buildStaffBody({
      fullName: `SMOKE Blocked Manager ${stamp}`,
      managedBranchIds: [context.managerBranchId],
      password: `SmokeManagerBlocked${stamp}!`,
      role: USER_ROLE_MANAGER,
      username: `smoke.blocked.manager.${stamp}`,
    }),
    method: "POST",
  });
  assert(managerRoleResponse.status === 403, "manager cannot create manager account");

  const ownerManagerResponse = await api(ownerCookie, API_ROUTES.staff, {
    body: buildStaffBody({
      fullName: `SMOKE Owner Manager ${stamp}`,
      managedBranchIds: context.ownerBranchIds,
      password: `SmokeOwnerManager${stamp}!`,
      role: USER_ROLE_MANAGER,
      username: `smoke.owner.manager.${stamp}`,
    }),
    method: "POST",
  });
  assert(ownerManagerResponse.status === 201, "owner can create manager account");
  const ownerManagerId = readEntityId(ownerManagerResponse.data, "staffMember");
  createdUserIds.push(ownerManagerId);
  const assignedBranches = await prisma.branch.count({
    where: {
      id: { in: context.ownerBranchIds },
      managerId: ownerManagerId,
      shopId: context.shopId,
    },
  });
  assert(assignedBranches === context.ownerBranchIds.length, "owner manager is assigned to branches");

  const switchRoleResponse = await api(
    ownerCookie,
    API_ROUTES.staffDetail(ownerManagerId),
    {
      body: buildStaffBody({
        branchId: context.ownerBranchIds[0],
        fullName: `SMOKE Owner Manager Switched ${stamp}`,
        role: USER_ROLE_BARBER,
        username: `smoke.owner.manager.${stamp}`,
      }),
      method: "PATCH",
    },
  );
  assert(switchRoleResponse.status === 200, "owner can switch manager to regular staff");
  const switchedStaff = asRecord(switchRoleResponse.data.staffMember, "switched staff");
  const remainingAssignments = await prisma.branch.count({
    where: {
      id: { in: context.ownerBranchIds },
      managerId: ownerManagerId,
      shopId: context.shopId,
    },
  });
  assert(
    switchedStaff.role === USER_ROLE_BARBER &&
      switchedStaff.branchId === context.ownerBranchIds[0] &&
      remainingAssignments === 0,
    "manager-to-staff switch clears manager assignments and sets working branch",
  );
}

// Dọn dữ liệu smoke theo thứ tự tránh vướng foreign key.
async function cleanupSmokeData() {
  await prisma.comboService.deleteMany({
    where: { comboId: { in: createdComboIds } },
  });
  await prisma.combo.deleteMany({
    where: { id: { in: createdComboIds } },
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
      username: { startsWith: "smoke." },
    },
  });
  await prisma.branch.deleteMany({
    where: {
      id: { in: createdBranchIds },
      name: { startsWith: "SMOKE Branch" },
    },
  });
}

// Điều phối bốn nhóm smoke: manager branch context, service, combo và staff.
async function run() {
  await assertServerIsRunning();
  const context = await setupContext();
  const ownerCookie = await cookieFor(context.owner);
  const managerCookie = await cookieFor(context.manager, context.managerBranchId);

  console.log(`Running management smoke against ${baseUrl}`);
  await smokeManagerBranchContext(context);
  await smokeServiceManagement(managerCookie);
  await smokeComboManagement(managerCookie);
  await smokeStaffManagement(context, ownerCookie, managerCookie);
  console.log("Management smoke passed.");
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
