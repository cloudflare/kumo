import { defineConfig } from "vite-plus";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readdirSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically discover primitive files
function getPrimitiveEntries() {
  const primitivesDir = resolve(__dirname, "src/primitives");
  const entries: Record<string, string> = {};

  try {
    const files = readdirSync(primitivesDir);
    for (const file of files) {
      if (file.endsWith(".ts") && file !== "index.ts") {
        const name = file.replace(".ts", "");
        entries[`primitives/${name}`] = resolve(primitivesDir, file);
      }
    }
  } catch {
    // Primitives directory doesn't exist yet (first build)
  }

  return entries;
}

const packEntries = {
  // Main entry point
  index: resolve(__dirname, "src/index.ts"),
  // Dynamically add primitive entries
  ...getPrimitiveEntries(),
  // Component entry points
  "components/badge": resolve(__dirname, "src/components/badge/index.ts"),
  "components/banner": resolve(__dirname, "src/components/banner/index.ts"),
  "components/button": resolve(__dirname, "src/components/button/index.ts"),
  "components/date-range-picker": resolve(
    __dirname,
    "src/components/date-range-picker/index.ts",
  ),
  "components/chart": resolve(__dirname, "src/components/chart/index.ts"),
  "components/checkbox": resolve(__dirname, "src/components/checkbox/index.ts"),
  "components/clipboard-text": resolve(
    __dirname,
    "src/components/clipboard-text/index.ts",
  ),
  "components/code": resolve(__dirname, "src/components/code/index.ts"),
  "components/combobox": resolve(__dirname, "src/components/combobox/index.ts"),
  "components/toolbar": resolve(__dirname, "src/components/toolbar/index.ts"),
  "components/dialog": resolve(__dirname, "src/components/dialog/index.ts"),
  "components/dropdown": resolve(__dirname, "src/components/dropdown/index.ts"),
  "components/collapsible": resolve(
    __dirname,
    "src/components/collapsible/index.ts",
  ),
  "components/field": resolve(__dirname, "src/components/field/index.ts"),

  "components/input": resolve(__dirname, "src/components/input/index.ts"),
  "components/input-group": resolve(
    __dirname,
    "src/components/input-group/index.ts",
  ),
  "components/layer-card": resolve(
    __dirname,
    "src/components/layer-card/index.ts",
  ),
  "components/label": resolve(__dirname, "src/components/label/index.ts"),
  "components/loader": resolve(__dirname, "src/components/loader/index.ts"),
  "components/menubar": resolve(__dirname, "src/components/menubar/index.ts"),
  "components/meter": resolve(__dirname, "src/components/meter/index.ts"),
  "components/pagination": resolve(
    __dirname,
    "src/components/pagination/index.ts",
  ),
  "components/select": resolve(__dirname, "src/components/select/index.ts"),
  "components/surface": resolve(__dirname, "src/components/surface/index.ts"),
  "components/switch": resolve(__dirname, "src/components/switch/index.ts"),
  "components/table": resolve(__dirname, "src/components/table/index.ts"),
  "components/tabs": resolve(__dirname, "src/components/tabs/index.ts"),
  "components/text": resolve(__dirname, "src/components/text/index.ts"),
  "components/toast": resolve(__dirname, "src/components/toast/index.ts"),
  "components/tooltip": resolve(__dirname, "src/components/tooltip/index.ts"),
  "components/popover": resolve(__dirname, "src/components/popover/index.ts"),
  "components/sensitive-input": resolve(
    __dirname,
    "src/components/sensitive-input/index.ts",
  ),
  "components/radio": resolve(__dirname, "src/components/radio/index.ts"),
  "components/command-palette": resolve(
    __dirname,
    "src/components/command-palette/index.ts",
  ),
  "components/link": resolve(__dirname, "src/components/link/index.ts"),
  "components/breadcrumbs": resolve(
    __dirname,
    "src/components/breadcrumbs/index.ts",
  ),
  "components/empty": resolve(__dirname, "src/components/empty/index.ts"),
  "components/grid": resolve(__dirname, "src/components/grid/index.ts"),
  "components/cloudflare-logo": resolve(
    __dirname,
    "src/components/cloudflare-logo/index.ts",
  ),
  "components/date-picker": resolve(
    __dirname,
    "src/components/date-picker/index.ts",
  ),
  "components/flow": resolve(__dirname, "src/components/flow/index.ts"),
  "components/autocomplete": resolve(
    __dirname,
    "src/components/autocomplete/index.ts",
  ),
  "components/sidebar": resolve(__dirname, "src/components/sidebar/index.ts"),
  "components/table-of-contents": resolve(
    __dirname,
    "src/components/table-of-contents/index.ts",
  ),
  // PLOP_INJECT_COMPONENT_ENTRY
  // Utils entry point
  utils: resolve(__dirname, "src/utils/index.ts"),
  // Primitives entry point (base-ui re-exports)
  primitives: resolve(__dirname, "src/primitives/index.ts"),
  // Registry entry point (component metadata types)
  registry: resolve(__dirname, "src/registry/index.ts"),
  // Catalog module entry point (runtime validation, JSON UI rendering)
  catalog: resolve(__dirname, "src/catalog/index.ts"),
  // Shiki-powered code highlighting (separate entry to avoid bundle bloat)
  code: resolve(__dirname, "src/code/index.ts"),
  "code/server": resolve(__dirname, "src/code/server.tsx"),
  // AI schemas for runtime validation (compiled to avoid consumers type-checking raw .ts)
  "ai/schemas": resolve(__dirname, "ai/schemas.ts"),
  // Theme generator utilities for consumers extending the theme
  "scripts/theme-generator/config": resolve(
    __dirname,
    "scripts/theme-generator/config.ts",
  ),
  "scripts/theme-generator/types": resolve(
    __dirname,
    "scripts/theme-generator/types.ts",
  ),
};

