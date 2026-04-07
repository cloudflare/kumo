import { type FC, useMemo, useSyncExternalStore } from "react";
import { kumoColors, type ColorToken } from "virtual:kumo-colors";
import { kumoRegistryJson } from "virtual:kumo-registry";

/**
 * Extract the actual color value from a CSS variable fallback.
 * e.g., "var(--color-neutral-900, oklch(21% 0.006 285.885))" -> "oklch(21% 0.006 285.885)"
 */
function extractColorValue(value: string): string {
  // Match var(--name, fallback) and extract the fallback
  const varMatch = value.match(/^var\([^,]+,\s*(.+)\)$/);
  return varMatch ? varMatch[1] : value;
}

/**
 * Convert a color string to hex.
 * Uses the browser's canvas API for accurate color conversion.
 */
function colorToHex(color: string): string | null {
  if (typeof document === "undefined") return null;

  const actualColor = extractColorValue(color);

  // Skip if already hex or simple values
  if (actualColor.startsWith("#") || actualColor === "transparent") return null;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = actualColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return null;
  }
}

/**
 * Displays a color swatch with both the original value and converted hex.
 */
const ColorSwatch: FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const hex = useMemo(() => colorToHex(value), [value]);

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-8 w-8 shrink-0 rounded border border-kumo-fill"
        style={{ background: value }}
      />
      <div className="flex flex-col text-xs text-kumo-default">
        <span className="text-[10px] tracking-wide uppercase opacity-70">
          {label}
        </span>
        <span className="truncate text-[10px] opacity-60">
          {value}
          {hex && (
            <span className="ml-1 font-mono font-medium text-kumo-default">
              {hex}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

type TokenCategory = "colors" | "text-colors";

function getTokenCategory(name: string): TokenCategory {
  const lower = name.toLowerCase();
  return lower.startsWith("--text-color-") ? "text-colors" : "colors";
}

// Subscribe to data-theme attribute changes on document.body
function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getTheme(): string {
  return document.body.getAttribute("data-theme") ?? "kumo";
}

function useCurrentTheme(): string {
  return useSyncExternalStore(subscribeToTheme, getTheme, () => "kumo");
}

/**
 * Build a set of lowercase component names from the registry.
 * Cached once — the registry doesn't change at runtime.
 */
const componentNames: Set<string> = new Set(
  Object.keys(kumoRegistryJson.components).map((n) => n.toLowerCase()),
);

/**
 * Extract the component name from a token, if it matches a known component.
 *
 * Token format: `--color-kumo-{component}-{variant}` or `--text-color-kumo-{component}-{variant}`
 * Returns the matched component name (lowercase) or null.
 */
function getComponentFromToken(tokenName: string): string | null {
  // Strip the CSS variable prefix to get the semantic name
  // "--color-kumo-badge-red" → "kumo-badge-red"
  // "--text-color-kumo-badge-red-subtle" → "kumo-badge-red-subtle"
  const semantic = tokenName
    .replace(/^--text-color-/, "")
    .replace(/^--color-/, "");

  // Must start with "kumo-"
  if (!semantic.startsWith("kumo-")) return null;

  // "kumo-badge-red" → "badge-red" → check if "badge" is a component
  const afterKumo = semantic.slice("kumo-".length);
  const segments = afterKumo.split("-");

  // Require at least 2 segments: component name + variant.
  // This avoids matching standalone semantic tokens like "kumo-link" or "kumo-surface".
  if (segments.length < 2) return null;

  return componentNames.has(segments[0]) ? segments[0] : null;
}

type ComponentColorGroup = {
  component: string;
  displayName: string;
  tokens: ColorToken[];
};

type ColorsByCategory = {
  textColors: ColorToken[];
  colors: ColorToken[];
  componentGroups: ComponentColorGroup[];
};

/**
 * Get effective colors for the current theme, organized by category.
 *
 * Returns:
 * - All semantic tokens (base kumo tokens)
 * - All global tokens (always shown - these are explicit opt-in classes like bg-fedramp-surface)
 * - Semantic overrides applied when theme !== "kumo"
 */
function getColorsForTheme(theme: string): ColorsByCategory {
  // Get base semantic tokens
  const semanticTokens = kumoColors.filter(
    (c) => c.tokenType === "semantic" && c.theme === "kumo",
  );

  // Get ALL global tokens (they're always available as explicit Tailwind classes)
  const globalTokens = kumoColors.filter((c) => c.tokenType === "global");

  let effectiveTokens: ColorToken[];

  // For kumo theme, just return semantic + global tokens
  if (theme === "kumo") {
    effectiveTokens = [...semanticTokens, ...globalTokens];
  } else {
    // For other themes, apply semantic overrides
    const overrideTokens = kumoColors.filter(
      (c) => c.tokenType === "override" && c.theme === theme,
    );

    // Create a map of overrides for quick lookup
    const overrideMap = new Map(overrideTokens.map((c) => [c.name, c]));

    // Replace semantic tokens with overrides where they exist
    const effectiveSemanticTokens = semanticTokens.map(
      (base) => overrideMap.get(base.name) ?? base,
    );

    effectiveTokens = [...effectiveSemanticTokens, ...globalTokens];
  }

  // Partition: component-specific tokens vs semantic tokens
  const componentTokenMap = new Map<string, ColorToken[]>();
  const semanticTokens2: ColorToken[] = [];

  for (const token of effectiveTokens) {
    const comp = getComponentFromToken(token.name);
    if (comp) {
      const list = componentTokenMap.get(comp) ?? [];
      list.push(token);
      componentTokenMap.set(comp, list);
    } else {
      semanticTokens2.push(token);
    }
  }

  // Build sorted component groups with display names from the registry
  const componentGroups: ComponentColorGroup[] = [...componentTokenMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([comp, tokens]) => {
      // Find the proper-cased name from the registry
      const registryName = Object.keys(kumoRegistryJson.components).find(
        (n) => n.toLowerCase() === comp,
      );
      return {
        component: comp,
        displayName: registryName ?? comp.charAt(0).toUpperCase() + comp.slice(1),
        tokens,
      };
    });

  // Split remaining semantic tokens by category
  return {
    textColors: semanticTokens2.filter(
      (c) => getTokenCategory(c.name) === "text-colors",
    ),
    colors: semanticTokens2.filter(
      (c) => getTokenCategory(c.name) === "colors",
    ),
    componentGroups,
  };
}

const TokenGrid: FC<{ tokens: ColorToken[] }> = ({ tokens }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2">
    {tokens.map((token: ColorToken) => (
      <div
        key={token.name}
        className={`flex items-center gap-3 rounded-md border bg-kumo-base px-3 py-2 text-xs ${
          token.tokenType === "global"
            ? "border border-kumo-info ring-1 ring-kumo-info/30"
            : "border-kumo-fill"
        }`}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium">{token.name}</span>
            {token.tokenType === "global" && (
              <span className="rounded bg-kumo-info/20 px-1.5 py-0.5 text-[10px] font-medium text-kumo-link">
                global
              </span>
            )}
          </div>
          <ColorSwatch label="Light" value={token.light} />
          <ColorSwatch label="Dark" value={token.dark} />
        </div>
      </div>
    ))}
  </div>
);

export const TailwindColorTokens: FC = () => {
  const currentTheme = useCurrentTheme();
  const { textColors, colors, componentGroups } =
    getColorsForTheme(currentTheme);

  const componentTokenCount = componentGroups.reduce(
    (sum, g) => sum + g.tokens.length,
    0,
  );
  const allTokens = [...textColors, ...colors];

  // Count override tokens for display
  const overrideCount =
    currentTheme !== "kumo"
      ? kumoColors.filter(
          (c) => c.tokenType === "override" && c.theme === currentTheme,
        ).length
      : 0;

  return (
    <div className="flex flex-col gap-8 bg-kumo-elevated p-8 text-kumo-default">
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-2xl font-semibold">Colors</h2>
        <div className="text-sm text-kumo-default">
          Displaying {allTokens.length + componentTokenCount} tokens
          {overrideCount > 0 && (
            <span className="ml-1">
              — {overrideCount} overridden by{" "}
              <code className="rounded bg-kumo-brand p-1">{currentTheme}</code>
            </span>
          )}
        </div>
      </div>

      {/* Text Colors Section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">
          Text Colors ({textColors.length})
        </h2>
        <TokenGrid tokens={textColors} />
      </section>

      {/* Surface, State, and Theme Colors Section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">
          Surface, State & Theme Colors ({colors.length})
        </h2>
        <TokenGrid tokens={colors} />
      </section>

      {/* Component Colors Section */}
      {componentGroups.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">
            Component Colors ({componentTokenCount})
          </h2>
          {componentGroups.map((group) => (
            <div key={group.component} className="flex flex-col gap-3">
              <h3 className="!m-0 text-xs font-semibold text-kumo-subtle">
                {group.displayName} ({group.tokens.length})
              </h3>
              <TokenGrid tokens={group.tokens} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
