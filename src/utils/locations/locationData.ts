import "server-only";

import { referenceDataPrisma } from "@/lib/referenceDataPrisma";

const LOCATION_SELECT = {
  code: true,
  fullName: true,
  name: true,
  type: true,
} as const;

export type StaffLocationSelection = {
  hometownProvinceCode: string | null;
  currentProvinceCode: string | null;
  currentWardCode: string | null;
};

export type StaffLocationValidationError =
  | "invalidHometownProvince"
  | "invalidCurrentProvince"
  | "invalidCurrentWard";

export async function getActiveProvinces() {
  return referenceDataPrisma.province.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: LOCATION_SELECT,
  });
}

export async function isActiveProvince(provinceCode: string) {
  const province = await referenceDataPrisma.province.findFirst({
    where: { code: provinceCode, isActive: true },
    select: { code: true },
  });

  return Boolean(province);
}

export async function getActiveWards(provinceCode: string) {
  return referenceDataPrisma.ward.findMany({
    where: { provinceCode, isActive: true },
    orderBy: { name: "asc" },
    select: {
      ...LOCATION_SELECT,
      provinceCode: true,
    },
  });
}

export async function validateStaffLocationSelection(
  selection: StaffLocationSelection,
): Promise<StaffLocationValidationError | null> {
  const {
    hometownProvinceCode,
    currentProvinceCode,
    currentWardCode,
  } = selection;

  if (currentWardCode && !currentProvinceCode) {
    return "invalidCurrentWard";
  }

  const provinceCodes = Array.from(
    new Set(
      [hometownProvinceCode, currentProvinceCode].filter(
        (code): code is string => Boolean(code),
      ),
    ),
  );

  const [activeProvinces, currentWard] = await Promise.all([
    provinceCodes.length > 0
      ? referenceDataPrisma.province.findMany({
          where: { code: { in: provinceCodes }, isActive: true },
          select: { code: true },
        })
      : Promise.resolve([]),
    currentWardCode && currentProvinceCode
      ? referenceDataPrisma.ward.findFirst({
          where: {
            code: currentWardCode,
            provinceCode: currentProvinceCode,
            isActive: true,
          },
          select: { code: true },
        })
      : Promise.resolve(null),
  ]);

  const activeProvinceCodes = new Set(
    activeProvinces.map((province) => province.code),
  );

  if (
    hometownProvinceCode &&
    !activeProvinceCodes.has(hometownProvinceCode)
  ) {
    return "invalidHometownProvince";
  }

  if (
    currentProvinceCode &&
    !activeProvinceCodes.has(currentProvinceCode)
  ) {
    return "invalidCurrentProvince";
  }

  if (currentWardCode && !currentWard) {
    return "invalidCurrentWard";
  }

  return null;
}
