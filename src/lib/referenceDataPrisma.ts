import { PrismaClient } from "@/generated/reference-data";

const REFERENCE_DATA_CLIENT_SCHEMA_VERSION = "20260622_location_fdw";

const GLOBAL_FOR_REFERENCE_DATA_PRISMA = globalThis as unknown as {
  referenceDataPrisma?: PrismaClient;
  referenceDataPrismaSchemaVersion?: string;
};

export const referenceDataPrisma =
  GLOBAL_FOR_REFERENCE_DATA_PRISMA.referenceDataPrismaSchemaVersion ===
    REFERENCE_DATA_CLIENT_SCHEMA_VERSION &&
  GLOBAL_FOR_REFERENCE_DATA_PRISMA.referenceDataPrisma
    ? GLOBAL_FOR_REFERENCE_DATA_PRISMA.referenceDataPrisma
    : new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  GLOBAL_FOR_REFERENCE_DATA_PRISMA.referenceDataPrisma = referenceDataPrisma;
  GLOBAL_FOR_REFERENCE_DATA_PRISMA.referenceDataPrismaSchemaVersion =
    REFERENCE_DATA_CLIENT_SCHEMA_VERSION;
}
