import { type FC, useMemo, useSyncExternalStore } from "react";
import { kumoColors, type ColorToken } from "virtual:kumo-colors";

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

type ColorsByCategory = {
  textColors: ColorToken[];
  colors: ColorToken[];
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

  // Split by category
  return {
    textColors: effectiveTokens.filter(
      (c) => getTokenCategory(c.name) === "text-colors",
    ),
    colors: effectiveTokens.filter(
      (c) => getTokenCategory(c.name) === "colors",
    ),
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
  const { textColors, colors } = getColorsForTheme(currentTheme);

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
          Displaying {allTokens.length} tokens
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
    </div>
  );
};
