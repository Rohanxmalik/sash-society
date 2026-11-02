import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      "server-only": fromRoot("./src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/db/**/*.ts", "src/proxy.ts", "src/app/**/actions.ts"],
      exclude: ["src/lib/utils.ts", "src/lib/auth-client.ts", "src/db/schema/**"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
