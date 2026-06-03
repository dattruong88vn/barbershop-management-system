import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const _dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(_dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
});
