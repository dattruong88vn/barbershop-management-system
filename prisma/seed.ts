import { PrismaClient, UserRole } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

const shopId = "11111111-1111-4111-8111-111111111111";
const branchOneId = "22222222-2222-4222-8222-222222222221";
const branchTwoId = "22222222-2222-4222-8222-222222222222";

const ownerId = "33333333-3333-4333-8333-333333333331";
const managerId = "33333333-3333-4333-8333-333333333332";
const receptionistId = "33333333-3333-4333-8333-333333333333";
const barberId = "33333333-3333-4333-8333-333333333334";
const skinnerId = "33333333-3333-4333-8333-333333333335";

const haircutServiceId = "44444444-4444-4444-8444-444444444441";
const shampooServiceId = "44444444-4444-4444-8444-444444444442";
const earCleaningServiceId = "44444444-4444-4444-8444-444444444443";

const groomingComboId = "55555555-5555-4555-8555-555555555551";
const premiumComboId = "55555555-5555-4555-8555-555555555552";

const defaultPasswordHash = createHash("sha256")
  .update("password123")
  .digest("hex");

type SeedUser = {
  id: string;
  branchId: string;
  username: string;
  role: UserRole;
};

type SeedService = {
  id: string;
  name: string;
  price: string;
  isHaircut: boolean;
};

type SeedCombo = {
  id: string;
  name: string;
  description: string;
  price: string;
  serviceIds: string[];
};

const seedUsers: SeedUser[] = [
  {
    id: ownerId,
    branchId: branchOneId,
    username: "owner.demo",
    role: UserRole.owner,
  },
  {
    id: managerId,
    branchId: branchOneId,
    username: "manager.demo",
    role: UserRole.manager,
  },
  {
    id: receptionistId,
    branchId: branchOneId,
    username: "receptionist.demo",
    role: UserRole.receptionist,
  },
  {
    id: barberId,
    branchId: branchTwoId,
    username: "barber.demo",
    role: UserRole.barber,
  },
  {
    id: skinnerId,
    branchId: branchTwoId,
    username: "skinner.demo",
    role: UserRole.skinner,
  },
];

const seedServices: SeedService[] = [
  {
    id: haircutServiceId,
    name: "Cắt tóc nam",
    price: "100000",
    isHaircut: true,
  },
  {
    id: shampooServiceId,
    name: "Gội đầu thư giãn",
    price: "70000",
    isHaircut: false,
  },
  {
    id: earCleaningServiceId,
    name: "Ráy tai",
    price: "80000",
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
    description: "Cắt tóc nam, gội đầu thư giãn và ráy tai",
    price: "220000",
    serviceIds: [haircutServiceId, shampooServiceId, earCleaningServiceId],
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
    },
    create: {
      id: shopId,
      name: "Demo Barber Shop",
      address: "Quận 1, TP. Hồ Chí Minh",
      plan: "basic",
      status: "active",
      trialExpiresAt: new Date("2026-07-01T00:00:00.000Z"),
    },
  });

  await prisma.branch.upsert({
    where: { id: branchOneId },
    update: {
      name: "Chi nhánh trung tâm",
      address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
    },
    create: {
      id: branchOneId,
      shopId,
      name: "Chi nhánh trung tâm",
      address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
    },
  });

  await prisma.branch.upsert({
    where: { id: branchTwoId },
    update: {
      name: "Chi nhánh Thảo Điền",
      address: "45 Xuân Thủy, TP. Thủ Đức, TP. Hồ Chí Minh",
    },
    create: {
      id: branchTwoId,
      shopId,
      name: "Chi nhánh Thảo Điền",
      address: "45 Xuân Thủy, TP. Thủ Đức, TP. Hồ Chí Minh",
    },
  });

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        branchId: user.branchId,
        username: user.username,
        role: user.role,
        status: "active",
      },
      create: {
        id: user.id,
        shopId,
        branchId: user.branchId,
        username: user.username,
        passwordHash: defaultPasswordHash,
        role: user.role,
        status: "active",
        isFirstLogin: true,
      },
    });
  }

  for (const service of seedServices) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        price: service.price,
        isHaircut: service.isHaircut,
      },
      create: {
        id: service.id,
        shopId,
        name: service.name,
        price: service.price,
        isHaircut: service.isHaircut,
      },
    });
  }

  for (const combo of seedCombos) {
    await prisma.combo.upsert({
      where: { id: combo.id },
      update: {
        name: combo.name,
        description: combo.description,
        price: combo.price,
      },
      create: {
        id: combo.id,
        shopId,
        name: combo.name,
        description: combo.description,
        price: combo.price,
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
