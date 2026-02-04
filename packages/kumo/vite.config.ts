import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";
import dts from "vite-plugin-dts";
import preserveDirectives from "rollup-plugin-preserve-directives";
import { rebuildSignalPlugin } from "./vite-plugin-rebuild-signal";

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
  } catch (e) {
    // Primitives directory doesn't exist yet (first build)
  }

  return entries;
}

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      dts({
        include: ["src/**/*"],
        exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"],
        rollupTypes: false, // Disabled - causes timeouts with many entry points
        compilerOptions: {
          incremental: isDev,
          tsBuildInfoFile: isDev ? "./.tsbuildinfo" : undefined,
        },
      }),
      rebuildSignalPlugin(),
    ],
    build: {
      lib: {
        entry: {
          // Main entry point
          index: resolve(__dirname, "src/index.ts"),
          // Dynamically add primitive entries
          ...getPrimitiveEntries(),
          // Component entry points
          "components/badge": resolve(
            __dirname,
            "src/components/badge/index.ts",
          ),
          "components/banner": resolve(
            __dirname,
            "src/components/banner/index.ts",
          ),
          "components/button": resolve(
            __dirname,
            "src/components/button/index.ts",
          ),
          "components/date-range-picker": resolve(
            __dirname,
            "src/components/date-range-picker/index.ts",
          ),
          "components/checkbox": resolve(
            __dirname,
            "src/components/checkbox/index.ts",
          ),
          "components/clipboard-text": resolve(
            __dirname,
            "src/components/clipboard-text/index.ts",
          ),
          "components/code": resolve(__dirname, "src/components/code/index.ts"),
          "components/combobox": resolve(
            __dirname,
            "src/components/combobox/index.ts",
          ),
          "components/dialog": resolve(
            __dirname,
            "src/components/dialog/index.ts",
          ),
          "components/dropdown": resolve(
            __dirname,
            "src/components/dropdown/index.ts",
          ),
          "components/collapsible": resolve(
            __dirname,
            "src/components/collapsible/index.ts",
          ),
          "components/field": resolve(
            __dirname,
            "src/components/field/index.ts",
          ),

          "components/input": resolve(
            __dirname,
            "src/components/input/index.ts",
          ),
          "components/layer-card": resolve(
            __dirname,
            "src/components/layer-card/index.ts",
          ),
          "components/label": resolve(
            __dirname,
            "src/components/label/index.ts",
          ),
          "components/loader": resolve(
            __dirname,
            "src/components/loader/index.ts",
          ),
          "components/menubar": resolve(
            __dirname,
            "src/components/menubar/index.ts",
          ),
          "components/meter": resolve(
            __dirname,
            "src/components/meter/index.ts",
          ),
          "components/pagination": resolve(
            __dirname,
            "src/components/pagination/index.ts",
          ),
          "components/select": resolve(
            __dirname,
            "src/components/select/index.ts",
          ),
          "components/native-select": resolve(
            __dirname,
            "src/components/native-select/index.ts",
          ),
          "components/surface": resolve(
            __dirname,
            "src/components/surface/index.ts",
          ),
          "components/switch": resolve(
            __dirname,
            "src/components/switch/index.ts",
          ),
          "components/table": resolve(
            __dirname,
            "src/components/table/index.ts",
          ),
          "components/tabs": resolve(__dirname, "src/components/tabs/index.ts"),
          "components/text": resolve(__dirname, "src/components/text/index.ts"),
          "components/toast": resolve(
            __dirname,
            "src/components/toast/index.ts",
          ),
          "components/tooltip": resolve(
            __dirname,
            "src/components/tooltip/index.ts",
          ),
          "components/popover": resolve(
            __dirname,
            "src/components/popover/index.ts",
          ),
          "components/sensitive-input": resolve(
            __dirname,
            "src/components/sensitive-input/index.ts",
          ),
          "components/radio": resolve(
            __dirname,
            "src/components/radio/index.ts",
          ),
          "components/command-palette": resolve(
            __dirname,
            "src/components/command-palette/index.ts",
          ),
          "components/link": resolve(__dirname, "src/components/link/index.ts"),
          "components/breadcrumbs": resolve(
            __dirname,
            "src/components/breadcrumbs/index.ts",
          ),
          "components/empty": resolve(
            __dirname,
            "src/components/empty/index.ts",
          ),
          "components/grid": resolve(__dirname, "src/components/grid/index.ts"),
          // PLOP_INJECT_COMPONENT_ENTRY
          // Utils entry point
          utils: resolve(__dirname, "src/utils/index.ts"),
          // Primitives entry point (base-ui re-exports)
          primitives: resolve(__dirname, "src/primitives/index.ts"),
          // Registry entry point (component metadata types)
          registry: resolve(__dirname, "src/registry/index.ts"),
          // Catalog module entry point (runtime validation, JSON UI rendering)
          catalog: resolve(__dirname, "src/catalog/index.ts"),
        },
        formats: ["es"],
        fileName: (format, entryName) => {
          return `${entryName}.js`;
        },
      },
      rollupOptions: {
        // Externalize dependencies that shouldn't be bundled
        external: (id) => {
          // Only externalize peer dependencies - bundle everything else
          switch (true) {
            case id === "react":
            case id.startsWith("react/"):
            case id === "react-dom":
            case id.startsWith("react-dom/"):
            case id === "@phosphor-icons/react":
              return true;
            default:
              // Bundle all node_modules dependencies (don't externalize them)
              // This includes @base-ui-components and its transitive deps (tabbable, floating-ui, etc)
              return false;
          }
        },
        output: {
          // Don't preserve modules - bundle dependencies into flat output
          // This avoids nested node_modules/.pnpm/ paths in dist that break Jest
          preserveModules: false,
          // Hoist "use client" directives to the top of chunks
          hoistTransitiveImports: false,
          // Add "use client" directive to all output chunks
          // This is necessary because rollup-plugin-preserve-directives only works with preserveModules: true
          banner: (chunk) => {
            // Add "use client" to all chunks since this is a client-side component library
            // RSC apps will need this directive on all components that use hooks/events
            return '"use client";\n';
          },
          // Manual chunks for better code splitting
          manualChunks: (id) => {
            // Vendor chunks for large dependencies
            if (id.includes("node_modules")) {
              // clsx + tailwind-merge utilities
              if (id.includes("clsx") || id.includes("tailwind-merge")) {
                return "vendor-styling";
              }
              // Floating UI positioning libraries
              if (id.includes("@floating-ui")) {
                return "vendor-floating-ui";
              }
              // Base UI components
              if (id.includes("@base-ui")) {
                return "vendor-base-ui";
              }
              // Other vendor dependencies
              if (
                id.includes("tabbable") ||
                id.includes("use-sync-external-store") ||
                id.includes("reselect")
              ) {
                return "vendor-utils";
              }
            }
          },
          // Global variables for UMD build (if needed)
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
          },
        },
        // Note: preserveDirectives plugin removed - it only works with preserveModules: true
        // We use output.banner instead to add "use client" to all chunks
        plugins: [],
        // Enable Rollup caching for faster rebuilds
        cache: isDev,
      },
      // Faster sourcemaps in dev
      sourcemap: isDev ? "inline" : true,
      // Skip minification in dev for faster rebuilds
      minify: isDev ? false : "esbuild",
      // Don't clear dist/ on every rebuild in dev
      emptyOutDir: !isDev,
      // Selective file watching in dev
      watch: isDev
        ? {
            include: "src/**",
            exclude: ["**/*.test.*", "**/*.stories.*", "**/__tests__/**"],
          }
        : undefined,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  };
});
