import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VIRTUAL_MODULE_ID = "virtual:kumo-colors";
const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;

type TokenType = "semantic" | "global" | "override";

type ColorToken = {
  name: string;
  light: string;
  dark: string;
  theme: string;
  tokenType: TokenType;
};

/** Light and dark mode color values */
type ColorMode = { light: string; dark: string };

/** Theme-specific color overrides */
type ThemeColors = {
  kumo: ColorMode;
  [themeName: string]: ColorMode | undefined;
};

type TokenDefinition = {
  newName: string;
  theme: ThemeColors;
  description?: string;
};

type ThemeConfig = {
  text: Record<string, TokenDefinition>;
  color: Record<string, TokenDefinition>;
  typography?: Record<string, unknown>;
};

// Path to the source config.ts — used for dev-mode loading and HMR watching
const configFile = resolve(
  __dirname,
  "../../../kumo/scripts/theme-generator/config.ts",
);

/**
 * Convert theme config to ColorToken array for the virtual module.
 * Derives token data directly from config.ts (single source of truth).
 */
function getColorsFromConfig(
  THEME_CONFIG: ThemeConfig,
  AVAILABLE_THEMES: readonly string[],
): ColorToken[] {
  const colors: ColorToken[] = [];

  // Process text color tokens
  for (const [tokenName, def] of Object.entries(THEME_CONFIG.text)) {
    const typedDef = def as TokenDefinition;

    // Base kumo theme (semantic tokens)
    if (typedDef.theme.kumo) {
      colors.push({
        name: `--text-color-${tokenName}`,
        light: typedDef.theme.kumo.light,
        dark: typedDef.theme.kumo.dark,
        theme: "kumo",
        tokenType: "semantic",
      });
    }

    // Theme overrides
    for (const themeName of AVAILABLE_THEMES) {
      if (themeName !== "kumo" && typedDef.theme[themeName]) {
        const themeColors = typedDef.theme[themeName]!;
        colors.push({
          name: `--text-color-${tokenName}`,
          light: themeColors.light,
          dark: themeColors.dark,
          theme: themeName,
          tokenType: "override",
        });
      }
    }
  }

  // Process color tokens (bg, border, ring, etc.)
  for (const [tokenName, def] of Object.entries(THEME_CONFIG.color)) {
    const typedDef = def as TokenDefinition;

    // Base kumo theme (semantic tokens)
    if (typedDef.theme.kumo) {
      colors.push({
        name: `--color-${tokenName}`,
        light: typedDef.theme.kumo.light,
        dark: typedDef.theme.kumo.dark,
        theme: "kumo",
        tokenType: "semantic",
      });
    }

    // Theme overrides
    for (const themeName of AVAILABLE_THEMES) {
      if (themeName !== "kumo" && typedDef.theme[themeName]) {
        const themeColors = typedDef.theme[themeName]!;
        colors.push({
          name: `--color-${tokenName}`,
          light: themeColors.light,
          dark: themeColors.dark,
          theme: themeName,
          tokenType: "override",
        });
      }
    }
  }

  return colors;
}

/**
 * Vite plugin that provides color token data as a virtual module.
 * Uses config.ts as the single source of truth - no CSS parsing needed.
 *
 * In dev mode, uses Vite's ssrLoadModule to import the source .ts file
 * directly — no kumo build step required, and HMR works automatically.
 * In production, falls back to the built dist/ package export.
 *
 * @returns Astro/Vite compatible plugin
 */
export function kumoColorsPlugin() {
  // Reference to the Vite dev server (set during configureServer)
  let server: any = null;

  return {
    name: "vite-plugin-kumo-colors",

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    async load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        let THEME_CONFIG: ThemeConfig;
        let AVAILABLE_THEMES: readonly string[];

        if (server) {
          // Dev mode: load source .ts directly via Vite's module runner.
          // This always reads the latest file contents — no build needed.
          const mod = await server.ssrLoadModule(configFile);
          THEME_CONFIG = mod.THEME_CONFIG;
          AVAILABLE_THEMES = mod.AVAILABLE_THEMES;
        } else {
          // Production build: use the built package export
          const mod = await import(
            "@cloudflare/kumo/scripts/theme-generator/config"
          );
          THEME_CONFIG = mod.THEME_CONFIG;
          AVAILABLE_THEMES = mod.AVAILABLE_THEMES;
        }

        const colors = getColorsFromConfig(THEME_CONFIG, AVAILABLE_THEMES);

        return `
export const kumoColors = ${JSON.stringify(colors, null, 2)};
`;
      }
    },

    configureServer(devServer: any) {
      server = devServer;

      // Watch config file and trigger HMR when it changes
      server.watcher.add([configFile]);

      server.watcher.on("change", (file: string) => {
        if (file.endsWith("config.ts")) {
          // Invalidate the SSR module cache so next load() re-reads the file
          const mods = server.moduleGraph.getModulesByFile(configFile);
          if (mods) {
            for (const mod of mods) {
              server.moduleGraph.invalidateModule(mod);
            }
          }

          // Invalidate the virtual module so it regenerates
          const virtualMod = server.moduleGraph.getModuleById(
            RESOLVED_VIRTUAL_MODULE_ID,
          );
          if (virtualMod) {
            server.moduleGraph.invalidateModule(virtualMod);
            server.ws.send({ type: "full-reload" });
          }
        }
      });
    },
  };
}
