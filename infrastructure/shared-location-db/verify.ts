import { PrismaClient } from "./generated/client";

const prisma = new PrismaClient();

async function main() {
  const [activeProvinceCount, activeWardCount, latestDataset] = await Promise.all([
    prisma.province.count({ where: { isActive: true } }),
    prisma.ward.count({ where: { isActive: true } }),
    prisma.datasetVersion.findFirst({ orderBy: { importedAt: "desc" } }),
  ]);

  const provinceCode = process.env.LOCATION_VERIFY_PROVINCE_CODE?.trim();
  const wardSample = provinceCode
    ? await prisma.ward.findMany({
        orderBy: { name: "asc" },
        select: { code: true, fullName: true, provinceCode: true },
        take: 10,
        where: { isActive: true, provinceCode },
      })
    : [];

  console.log(
    JSON.stringify(
      {
        activeProvinceCount,
        activeWardCount,
        latestDataset,
        provinceCode: provinceCode || null,
        wardSample,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
