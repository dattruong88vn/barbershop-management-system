import { createHash } from "node:crypto";

import { PrismaClient } from "./generated/client";

type LocationRecord = {
  code: string;
  fullName: string;
  name: string;
  provinceCode?: string;
  type: string;
};

const prisma = new PrismaClient();
const BATCH_SIZE = 200;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function getString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].trim()) {
      return record[key].trim();
    }
  }
  return "";
}

function getCode(
  record: Record<string, unknown>,
  keys: string[],
  width: number,
) {
  for (const key of keys) {
    const value = record[key];
    const code =
      typeof value === "number" && Number.isSafeInteger(value) && value >= 0
        ? String(value)
        : typeof value === "string"
          ? value.trim()
          : "";

    if (code) {
      return /^\d+$/.test(code) ? code.padStart(width, "0") : code;
    }
  }

  return "";
}

function parseRecords(value: unknown, recordType: "province" | "ward") {
  if (!Array.isArray(value)) throw new Error("Dataset must be a JSON array");

  return value.map((item, index): LocationRecord => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Invalid record at index ${index}`);
    }

    const record = item as Record<string, unknown>;
    const isWard = recordType === "ward";
    const code = getCode(record, ["code"], isWard ? 5 : 2);
    const fullName = getString(record, ["full_name", "fullName", "name"]);
    const name = getString(record, ["name", "short_name", "shortName"]);
    const type = getString(record, ["type", "division_type", "unit_type"]);
    const provinceCode = isWard
      ? getCode(record, ["province_code", "provinceCode"], 2)
      : undefined;

    if (!code || !name || !fullName || (isWard && !provinceCode)) {
      throw new Error(`Missing required location fields at index ${index}`);
    }

    return { code, fullName, name, provinceCode, type };
  });
}

function assertUniqueCodes(records: LocationRecord[], label: string) {
  const codes = new Set<string>();
  for (const record of records) {
    if (codes.has(record.code)) throw new Error(`Duplicate ${label} code: ${record.code}`);
    codes.add(record.code);
  }
}

function chunk<T>(items: T[]) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    chunks.push(items.slice(index, index + BATCH_SIZE));
  }
  return chunks;
}

async function syncProvinces(provinces: LocationRecord[]) {
  const existingProvinces = await prisma.province.findMany({
    where: { code: { in: provinces.map((province) => province.code) } },
    select: {
      code: true,
      fullName: true,
      isActive: true,
      name: true,
      type: true,
    },
  });
  const existingByCode = new Map(
    existingProvinces.map((province) => [province.code, province]),
  );
  const newProvinces = provinces.filter(
    (province) => !existingByCode.has(province.code),
  );
  const changedProvinces = provinces.filter((province) => {
    const existing = existingByCode.get(province.code);
    return (
      existing &&
      (existing.fullName !== province.fullName ||
        !existing.isActive ||
        existing.name !== province.name ||
        existing.type !== province.type)
    );
  });

  for (const batch of chunk(newProvinces)) {
    await prisma.province.createMany({
      data: batch.map((province) => ({
        code: province.code,
        fullName: province.fullName,
        isActive: true,
        name: province.name,
        type: province.type,
      })),
      skipDuplicates: true,
    });
  }

  for (const batch of chunk(changedProvinces)) {
    await prisma.$transaction(
      batch.map((province) =>
        prisma.province.update({
          where: { code: province.code },
          data: {
            fullName: province.fullName,
            isActive: true,
            name: province.name,
            type: province.type,
          },
        }),
      ),
    );
  }

  console.log(
    `Synced provinces: ${newProvinces.length} created, ${changedProvinces.length} updated`,
  );
}

async function syncWards(wards: LocationRecord[]) {
  const existingWards = await prisma.ward.findMany({
    where: { code: { in: wards.map((ward) => ward.code) } },
    select: {
      code: true,
      fullName: true,
      isActive: true,
      name: true,
      provinceCode: true,
      type: true,
    },
  });
  const existingByCode = new Map(
    existingWards.map((ward) => [ward.code, ward]),
  );
  const newWards = wards.filter((ward) => !existingByCode.has(ward.code));
  const changedWards = wards.filter((ward) => {
    const existing = existingByCode.get(ward.code);
    return (
      existing &&
      (existing.fullName !== ward.fullName ||
        !existing.isActive ||
        existing.name !== ward.name ||
        existing.provinceCode !== ward.provinceCode ||
        existing.type !== ward.type)
    );
  });

  for (const batch of chunk(newWards)) {
    await prisma.ward.createMany({
      data: batch.map((ward) => ({
        code: ward.code,
        fullName: ward.fullName,
        isActive: true,
        name: ward.name,
        provinceCode: ward.provinceCode as string,
        type: ward.type,
      })),
      skipDuplicates: true,
    });
  }

  for (const batch of chunk(changedWards)) {
    await prisma.$transaction(
      batch.map((ward) =>
        prisma.ward.update({
          where: { code: ward.code },
          data: {
            fullName: ward.fullName,
            isActive: true,
            name: ward.name,
            provinceCode: ward.provinceCode as string,
            type: ward.type,
          },
        }),
      ),
    );
  }

  console.log(
    `Synced wards: ${newWards.length} created, ${changedWards.length} updated`,
  );
}

async function downloadJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  return response.json() as Promise<unknown>;
}

async function main() {
  const provinceUrl = getRequiredEnv("LOCATION_PROVINCES_SOURCE_URL");
  const wardUrl = getRequiredEnv("LOCATION_WARDS_SOURCE_URL");
  const sourceName = getRequiredEnv("LOCATION_SOURCE_NAME");
  const sourceVersion = getRequiredEnv("LOCATION_SOURCE_VERSION");

  const [provinceJson, wardJson] = await Promise.all([
    downloadJson(provinceUrl),
    downloadJson(wardUrl),
  ]);
  const provinces = parseRecords(provinceJson, "province");
  const wards = parseRecords(wardJson, "ward");

  assertUniqueCodes(provinces, "province");
  assertUniqueCodes(wards, "ward");

  const provinceCodes = new Set(provinces.map((province) => province.code));
  for (const ward of wards) {
    if (!ward.provinceCode || !provinceCodes.has(ward.provinceCode)) {
      throw new Error(`Ward ${ward.code} references unknown province ${ward.provinceCode}`);
    }
  }

  const checksum = createHash("sha256")
    .update(JSON.stringify({ provinces: provinceJson, wards: wardJson }))
    .digest("hex");

  await syncProvinces(provinces);
  await syncWards(wards);

  await prisma.$transaction([
    prisma.ward.updateMany({
      where: { code: { notIn: wards.map((ward) => ward.code) } },
      data: { isActive: false },
    }),
    prisma.province.updateMany({
      where: { code: { notIn: provinces.map((province) => province.code) } },
      data: { isActive: false },
    }),
    prisma.datasetVersion.upsert({
      where: {
        sourceName_sourceVersion_checksum: { checksum, sourceName, sourceVersion },
      },
      create: {
        checksum,
        provinceCount: provinces.length,
        sourceName,
        sourceUrl: `${provinceUrl}\n${wardUrl}`,
        sourceVersion,
        wardCount: wards.length,
      },
      update: {},
    }),
  ]);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
