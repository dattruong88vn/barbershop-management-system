import {
  PrismaClient,
  ServiceResponsibleRole,
  UserRole,
} from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const shopId = "11111111-1111-4111-8111-111111111111";

const branchIds = [
  "22222222-2222-4222-8222-222222222221",
  "22222222-2222-4222-8222-222222222222",
  "22222222-2222-4222-8222-222222222223",
] as const;

const ownerId = "33333333-3333-4333-8333-333333333301";
const managerIds = [
  "33333333-3333-4333-8333-333333333311",
  "33333333-3333-4333-8333-333333333312",
] as const;
const receptionistIds = [
  "33333333-3333-4333-8333-333333333321",
  "33333333-3333-4333-8333-333333333322",
  "33333333-3333-4333-8333-333333333323",
] as const;
const barberIds = [
  "33333333-3333-4333-8333-333333333331",
  "33333333-3333-4333-8333-333333333332",
  "33333333-3333-4333-8333-333333333333",
  "33333333-3333-4333-8333-333333333334",
  "33333333-3333-4333-8333-333333333335",
] as const;
const skinnerIds = [
  "33333333-3333-4333-8333-333333333341",
  "33333333-3333-4333-8333-333333333342",
  "33333333-3333-4333-8333-333333333343",
  "33333333-3333-4333-8333-333333333344",
  "33333333-3333-4333-8333-333333333345",
  "33333333-3333-4333-8333-333333333346",
  "33333333-3333-4333-8333-333333333347",
] as const;

const haircutServiceId = "44444444-4444-4444-8444-444444444441";
const shampooServiceId = "44444444-4444-4444-8444-444444444442";
const faceCareServiceId = "44444444-4444-4444-8444-444444444443";
const earCleaningServiceId = "44444444-4444-4444-8444-444444444444";
const stylingServiceId = "44444444-4444-4444-8444-444444444445";

const groomingComboId = "55555555-5555-4555-8555-555555555551";
const premiumComboId = "55555555-5555-4555-8555-555555555552";
const stylingComboId = "55555555-5555-4555-8555-555555555553";

const defaultPasswordHash = hashPassword("12345678");

type SeedBranch = {
  id: string;
  managerId: string;
  name: string;
  address: string;
};

type SeedUser = {
  id: string;
  branchId: string;
  username: string;
  fullName: string;
  phone: string;
  role: UserRole;
};

type SeedService = {
  id: string;
  name: string;
  price: string;
  responsibleRole: ServiceResponsibleRole;
  isHaircut: boolean;
};

type SeedCombo = {
  id: string;
  name: string;
  description: string;
  price: string;
  serviceIds: string[];
};

const seedBranches: SeedBranch[] = [
  {
    id: branchIds[0],
    managerId: managerIds[0],
    name: "Chi nhánh trung tâm",
    address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
  },
  {
    id: branchIds[1],
    managerId: managerIds[1],
    name: "Chi nhánh Thảo Điền",
    address: "45 Xuân Thủy, TP. Thủ Đức, TP. Hồ Chí Minh",
  },
  {
    id: branchIds[2],
    managerId: managerIds[0],
    name: "Chi nhánh Phú Nhuận",
    address: "88 Phan Đăng Lưu, Quận Phú Nhuận, TP. Hồ Chí Minh",
  },
];

const seedUsers: SeedUser[] = [
  {
    id: ownerId,
    branchId: branchIds[0],
    username: "onwer",
    fullName: "Demo Owner",
    phone: "0900000001",
    role: UserRole.owner,
  },
  ...managerIds.map((id, index) => ({
    id,
    branchId: branchIds[index],
    username: `manager${index + 1}`,
    fullName: `Demo Manager ${index + 1}`,
    phone: `090000001${index + 1}`,
    role: UserRole.manager,
  })),
  ...receptionistIds.map((id, index) => ({
    id,
    branchId: branchIds[index % branchIds.length],
    username: `reception${index + 1}`,
    fullName: `Demo Reception ${index + 1}`,
    phone: `090000002${index + 1}`,
    role: UserRole.receptionist,
  })),
  ...barberIds.map((id, index) => ({
    id,
    branchId: branchIds[index % branchIds.length],
    username: `barber${index + 1}`,
    fullName: `Demo Barber ${index + 1}`,
    phone: `090000003${index + 1}`,
    role: UserRole.barber,
  })),
  ...skinnerIds.map((id, index) => ({
    id,
    branchId: branchIds[index % branchIds.length],
    username: `skinner${index + 1}`,
    fullName: `Demo Skinner ${index + 1}`,
    phone: `090000004${index + 1}`,
    role: UserRole.skinner,
  })),
];

