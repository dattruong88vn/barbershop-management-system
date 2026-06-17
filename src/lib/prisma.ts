import { PrismaClient } from "@prisma/client";

const PRISMA_CLIENT_SCHEMA_VERSION = "20260617000000_add_service_creator_scope";

const GLOBAL_FOR_PRISMA = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

export const prisma =
  GLOBAL_FOR_PRISMA.prismaSchemaVersion === PRISMA_CLIENT_SCHEMA_VERSION &&
  GLOBAL_FOR_PRISMA.prisma
    ? GLOBAL_FOR_PRISMA.prisma
    : new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  GLOBAL_FOR_PRISMA.prisma = prisma;
  GLOBAL_FOR_PRISMA.prismaSchemaVersion = PRISMA_CLIENT_SCHEMA_VERSION;
}
