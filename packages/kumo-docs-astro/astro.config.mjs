// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { kumoColorsPlugin } from "./src/lib/vite-plugin-kumo-colors.js";
import { kumoRegistryPlugin } from "./src/lib/vite-plugin-kumo-registry.js";
import { kumoHmrPlugin } from "./src/lib/vite-plugin-kumo-hmr.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function getBuildInfo() {
  // Read version from the main kumo package
  const kumoPkg = JSON.parse(
    readFileSync(resolve(__dirname, "../kumo/package.json"), "utf-8"),
  );

  // Read version from the docs-astro package
  const docsPkg = JSON.parse(
    readFileSync(resolve(__dirname, "package.json"), "utf-8"),
  );

  let commitHash = "unknown";
  let commitDate = "unknown";
  let branch = "unknown";

  try {
    commitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
    }).trim();
    commitDate = execSync("git log -1 --format=%cI", {
      encoding: "utf-8",
    }).trim();
    branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch (error) {
    console.warn(
      "[kumo-docs-astro] Git info unavailable during build:",
      error instanceof Error ? error.message : error,
    );
    console.warn(
      "[kumo-docs-astro] This may happen with shallow clones. Set GIT_DEPTH=0 or fetch-depth: 0 in CI.",
    );
  }

  return {
    kumoVersion: kumoPkg.version,
    docsVersion: docsPkg.version,
    commitHash,
    commitDate,
    branch,
    buildDate: new Date().toISOString(),
  };
}

const buildInfo = getBuildInfo();

// Detect dev mode: `astro dev` sets this in process.argv
const isDev = process.argv.includes("dev");

// Path to kumo source (used for dev mode CSS aliases)
const kumoSrc = resolve(__dirname, "../kumo/src");

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      // In dev mode, resolve @cloudflare/kumo imports to raw source files
      // for instant HMR. In production builds, the normal package.json
      // exports (dist/) are used — preserving the real consumer experience.
      // IMPORTANT: Must come BEFORE tailwindcss() so CSS @import statements
      // like `@import "@cloudflare/kumo/styles"` are aliased to source files
      // before Tailwind processes them.
      // @ts-expect-error - Vite version mismatch between Astro (Vite 6) and @cloudflare/kumo (Vite 7)
      ...(isDev ? [kumoHmrPlugin()] : []),
      // @ts-expect-error - Vite version mismatch between Astro (Vite 6) and @tailwindcss/vite (Vite 7)
      tailwindcss(),
      // @ts-expect-error - Vite version mismatch between Astro (Vite 6) and @cloudflare/kumo (Vite 7)
      kumoColorsPlugin(),
      // @ts-expect-error - Vite version mismatch between Astro (Vite 6) and @cloudflare/kumo (Vite 7)
      kumoRegistryPlugin(),
    ],

    // In dev mode, add resolve.alias for CSS @import statements that may bypass
    // Vite plugins. This ensures `@import "@cloudflare/kumo/styles"` resolves
    // to source files without requiring a build step.
    resolve: isDev
      ? {
          alias: {
            "@cloudflare/kumo/styles/tailwind": resolve(
              kumoSrc,
              "styles/kumo.css",
            ),
            "@cloudflare/kumo/styles/standalone": resolve(
              kumoSrc,
              "styles/kumo-standalone.css",
            ),
            "@cloudflare/kumo/styles": resolve(kumoSrc, "styles/kumo.css"),
          },
        }
      : undefined,

    define: {
      __KUMO_VERSION__: JSON.stringify(buildInfo.kumoVersion),
      __DOCS_VERSION__: JSON.stringify(buildInfo.docsVersion),
      __BUILD_VERSION__: JSON.stringify(buildInfo.kumoVersion), // Alias for backwards compatibility
      __BUILD_COMMIT__: JSON.stringify(buildInfo.commitHash),
      __BUILD_COMMIT_DATE__: JSON.stringify(buildInfo.commitDate),
      __BUILD_BRANCH__: JSON.stringify(buildInfo.branch),
      __BUILD_DATE__: JSON.stringify(buildInfo.buildDate),
    },
  },
});
