import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.shared-data" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("SHARED_DIRECT_URL"),
  },
});
