import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      "server-only": fromRoot("./src/backend/test/server-only-stub.ts"),
    },
  },
  test: {
    // Each test starts an in-memory Postgres and runs the real migrations, which
    // is heavy on memory when too many run side by side.
    maxWorkers: 2,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/backend/**/*.ts", "src/shared/**/*.ts", "src/proxy.ts"],
      exclude: ["src/backend/db/schema/**", "src/backend/test/**", "src/shared/mauritius-2027.ts"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
