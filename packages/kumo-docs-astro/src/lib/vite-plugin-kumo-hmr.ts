import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve once — points at the sibling kumo package root
const kumoRoot = resolve(__dirname, "../../../kumo");
const kumoSrc = resolve(kumoRoot, "src");

/**
 * Map every `@cloudflare/kumo` sub-path export to its source equivalent.
 *
 * In dev mode Vite will resolve these to the raw .ts/.tsx source files,
 * which means file-watcher-based HMR works instantly — no rebuild of
 * the kumo package required.
 *
 * In production builds (astro build) this plugin is NOT loaded, so the
 * normal package.json `exports` field is used (dist/), which validates
 * the real consumer experience.
 */
const aliases: Record<string, string> = {
  // Main barrel — resolves to source index.ts
  "@cloudflare/kumo": resolve(kumoSrc, "index.ts"),

  // CSS styles — resolve to source CSS
  "@cloudflare/kumo/styles/tailwind": resolve(kumoSrc, "styles/kumo.css"),
  "@cloudflare/kumo/styles/standalone": resolve(
    kumoSrc,
    "styles/kumo-standalone.css",
  ),
  "@cloudflare/kumo/styles": resolve(kumoSrc, "styles/kumo.css"),

  // JSON registry — these live outside src/ and are NOT built, so same
  // path works in dev and prod.  We alias anyway so Vite can resolve
  // the workspace:* link correctly and watch the file.
  "@cloudflare/kumo/ai/component-registry.json": resolve(
    kumoRoot,
    "ai/component-registry.json",
  ),
};

/**
 * Vite plugin that rewires `@cloudflare/kumo` imports to the raw source
 * files of the sibling package during `astro dev`.
 *
 * **Why not just use `resolve.alias`?**
 * `resolve.alias` is a simple prefix match — it can't distinguish
 * `@cloudflare/kumo` from `@cloudflare/kumo-figma` without a trailing
 * slash, and it can't handle the overlapping sub-path exports cleanly.
 * A plugin gives us exact-match control.
 */
export function kumoHmrPlugin() {
  return {
    name: "vite-plugin-kumo-hmr",
    enforce: "pre" as const,

    resolveId(source: string) {
      // Exact match first (most imports)
      if (aliases[source]) {
        return aliases[source];
      }

      // Sub-path component imports: @cloudflare/kumo/components/button
      // → packages/kumo/src/components/button/index.ts
      if (source.startsWith("@cloudflare/kumo/components/")) {
        const componentName = source.replace(
          "@cloudflare/kumo/components/",
          "",
        );
        return resolve(kumoSrc, `components/${componentName}/index.ts`);
      }

      // Primitives: @cloudflare/kumo/primitives/dialog
      // → packages/kumo/src/primitives/dialog.ts
      if (source.startsWith("@cloudflare/kumo/primitives/")) {
        const primitiveName = source.replace(
          "@cloudflare/kumo/primitives/",
          "",
        );
        return resolve(kumoSrc, `primitives/${primitiveName}.ts`);
      }
      if (source === "@cloudflare/kumo/primitives") {
        return resolve(kumoSrc, "primitives/index.ts");
      }

      // Utils barrel
      if (source === "@cloudflare/kumo/utils") {
        return resolve(kumoSrc, "utils/index.ts");
      }

      // Catalog barrel
      if (source === "@cloudflare/kumo/catalog") {
        return resolve(kumoSrc, "catalog/index.ts");
      }

      // Registry barrel
      if (source === "@cloudflare/kumo/registry") {
        return resolve(kumoSrc, "registry/index.ts");
      }

      // Catch-all for any other @cloudflare/kumo/styles/* CSS imports
      if (source.startsWith("@cloudflare/kumo/styles/")) {
        const styleName = source.replace("@cloudflare/kumo/styles/", "");
        return resolve(kumoSrc, `styles/${styleName}.css`);
      }

      return undefined;
    },

    configResolved(config: { server: { fs: { allow: string[] } } }) {
      // Append kumo source to the existing allow list rather than replacing it.
      // Using config() would shallow-merge and override Astro/Vite defaults.
      if (config.server?.fs?.allow) {
        config.server.fs.allow.push(kumoRoot);
      }
    },
  };
}