const seedServices: SeedService[] = [
  {
    id: haircutServiceId,
    name: "Cắt tóc nam",
    price: "100000",
    responsibleRole: ServiceResponsibleRole.barber,
    isHaircut: true,
  },
  {
    id: shampooServiceId,
    name: "Gội đầu thư giãn",
    price: "70000",
    responsibleRole: ServiceResponsibleRole.skinner,
    isHaircut: false,
  },
  {
    id: faceCareServiceId,
    name: "Chăm sóc da mặt",
    price: "120000",
    responsibleRole: ServiceResponsibleRole.skinner,
    isHaircut: false,
  },
  {
    id: earCleaningServiceId,
    name: "Ráy tai",
    price: "80000",
    responsibleRole: ServiceResponsibleRole.skinner,
    isHaircut: false,
  },
  {
    id: stylingServiceId,
    name: "Tạo kiểu tóc",
    price: "60000",
    responsibleRole: ServiceResponsibleRole.barber,
    isHaircut: false,
  },
];

const seedCombos: SeedCombo[] = [
  {
    id: groomingComboId,
    name: "Combo gọn gàng",
    description: "Cắt tóc nam và gội đầu thư giãn",
    price: "150000",
    serviceIds: [haircutServiceId, shampooServiceId],
  },
  {
    id: premiumComboId,
    name: "Combo chăm sóc đầy đủ",
    description: "Cắt tóc nam, gội đầu thư giãn, chăm sóc da mặt và ráy tai",
    price: "320000",
    serviceIds: [
      haircutServiceId,
      shampooServiceId,
      faceCareServiceId,
      earCleaningServiceId,
    ],
  },
  {
    id: stylingComboId,
    name: "Combo lịch lãm",
    description: "Cắt tóc nam và tạo kiểu tóc",
    price: "140000",
    serviceIds: [haircutServiceId, stylingServiceId],
  },
];

async function main() {
  await prisma.shop.upsert({
    where: { id: shopId },
    update: {
      name: "Demo Barber Shop",
      address: "Quận 1, TP. Hồ Chí Minh",
      plan: "basic",
      status: "active",
      trialExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
    },
    create: {
      id: shopId,
      name: "Demo Barber Shop",
      address: "Quận 1, TP. Hồ Chí Minh",
      plan: "basic",
      status: "active",
      trialExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
    },
  });

  for (const branch of seedBranches) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: {
        managerId: null,
        name: branch.name,
        address: branch.address,
        status: "active",
        deactivatedAt: null,
        deactivatedBy: null,
      },
      create: {
        id: branch.id,
        shopId,
        managerId: null,
        name: branch.name,
        address: branch.address,
        status: "active",
      },
    });
  }

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        shopId,
        branchId: user.branchId,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        passwordHash: defaultPasswordHash,
        role: user.role,
        status: "active",
        isFirstLogin: false,
      },
      create: {
        id: user.id,
        shopId,
        branchId: user.branchId,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        passwordHash: defaultPasswordHash,
        role: user.role,
        status: "active",
        isFirstLogin: false,
      },
    });
  }

  for (const branch of seedBranches) {
    await prisma.branch.update({
      where: { id: branch.id },
      data: {
        managerId: branch.managerId,
      },
    });
  }

  for (const service of seedServices) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        branchId: null,
        name: service.name,
        price: service.price,
        responsibleRole: service.responsibleRole,
        isHaircut: service.isHaircut,
        deletedAt: null,
      },
      create: {
        id: service.id,
        shopId,
        branchId: null,
        name: service.name,
        price: service.price,
        responsibleRole: service.responsibleRole,
        isHaircut: service.isHaircut,
        createdBy: ownerId,
      },
    });
  }

  for (const combo of seedCombos) {
    await prisma.combo.upsert({
      where: { id: combo.id },
      update: {
        branchId: null,
        name: combo.name,
        description: combo.description,
        price: combo.price,
        deletedAt: null,
      },
      create: {
        id: combo.id,
        shopId,
        branchId: null,
        name: combo.name,
        description: combo.description,
        price: combo.price,
        createdBy: ownerId,
      },
    });

    for (const serviceId of combo.serviceIds) {
      await prisma.comboService.upsert({
        where: {
          comboId_serviceId: {
            comboId: combo.id,
            serviceId,
          },
        },
        update: {
          shopId,
        },
        create: {
          shopId,
          comboId: combo.id,
          serviceId,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
