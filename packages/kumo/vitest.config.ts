import { defineConfig } from "vitest/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@cloudflare/kumo": resolve(__dirname, "src/index.ts"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.stories.{ts,tsx}", "**/index.ts"],
    },
    projects: [
      // Unit tests
      {
        resolve: {
          alias: {
            "@": resolve(__dirname, "src"),
            "@cloudflare/kumo": resolve(__dirname, "src/index.ts"),
          },
        },
        test: {
          name: "unit",
          environment: "happy-dom",
          include: [
            "src/**/*.{test,spec}.{ts,tsx}",
            "scripts/**/*.{test,spec}.ts",
            "tests/**/*.{test,spec}.ts",
          ],
          setupFiles: ["./tests/setup.ts"],
          globals: true,
        },
      },
    ],
  },
});