export default defineConfig({
  lint: {
    jsPlugins: [
      "./lint/kumo-plugin.js",
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    plugins: ["eslint", "typescript", "unicorn", "oxc", "jsx-a11y"],
    categories: {
      correctness: "error",
      suspicious: "warn",
    },
    rules: {
      "kumo/no-tailwind-dark-variant": "error",
      "kumo/no-primitive-colors": "error",
      "kumo/enforce-variant-standard": "error",
      "kumo/no-deprecated-props": "error",
      "kumo/no-cross-package-imports": "error",
      "kumo/no-flow-node-custom-render": "error",
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/no-unnecessary-template-expression": "off",
      "typescript/no-unnecessary-type-assertion": "off",
      "jsx-a11y/no-autofocus": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-array-reverse": "off",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
      "jsx-a11y/control-has-associated-label": "warn",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  // Two passes because JS and d.ts need opposite externalization (bundle the
  // code, reference the types) and tsdown has one deps policy per config.
  pack: [
    {
      entry: packEntries,

      format: "esm",
      platform: "browser",
      outDir: "dist",
      sourcemap: true,
      minify: true,
      dts: false,
      // The dts pass emits declarations this pass can't see — pair them by
      // co-location; asset entries aren't chunks, so re-attach them here.
      exports: {
        // Version metadata for bundled deps would churn package.json on every bump.
        inlinedDependencies: false,
        customExports(exports: Record<string, unknown>) {
          const out: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(exports)) {
            out[key] =
              typeof value === "string" && value.endsWith(".js")
                ? { types: value.replace(/\.js$/, ".d.ts"), import: value }
                : value;
          }
          return {
            ...out,
            "./ai/component-registry.json": {
              import: "./ai/component-registry.json",
            },
            "./registry/component-registry.json":
              "./ai/component-registry.json",
            "./registry/component-registry.md": "./ai/component-registry.md",
            "./styles/tailwind": "./dist/styles/kumo.css",
            "./styles/standalone": "./dist/styles/kumo-standalone.css",
            "./styles": "./dist/styles/kumo.css",
            "./styles/*": "./dist/styles/*.css",
          };
        },
      },
      clean: false,
      // tsdown externalizes declared deps by default — override to ship them bundled.
      deps: {
        alwaysBundle: /.+/,
        neverBundle: (id, importer) => {
          // Only externalize peer dependencies - bundle everything else
          switch (true) {
            case id === "react":
            case id.startsWith("react/"):
            case id === "react-dom":
            case id.startsWith("react-dom/"):
            case id === "@phosphor-icons/react":
            // CJS-only; bundling leaves require("react") calls that break
            // importing the published ESM directly in Node.
            case id === "use-sync-external-store":
            case id.startsWith("use-sync-external-store/"):
              return true;
            // Externalize shiki for server entry - it should be resolved at runtime in Node.js
            // This prevents shiki from being bundled with "use client" directives
            case id === "shiki":
            case id.startsWith("shiki/"):
              // Only externalize when imported from server.ts
              if (importer?.includes("code/server")) {
                return true;
              }
              return false;
            default:
              // Bundle all node_modules dependencies (don't externalize them)
              // This includes @base-ui-components and its transitive deps (tabbable, floating-ui, etc)
              return false;
          }
        },
      },
      outputOptions: {
        entryFileNames: "[name].js",
        // Default chunk names (trailing dashes, base64 hashes) break Jest consumers.
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name.replace(/[-_]+$/, "") || "chunk";
          return `chunks/${name}-[hash:16].js`;
        },
        hashCharacters: "base36",
        hoistTransitiveImports: false,
        // Rolldown drops "use client" directives; re-add on client chunks.
        banner: (chunk) => {
          if (
            chunk.name === "code/server" ||
            chunk.fileName?.includes("code/server")
          ) {
            return "";
          }
          return '"use client";\n';
        },
        advancedChunks: {
          groups: [
            { name: "vendor-styling", test: /node_modules\/.*cnfast/ },
            {
              name: "vendor-floating-ui",
              test: /node_modules\/.*@floating-ui/,
            },
            {
              name: "vendor-utils",
              test: /node_modules\/.*(?:tabbable|reselect)/,
            },
          ],
        },
      },
      // Dependent dev servers watch this file to pick up rebuilds.
      onSuccess: () => {
        writeFileSync(
          resolve(__dirname, "dist", ".build-complete"),
          String(Date.now()),
        );
      },
    },
    {
      entry: packEntries,
      format: "esm",
      platform: "browser",
      outDir: "dist",
      clean: false,
      // Keep bare imports external so consumers resolve real packages' types.
      deps: { neverBundle: /^[^./]/ },
      dts: { emitDtsOnly: true },
      sourcemap: false,
      // rolldown-plugin-dts transforms without maps; maps are irrelevant for d.ts.
      inputOptions: { checks: { sourcemapBroken: false } },
      // Package-correctness gates on the final output (runs on the packed
      // tarball): styles/registry entries are non-JS assets by design.
      attw: {
        profile: "esm-only",
        level: "error",
        excludeEntrypoints: [/styles/, /component-registry/],
      },
      publint: true,
    },
  ],
});
