# Figma Plugin (`@cloudflare/kumo-figma`)

Generates production-quality Figma components from `component-registry.json`. Destructive sync: purges and recreates all components per run.

**Parent:** See [root AGENTS.md](../../AGENTS.md) for monorepo context.

## STRUCTURE

```
kumo-figma/
├── src/
│   ├── code.ts                    # Plugin entry: GENERATORS array, page management
│   ├── ui.html                    # Plugin UI
│   ├── manifest.json              # Figma manifest (main: "code.js")
│   ├── generators/
│   │   ├── shared.ts              # ALL constants + utilities (~1540 lines, critical file)
│   │   ├── _test-utils.ts         # Shared test assertions
│   │   ├── drift-detection.test.ts  # Meta-test: registry ↔ generator sync (1733 lines)
│   │   ├── button.ts              # Example generator
│   │   └── ...                    # 35+ component generators
│   ├── parsers/
│   │   ├── tailwind-to-figma.ts   # Core: Tailwind classes → Figma values
│   │   ├── opacity-extractor.ts   # `bg-kumo-brand/70` → opacity data
│   │   ├── component-registry.ts  # Type-safe registry wrapper
│   │   ├── loader-parser.ts       # SVG circle data for Loader
│   │   └── tailwind-theme-parser.ts  # Parses tailwindcss/theme.css (test-only)
│   └── generated/                 # BUILD OUTPUT (gitignored): theme-data.json, etc.
├── scripts/
│   ├── sync-tokens-to-figma.ts    # CSS → Figma Variables API (unidirectional)
│   ├── figma-api.ts               # Low-level Figma REST client
│   ├── color-utils.ts             # oklch → sRGB conversion (uses culori)
│   └── maybe-sync.ts             # Conditional sync gate (skips if no FIGMA_TOKEN)
└── vitest.config.ts               # Node env (no DOM)
```

## WHERE TO LOOK

| Task                     | Location                                             | Notes                              |
| ------------------------ | ---------------------------------------------------- | ---------------------------------- |
| Add generator            | `src/generators/` + register in `code.ts` GENERATORS | Also update drift-detection        |
| Centralized constants    | `src/generators/shared.ts`                           | ALL magic numbers must live here   |
| Tailwind → Figma parsing | `src/parsers/tailwind-to-figma.ts`                   | Scale lookups from theme-data.json |
| Token sync to Figma      | `scripts/sync-tokens-to-figma.ts`                    | Requires FIGMA_TOKEN               |
| Drift detection          | `src/generators/drift-detection.test.ts`             | Meta-test enforcing sync           |

## CONVENTIONS

### Generator Pattern (Canonical)

Each generator file follows 4 steps:

1. **Import**: registry + `shared.ts` utilities + `parseTailwindClasses`
2. **Extract**: Component data from `registry.components.YourComponent.props` (NEVER hardcode)
3. **Testable exports**: Pure `get*Config()`/`get*ParsedStyles()` functions (no Figma API)
4. **Generator entry**: `async generateYourComponentComponents(page, startY) → nextY`
   - Creates components → `figma.combineAsVariants()` → light/dark section pair

### Adding a Generator (3 Steps)

1. Create `generators/yourcomponent.ts` with testable exports + generator function
2. Register in `code.ts` GENERATORS array (with wrapper lambda)
3. Either create test file OR add to `EXCLUDED_COMPONENTS` in drift-detection.test.ts

### Build Pipeline (Sequential, Order Matters)

```bash
pnpm build =
  1. sync:maybe                        # Sync tokens if FIGMA_TOKEN present
  2. build:data =                      # 4 codegen steps:
     a. tsx build-theme-data.ts        → generated/theme-data.json
     b. tsx build-loader-data.ts       → generated/loader-data.json
     c. tsx build-phosphor-icons.ts    → generated/phosphor-icons.json
     d. tsx build-figma-variables.ts   → generated/figma-variables.json
  3. build:plugin =                    # esbuild → src/code.js (IIFE, ES2017)
```

### Testing Philosophy

- **Test structure, NOT values**: `"DO NOT test specific colors, sizes, or variant names"`
- Tests validate against registry as source of truth
- `_test-utils.ts`: `expectValidRegistryProp()`, `expectAllClassesParsable()`, `expectValidParsedTypes()`
- Drift detection enforces: every registry component has generator, no magic numbers, no hardcoded assertions

## ANTI-PATTERNS

| Pattern                                    | Why                     | Instead                              |
| ------------------------------------------ | ----------------------- | ------------------------------------ |
| Hardcoded `SECTION_PADDING`, `SECTION_GAP` | Drift detection fails   | Import from `shared.ts`              |
| Hardcoded shadow effects                   | Test enforcement        | Import `SHADOWS` from `shared.ts`    |
| Hardcoded `opacity = 0.5`                  | Test enforcement        | Use `OPACITY.disabled`               |
| Hardcoded RGB `{ r: 0.5, ... }`            | Test enforcement        | Use `COLORS` from `shared.ts`        |
| `.toBe(16)` for font sizes in tests        | Fragile assertions      | Use `FONT_SIZE.*` or registry values |
| `.toBe(600)` for font weights              | Fragile assertions      | Use `FALLBACK_VALUES.fontWeight.*`   |
| Redeclaring constants from shared.ts       | Drift detection catches | Always import                        |

## NOTES

- **`generated/` is gitignored**: Run `pnpm build:data` after clone/branch switch. Tests fail without it.
- **ES2017 target**: Figma runtime constraint. Avoid `??`, output is IIFE not ESM.
- **`code.js` lives in `src/`**: Not `dist/`. Figma reads `manifest.json` which points to `code.js` in same dir.
- **Two color conversion paths**: `build-figma-variables.ts` (manual oklch→RGB), `scripts/color-utils.ts` (culori). Manual one is less accurate.
- **Opacity variables created at runtime**: `getOrCreateVariableWithOpacity("color-kumo-info/20")` alpha-blends against white/black on the fly.
- **Component name mapping** in drift-detection: `DropdownMenu→dropdown`, `Toasty→toast`, `Switch.Group→switch`
- **`VAR_NAMES`** in shared.ts has legacy aliases (both `color.surface` and `color.base` map to same variable)
- **Font**: Inter is required (default Figma font). `createTextNode()` handles async loading.
