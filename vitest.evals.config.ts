import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["evals/**/*.eval.ts"],
    globals: true,
    testTimeout: 60000,
    env: {
      VITEST_EVALS_REPORT_LEVEL: "info",
    },
  },
});
