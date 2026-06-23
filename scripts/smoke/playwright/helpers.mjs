import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.NEXTAUTH_SECRET;
const stamp = Date.now().toString();
const createdBranchIds = [];
const createdComboIds = [];
const createdCustomerIds = [];
const createdServiceIds = [];
const createdShopIds = [];
const createdUserIds = [];
const createdVisitIds = [];

// Tạo hash mật khẩu giống app để user smoke có thể đăng nhập nếu cần.
function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

// Dừng smoke ngay khi thiếu dữ liệu nền bắt buộc.
function fail(message) {
  throw new Error(message);
}

// Kiểm tra dev server đã chạy trước khi Playwright mở trang.
async function assertServerIsRunning(request) {
  const response = await request.get(`${baseUrl}/api/auth/session`);

  if (!response.ok()) {
    fail(`Dev server is not reachable at ${baseUrl}. Start it with npm run dev -- -p 3000.`);
  }
}

// Lấy owner active làm actor nền cho các UI smoke quản lý.
async function findOwner() {
  const owner = await prisma.user.findFirst({
    where: {
      role: "owner",
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
    fail("No active owner was found for Playwright smoke.");
  }

  return owner;
}

// Thêm NextAuth JWT cookie vào browser context để đi thẳng vào màn cần test.
async function addSessionCookie(browserContext, user, branchId = user.branchId) {
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

  await browserContext.addCookies([
    {
      domain: "localhost",
      httpOnly: true,
      name: "next-auth.session-token",
      path: "/",
      sameSite: "Lax",
      value: token,
    },
    {
      domain: "localhost",
      httpOnly: true,
      name: "__Secure-next-auth.session-token",
      path: "/",
      sameSite: "Lax",
      secure: true,
      value: token,
    },
  ]);
}

// Tạo branch smoke để manager hoặc staff form có dữ liệu chi nhánh riêng.
async function createBranch(shopId, suffix) {
  const branch = await prisma.branch.create({
    data: {
      address: `SMOKE UI Address ${stamp}-${suffix}`,
      name: `SMOKE UI Branch ${stamp}-${suffix}`,
      shopId,
    },
    select: { id: true, name: true },
  });

  createdBranchIds.push(branch.id);

  return branch;
}

// Tạo user smoke trực tiếp trong DB cho các role UI cần kiểm.
async function createUser(input) {
  const user = await prisma.user.create({
    data: {
      branchId: input.branchId ?? null,
      fullName: input.fullName,
      isFirstLogin: false,
      passwordHash: hashPassword(`SmokeUi${stamp}!`),
      role: input.role,
      shopId: input.shopId,
      status: "active",
      username: input.username,
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

  createdUserIds.push(user.id);

  return user;
}

// Tạo manager được assign nhiều branch để kiểm màn chọn chi nhánh.
async function createManagerWithBranches(shopId) {
  const firstBranch = await createBranch(shopId, "manager-first");
  const secondBranch = await createBranch(shopId, "manager-second");
  const manager = await createUser({
    fullName: `SMOKE UI Manager ${stamp}`,
    role: "manager",
    shopId,
    username: `smoke.ui.manager.${stamp}`,
  });

  await prisma.branch.updateMany({
    where: { id: { in: [firstBranch.id, secondBranch.id] }, shopId },
    data: { managerId: manager.id },
  });

  return {
    firstBranch,
    manager,
    secondBranch,
  };
}

// Tạo customer smoke để vào visit create UI bằng query params, không cần search.
async function createCustomer(shopId) {
  const customer = await prisma.customer.create({
    data: {
      name: `SMOKE UI Customer ${stamp}`,
      phone: `06${stamp.slice(-7)}0`,
      shopId,
    },
    select: {
      id: true,
      name: true,
      phone: true,
    },
  });

  createdCustomerIds.push(customer.id);

  return customer;
}

// Tạo service smoke cho visit UI hoặc combo UI.
async function createService(input) {
  const service = await prisma.service.create({
    data: {
      branchId: input.branchId ?? null,
      createdBy: input.createdBy,
      isHaircut: input.isHaircut ?? false,
      name: input.name,
      price: input.price,
      responsibleRole: input.responsibleRole,
      shopId: input.shopId,
    },
    select: { id: true, name: true },
  });

  createdServiceIds.push(service.id);

  return service;
}

// Tạo combo smoke có service hợp lệ để visit UI kiểm service/combo clear nhau.
async function createCombo(input) {
  const combo = await prisma.combo.create({
    data: {
      branchId: input.branchId ?? null,
      comboServices: {
        create: input.serviceIds.map((serviceId) => ({
          serviceId,
          shopId: input.shopId,
        })),
      },
      createdBy: input.createdBy,
      description: `SMOKE UI Combo ${stamp}`,
      name: input.name,
      price: input.price,
      shopId: input.shopId,
    },
    select: { id: true, name: true },
  });

  createdComboIds.push(combo.id);

  return combo;
}

// Ghi lại visit tạo qua UI để cleanup không để rác DB dev.
async function collectVisitsForCustomer(customerId) {
  const visits = await prisma.visit.findMany({
    where: { customerId },
    select: { id: true },
  });

  for (const visit of visits) {
    if (!createdVisitIds.includes(visit.id)) {
      createdVisitIds.push(visit.id);
    }
  }
}

// Lấy province đầu tiên có ward active để staff form UI có option thật.
async function findProvinceWithWard() {
  try {
    const { PrismaClient: ReferencePrismaClient } = await import(
      "../../../src/generated/reference-data/index.js"
    );
    const referencePrisma = new ReferencePrismaClient();
    const ward = await referencePrisma.ward.findFirst({
      where: {
        isActive: true,
      },
      orderBy: { code: "asc" },
      select: {
        code: true,
        fullName: true,
        provinceCode: true,
      },
    });
    const province = ward
      ? await referencePrisma.province.findFirst({
          where: {
            code: ward.provinceCode,
            isActive: true,
          },
          select: {
            code: true,
            fullName: true,
          },
        })
      : null;
    await referencePrisma.$disconnect();

    return ward && province
      ? {
          ...province,
          wards: [{ code: ward.code, fullName: ward.fullName }],
        }
      : null;
  } catch {
    return null;
  }
}

// Xoá dữ liệu smoke UI theo thứ tự tránh vướng foreign key.
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
      username: { startsWith: "smoke.ui." },
    },
  });
  await prisma.branch.deleteMany({
    where: {
      id: { in: createdBranchIds },
      name: { startsWith: "SMOKE UI Branch" },
    },
  });
  await prisma.shop.deleteMany({
    where: {
      id: { in: createdShopIds },
      name: { startsWith: "SMOKE UI Shop" },
    },
  });
}

// Ngắt Prisma chính sau khi spec hoàn tất.
async function disconnectPrisma() {
  await prisma.$disconnect();
}

export {
  addSessionCookie,
  assertServerIsRunning,
  baseUrl,
  cleanupSmokeData,
  collectVisitsForCustomer,
  createBranch,
  createCombo,
  createCustomer,
  createManagerWithBranches,
  createService,
  createUser,
  disconnectPrisma,
  findOwner,
  findProvinceWithWard,
  prisma,
  stamp,
};
