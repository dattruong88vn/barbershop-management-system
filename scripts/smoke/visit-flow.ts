import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

import {
  USER_ROLE_BARBER,
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_SKINNER,
  type UserRoleValue,
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
  VISIT_STATUS_COMPLETED,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "../../src/constants/common";
import { API_ROUTES } from "../../src/constants/routes";
import { DEFAULT_JSON_HEADERS } from "../../src/lib/apiConfig";
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

type SmokeContext = {
  barber: SmokeUser;
  branch: {
    id: string;
    name: string;
  };
  combo: {
    id: string;
    price: unknown;
  };
  receptionist: SmokeUser;
  service: {
    id: string;
    price: unknown;
  };
  shopId: string;
  skinner: SmokeUser;
};

type ApiResponse = {
  data: unknown;
  status: number;
};

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.NEXTAUTH_SECRET;
const stamp = Date.now().toString();

// In ra một bước đã qua để khi chạy smoke có thể đọc tiến độ theo thứ tự.
function logStep(message: string) {
  console.log(`[ok] ${message}`);
}

// Dừng smoke ngay khi gặp điều kiện không thể tiếp tục.
function fail(message: string): never {
  throw new Error(message);
}

// Kiểm tra một kỳ vọng của flow và ghi log khi kỳ vọng đó đúng.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    fail(message);
  }

  logStep(message);
}

