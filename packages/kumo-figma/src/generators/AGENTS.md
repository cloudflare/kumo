# Figma Generators (`src/generators/`)

37 component generators creating Figma components from `component-registry.json`. Registry is source of truth.

**Parent:** See [packages/kumo-figma/AGENTS.md](../../AGENTS.md) for plugin context.

## STRUCTURE

```
generators/
├── shared.ts              # ALL constants (1544 lines) - CRITICAL, see below
├── icon-utils.ts          # Icon creation, placeholder, color binding (308 lines)
├── _test-utils.ts         # Shared test assertions (345 lines)
├── drift-detection.test.ts  # Meta-test: 1733 lines, enforces sync
├── button.ts              # Example generator (see pattern below)
├── button.test.ts         # Tests for button generator
└── ... (35+ component generators + tests)
```

## GENERATOR PATTERN (Canonical 4-Step)

Every generator follows this structure:

### 1. Imports

```typescript
import { SPACING, FONT_SIZE, createAutoLayoutFrame, ... } from "./shared";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import registry from "@cloudflare/kumo/ai/component-registry.json";
```

### 2. Extract Registry Data

```typescript
const componentProps = registry.components.Button.props;
const variantProp = componentProps.variant as { values: string[]; classes: Record<string, string>; };
const sizeProp = componentProps.size as { ... };
```

### 3. Testable Exports (Pure Functions - NO Figma API)

```typescript
// These enable unit testing without Figma runtime
export function getButtonVariantConfig() {
  return { values, classes, descriptions, default: variantProp.default };
}

export function getButtonParsedBaseStyles() {
  return parseTailwindClasses(baseClasses);
}

export function getButtonParsedVariantStyles(variant: string) {
  return parseTailwindClasses(variantProp.classes[variant]);
}

export function getAllButtonVariantData() {
  // Aggregates all intermediate data for testing
}
```

### 4. Generator Function

```typescript
export async function generateButtonComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  // 1. Generate ComponentNodes for each variant
  const components: ComponentNode[] = [];
  for (const variant of variants) {
    const component = await createButtonVariant(variant);
    components.push(component);
  }

  // 2. Combine as Figma variants
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Button";

  // 3. Create light/dark mode sections
  const lightSection = createModeSection(page, "Button", "light");
  const darkSection = createModeSection(page, "Button", "dark");

  // 4. Place in sections
  lightSection.frame.appendChild(componentSet);
  for (const comp of components) {
    darkSection.frame.appendChild(comp.createInstance());
  }

  // 5. Return next Y position
  return startY + totalHeight + SECTION_GAP;
}
```

## SHARED.TS (CRITICAL)

ALL magic numbers and constants MUST live here:

| Category   | Constants                                                 |
| ---------- | --------------------------------------------------------- |
| Layout     | `SECTION_PADDING`, `SECTION_GAP`, `GRID_LAYOUT.*`         |
| Spacing    | `SPACING.xs/sm/base/lg`                                   |
| Typography | `FONT_SIZE.xs/sm/base/lg`, `FALLBACK_VALUES.fontWeight.*` |
| Borders    | `BORDER_RADIUS.xs/sm/base/lg/full`                        |
| Effects    | `SHADOWS.xs/sm/lg/dialog`                                 |
| Opacity    | `OPACITY.disabled/backdrop/shortcut`                      |
| Colors     | `COLORS.placeholder/spinner/border` (RGB fallbacks)       |
| Variables  | `VAR_NAMES.*` (semantic variable name mapping)            |

Key utilities:

- `createAutoLayoutFrame(config)` - Creates frame with auto-layout
- `createTextNode(text, fontSize, fontWeight)` - Styled text with Inter font
- `createModeSection(page, name, "light"|"dark")` - Creates mode-scoped section
- `bindFillToVariable(node, variableId)` - Binds fill to Figma variable
- `getVariableByName(name)` - Looks up variable from kumo-colors collection

## ADDING A GENERATOR

1. Create `generators/yourcomponent.ts` following 4-step pattern
2. Add testable exports (pure functions)
3. Register in `code.ts` GENERATORS array:
   ```typescript
   { name: "YourComponent", generate: async (page, y) => await generateYourComponentComponents(page, y) }
   ```
4. Either:
   - Create `yourcomponent.test.ts` OR
   - Add to `EXCLUDED_COMPONENTS` in drift-detection.test.ts (with reason)

## DRIFT DETECTION

`drift-detection.test.ts` enforces:

1. **Generator existence**: Every registry component has a generator (or is excluded)
2. **Code.ts registration**: Generator file imported and in GENERATORS array
3. **Testable exports**: Warns if missing `get*Config()` or `get*Data()` functions
4. **No magic numbers**: Catches local redeclaration of shared.ts constants
5. **Import validation**: Constants must be imported, not copied
6. **Shadow centralization**: No hardcoded shadow effects

Excluded components (with reasons): Field, Grid, PageHeader, Popover

## ANTI-PATTERNS

| Pattern                      | Why                   | Instead                                 |
| ---------------------------- | --------------------- | --------------------------------------- |
| `const PADDING = 16`         | Drift detection fails | `import { SPACING } from "./shared"`    |
| `{ r: 0.5, g: 0.5, b: 0.5 }` | Not themeable         | `COLORS.*` or variable binding          |
| `.toBe(16)` in tests         | Fragile               | `FONT_SIZE.base` or registry values     |
| Hardcoding variant names     | Registry is truth     | Read from `registry.components.*.props` |
| Skipping testable exports    | Untestable            | Always export pure `get*` functions     |

## NOTES

- **74 files total**: 37 generators + 34 tests + 3 utilities
- **Largest**: `shared.ts` (1544 lines), `drift-detection.test.ts` (1733 lines)
- **Component coverage**: Badge, Banner, Button, Checkbox, Combobox, Dialog, Input, Select, Table, etc.
- **Variable binding**: `getVariableByName()` + `bindFillToVariable()` for theme-aware colors
- **Opacity variants**: Created at runtime via `getOrCreateVariableWithOpacity("color/20")`
