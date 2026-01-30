import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  THEME_CONFIG,
  AVAILABLE_THEMES,
} from "@cloudflare/kumo/scripts/theme-generator/config";
import type { TokenDefinition } from "@cloudflare/kumo/scripts/theme-generator/types";

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

/**
 * Convert theme config to ColorToken array for the virtual module.
 * Derives token data directly from config.ts (single source of truth).
 */
function getColorsFromConfig(): ColorToken[] {
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
 * Hot reloads when config.ts changes.
 *
 * @returns Astro/Vite compatible plugin
 */
export function kumoColorsPlugin() {
  const configFile = resolve(
    __dirname,
    "../../../kumo/scripts/theme-generator/config.ts",
  );

  return {
    name: "vite-plugin-kumo-colors",

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const colors = getColorsFromConfig();

        return `
export const kumoColors = ${JSON.stringify(colors, null, 2)};
`;
      }
    },

    configureServer(server: {
      watcher: {
        add: (paths: string[]) => void;
        on: (event: string, callback: (file: string) => void) => void;
      };
      moduleGraph: {
        getModuleById: (id: string) => unknown;
        invalidateModule: (mod: unknown) => void;
      };
      ws: { send: (message: { type: string }) => void };
    }) {
      // Watch config file and trigger HMR when it changes
      server.watcher.add([configFile]);

      server.watcher.on("change", (file: string) => {
        if (file.endsWith("config.ts")) {
          const mod = server.moduleGraph.getModuleById(
            RESOLVED_VIRTUAL_MODULE_ID,
          );
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        }
      });
    },
  };
}
