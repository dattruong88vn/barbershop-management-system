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

function parseRecords(value: unknown, includeProvinceCode: boolean) {
  if (!Array.isArray(value)) throw new Error("Dataset must be a JSON array");

  return value.map((item, index): LocationRecord => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Invalid record at index ${index}`);
    }

    const record = item as Record<string, unknown>;
    const code = getString(record, ["code"]);
    const fullName = getString(record, ["full_name", "fullName", "name"]);
    const name = getString(record, ["name", "short_name", "shortName"]);
    const type = getString(record, ["type", "division_type", "unit_type"]);
    const provinceCode = includeProvinceCode
      ? getString(record, ["province_code", "provinceCode"])
      : undefined;

    if (!code || !name || !fullName || (includeProvinceCode && !provinceCode)) {
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
  const provinces = parseRecords(provinceJson, false);
  const wards = parseRecords(wardJson, true);

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

  await prisma.$transaction(
    async (tx) => {
      for (const batch of chunk(provinces)) {
        await Promise.all(
          batch.map((province) =>
            tx.province.upsert({
              where: { code: province.code },
              create: { ...province, isActive: true },
              update: {
                fullName: province.fullName,
                isActive: true,
                name: province.name,
                type: province.type,
              },
            }),
          ),
        );
      }

      for (const batch of chunk(wards)) {
        await Promise.all(
          batch.map((ward) =>
            tx.ward.upsert({
              where: { code: ward.code },
              create: {
                code: ward.code,
                fullName: ward.fullName,
                isActive: true,
                name: ward.name,
                provinceCode: ward.provinceCode as string,
                type: ward.type,
              },
              update: {
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

      await tx.ward.updateMany({
        where: { code: { notIn: wards.map((ward) => ward.code) } },
        data: { isActive: false },
      });
      await tx.province.updateMany({
        where: { code: { notIn: provinces.map((province) => province.code) } },
        data: { isActive: false },
      });
      await tx.datasetVersion.upsert({
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
      });
    },
    { timeout: 120_000 },
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
