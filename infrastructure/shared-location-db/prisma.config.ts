import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.shared-location" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("LOCATION_DIRECT_URL"),
  },
});