// Ép response JSON về object thường để các bước đọc payload không dùng any.
function asRecord(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} response is not an object.`);
  }

  return value as JsonRecord;
}

// Lấy các field visit tối thiểu mà smoke cần kiểm tra từ API response.
function readVisit(data: unknown) {
  const record = asRecord(data, "Visit");
  const visit = asRecord(record.visit, "Visit payload");
  const id = typeof visit.id === "string" ? visit.id : "";
  const services = Array.isArray(visit.services) ? visit.services : [];

  if (!id) {
    fail("Visit payload is missing id.");
  }

  return {
    id,
    photos: Array.isArray(visit.photos) ? visit.photos : [],
    services,
    status: typeof visit.status === "string" ? visit.status : "",
    totalPrice:
      typeof visit.totalPrice === "number" ? visit.totalPrice : Number.NaN,
  };
}

// Lấy customer id vừa tạo để dùng tiếp cho bước tạo visit.
function readCustomerId(data: unknown) {
  const record = asRecord(data, "Customer");
  const customer = asRecord(record.customer, "Customer payload");
  const id = typeof customer.id === "string" ? customer.id : "";

  if (!id) {
    fail("Customer payload is missing id.");
  }

  return id;
}

// Chuyển Prisma Decimal hoặc number về number để so sánh giá snapshot.
function decimalToNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toString" in value &&
    typeof value.toString === "function"
  ) {
    return Number(value.toString());
  }

  return Number.NaN;
}

// Gọi API thật của dev server với session cookie đã dựng cho role tương ứng.
async function api(
  cookie: string,
  path: string,
  options: {
    body?: JsonRecord;
    method?: "GET" | "PATCH" | "POST";
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
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  return {
    data,
    status: response.status,
  };
}

// Tạo session cookie NextAuth cho user trong DB, không cần đăng nhập qua UI.
async function cookieFor(user: SmokeUser) {
  if (!secret) {
    fail("NEXTAUTH_SECRET is required. Run with .env.local loaded.");
  }

  const token = await encode({
    secret,
    token: {
      active_branch_id: user.branchId,
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

  return [
    `next-auth.session-token=${token}`,
    `__Secure-next-auth.session-token=${token}`,
  ].join("; ");
}

// Kiểm tra dev server đã chạy trước khi smoke tạo dữ liệu và gọi các route.
async function assertServerIsRunning() {
  try {
    await fetch(new URL("/api/auth/session", baseUrl));
  } catch {
    fail(`Dev server is not reachable at ${baseUrl}. Start it with npm run dev -- -p 3000.`);
  }
}

// Tìm bộ dữ liệu nền phù hợp: cùng chi nhánh phải có receptionist, barber,
// skinner, service cắt tóc và combo active để smoke mô phỏng flow thực tế.
async function findContext(): Promise<SmokeContext> {
  const receptionist = await prisma.user.findFirst({
    where: {
      branch: {
        status: "active",
      },
      branchId: process.env.SMOKE_BRANCH_ID || undefined,
      role: USER_ROLE_RECEPTIONIST,
      shopId: process.env.SMOKE_SHOP_ID || undefined,
      status: "active",
    },
    orderBy: { username: "asc" },
    select: {
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      branchId: true,
      fullName: true,
      id: true,
      role: true,
      shopId: true,
      status: true,
      username: true,
    },
  });

  if (!receptionist?.branch || !receptionist.branchId || !receptionist.shopId) {
    fail("No active receptionist with an active branch was found for visit smoke.");
  }

  const [barber, skinner, service, combo] = await Promise.all([
    prisma.user.findFirst({
      where: {
        branchId: receptionist.branchId,
        role: USER_ROLE_BARBER,
        shopId: receptionist.shopId,
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
    }),
    prisma.user.findFirst({
      where: {
        branchId: receptionist.branchId,
        role: USER_ROLE_SKINNER,
        shopId: receptionist.shopId,
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
    }),
    prisma.service.findFirst({
      where: {
        deletedAt: null,
        id: process.env.SMOKE_SERVICE_ID || undefined,
        isHaircut: true,
        shopId: receptionist.shopId,
        OR: [{ branchId: null }, { branchId: receptionist.branchId }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        price: true,
      },
    }),
    prisma.combo.findFirst({
      where: {
        comboServices: {
          some: {},
        },
        deletedAt: null,
        id: process.env.SMOKE_COMBO_ID || undefined,
        shopId: receptionist.shopId,
        OR: [{ branchId: null }, { branchId: receptionist.branchId }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        price: true,
      },
    }),
  ]);

  if (!barber) {
    fail("No active barber was found in the receptionist branch.");
  }

  if (!skinner) {
    fail("No active skinner was found in the receptionist branch.");
  }

  if (!service) {
    fail("No active haircut service was found for the receptionist branch.");
  }

  if (!combo) {
    fail("No active combo with services was found for the receptionist branch.");
  }

  return {
    barber,
    branch: receptionist.branch,
    combo,
    receptionist,
    service,
    shopId: receptionist.shopId,
    skinner,
  };
}

// Tạo customer smoke riêng, dùng phone theo timestamp để tránh trùng dữ liệu cũ.
async function createCustomer(cookie: string, index: number) {
  const response = await api(cookie, API_ROUTES.customers, {
    body: {
      name: `SMOKE Visit ${stamp}-${index}`,
      phone: `09${stamp.slice(-7)}${index}`,
    },
    method: "POST",
  });

  assert(response.status === 201, `customer ${index} can be created`);

  return readCustomerId(response.data);
}

// Tạo visit qua API thật, dùng chung cho case service, combo và mixed invalid.
async function createVisit(
  cookie: string,
  body: {
    barberId?: string;
    comboIds?: string[];
    customerId: string;
    serviceIds?: string[];
    skinnerId?: string;
  },
) {
  return api(cookie, API_ROUTES.visits, {
    body,
    method: "POST",
  });
}

// Điều phối toàn bộ smoke flow visit từ tạo customer đến complete service/combo.
async function run() {
  await assertServerIsRunning();
  const context = await findContext();
  const receptionistCookie = await cookieFor(context.receptionist);
  const barberCookie = await cookieFor(context.barber);
  const skinnerCookie = await cookieFor(context.skinner);

  console.log(`Running visit smoke against ${baseUrl}`);
  console.log(`Using branch ${context.branch.name} (${context.branch.id})`);

  const serviceCustomerId = await createCustomer(receptionistCookie, 1);
  const serviceVisitResponse = await createVisit(receptionistCookie, {
    barberId: context.barber.id,
    customerId: serviceCustomerId,
    serviceIds: [context.service.id],
    skinnerId: context.skinner.id,
  });
  assert(serviceVisitResponse.status === 201, "service visit can be created");

  const serviceVisit = readVisit(serviceVisitResponse.data);
  const serviceItem = asRecord(serviceVisit.services[0], "Service visit item");
  assert(serviceVisit.status === VISIT_STATUS_PENDING, "service visit starts pending");
  assert(
    serviceItem.type === VISIT_ITEM_TYPE_SERVICE &&
      serviceItem.itemId === context.service.id,
    "service visit snapshots a service item",
  );
  assert(
    serviceVisit.totalPrice === decimalToNumber(context.service.price),
    "service visit total price matches service snapshot",
  );
  assert(serviceItem.isHaircut === true, "service visit keeps haircut flag");

  const mixedCustomerId = await createCustomer(receptionistCookie, 2);
  const mixedResponse = await createVisit(receptionistCookie, {
    barberId: context.barber.id,
    comboIds: [context.combo.id],
    customerId: mixedCustomerId,
    serviceIds: [context.service.id],
    skinnerId: context.skinner.id,
  });
  assert(mixedResponse.status === 400, "mixed service and combo visit is rejected");

  const skinnerPhotoResponse = await api(
    skinnerCookie,
    API_ROUTES.visitPhotos(serviceVisit.id),
    {
      body: { key: `visits/${serviceVisit.id}/smoke-skinner-${stamp}.webp` },
      method: "POST",
    },
  );
  assert(skinnerPhotoResponse.status === 403, "skinner cannot upload haircut photo");

  const startResponse = await api(
    barberCookie,
    API_ROUTES.visitDetail(serviceVisit.id),
    {
      body: { status: VISIT_STATUS_IN_PROGRESS },
      method: "PATCH",
    },
  );
  assert(startResponse.status === 200, "barber can start pending service visit");
  assert(
    readVisit(startResponse.data).status === VISIT_STATUS_IN_PROGRESS,
    "started service visit is in progress",
  );

  const photoResponse = await api(
    barberCookie,
    API_ROUTES.visitPhotos(serviceVisit.id),
    {
      body: { key: `visits/${serviceVisit.id}/smoke-barber-${stamp}.webp` },
      method: "POST",
    },
  );
  assert(photoResponse.status === 200, "barber can upload haircut photo before complete");

  const completeResponse = await api(
    receptionistCookie,
    API_ROUTES.visitDetail(serviceVisit.id),
    {
      body: { status: VISIT_STATUS_COMPLETED },
      method: "PATCH",
    },
  );
  assert(completeResponse.status === 200, "receptionist can complete service visit");
  const completedVisit = readVisit(completeResponse.data);
  assert(
    completedVisit.status === VISIT_STATUS_COMPLETED,
    "completed service visit has completed status",
  );
  assert(completedVisit.photos.length > 0, "completed service visit returns uploaded photo");

  const lockedPhotoResponse = await api(
    barberCookie,
    API_ROUTES.visitPhotos(serviceVisit.id),
    {
      body: { key: `visits/${serviceVisit.id}/smoke-locked-${stamp}.webp` },
      method: "POST",
    },
  );
  assert(lockedPhotoResponse.status === 400, "completed visit rejects photo upload");

  const staffEditResponse = await api(
    receptionistCookie,
    API_ROUTES.visitDetail(serviceVisit.id),
    {
      body: {
        barberId: context.barber.id,
        noHaircut: false,
        noSkinnerService: false,
        skinnerId: context.skinner.id,
      },
      method: "PATCH",
    },
  );
  assert(staffEditResponse.status === 200, "completed visit allows staff edit inside window");

  const lockedDetailResponse = await api(
    receptionistCookie,
    API_ROUTES.visitDetail(serviceVisit.id),
    {
      body: {
        barberId: context.barber.id,
        customerId: serviceCustomerId,
        serviceIds: [context.service.id],
        skinnerId: context.skinner.id,
      },
      method: "PATCH",
    },
  );
  assert(lockedDetailResponse.status === 400, "completed visit rejects item edits");

  const comboCustomerId = await createCustomer(receptionistCookie, 3);
  const comboVisitResponse = await createVisit(receptionistCookie, {
    barberId: context.barber.id,
    comboIds: [context.combo.id],
    customerId: comboCustomerId,
    skinnerId: context.skinner.id,
  });
  assert(comboVisitResponse.status === 201, "combo visit can be created");
  const comboVisit = readVisit(comboVisitResponse.data);
  const comboItem = asRecord(comboVisit.services[0], "Combo visit item");
  assert(
    comboItem.type === VISIT_ITEM_TYPE_COMBO && comboItem.itemId === context.combo.id,
    "combo visit snapshots a combo item",
  );
  assert(
    comboVisit.totalPrice === decimalToNumber(context.combo.price),
    "combo visit total price matches combo snapshot",
  );

  const comboStartResponse = await api(
    skinnerCookie,
    API_ROUTES.visitDetail(comboVisit.id),
    {
      body: { status: VISIT_STATUS_IN_PROGRESS },
      method: "PATCH",
    },
  );
  assert(comboStartResponse.status === 200, "skinner can start pending combo visit");

  const comboCompleteResponse = await api(
    receptionistCookie,
    API_ROUTES.visitDetail(comboVisit.id),
    {
      body: { status: VISIT_STATUS_COMPLETED },
      method: "PATCH",
    },
  );
  assert(comboCompleteResponse.status === 200, "receptionist can complete combo visit");

  console.log("Visit smoke passed.");
}

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
