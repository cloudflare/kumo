# Figma Plugin Knowledge Base

Kumo UI Kit Generator - generates production-quality Figma components from Kumo component definitions.

**Parent docs:** See [root AGENTS.md](../../AGENTS.md) for full project context.

## Quick Start

```bash
pnpm --filter @cloudflare/kumo-figma build
# In Figma: Plugins > Development > Import plugin from manifest...
# Select: packages/kumo-figma/src/manifest.json
```

## Structure

```
kumo-figma/
├── src/
│   ├── manifest.json          # Figma plugin manifest
│   ├── code.ts                # Main entry + GENERATORS array
│   ├── ui.html                # Plugin UI
│   ├── generated/             # Generated data files (JSON)
│   ├── parsers/
│   │   ├── tailwind-to-figma.ts   # Parse Tailwind → Figma values
│   │   └── opacity-extractor.ts   # Extract opacity modifiers
│   └── generators/
│       ├── shared.ts              # Centralized constants + utilities
│       ├── badge.ts               # Badge generator
│       ├── button.ts              # Button generator
│       └── ...                    # 30+ component generators
└── scripts/
    └── sync-tokens-to-figma.ts    # CSS → Figma Variables API
```

## Key Modules

### `parsers/tailwind-to-figma.ts`

Converts Tailwind classes to Figma values (colors, spacing, typography).

### `parsers/opacity-extractor.ts`

Extracts opacity patterns like `bg-kumo-brand/70` for Figma variable bindings.

### `generators/shared.ts`

**Centralized constants** - all magic numbers live here:

- `SECTION_PADDING`, `SECTION_GAP` - Layout spacing
- `SHADOWS` - Dialog, subtle shadow definitions
- `GRID_LAYOUT` - Row gaps, column widths
- `FALLBACK_VALUES` - Parser fallback values

## Workflow

### Token Sync First

```bash
FIGMA_TOKEN="your-token" pnpm --filter @cloudflare/kumo-figma figma:sync
```

This syncs CSS tokens to Figma's `kumo-colors` variable collection. **Run before plugin.**

### Build & Run

```bash
pnpm --filter @cloudflare/kumo-figma build
# In Figma: Plugins > Development > Kumo UI Kit Generator
```

## Adding Generators

1. **Create generator**: `generators/yourcomponent.ts`
2. **Register in `code.ts`** GENERATORS array
3. **Run validation**: `pnpm --filter @cloudflare/kumo-figma validate`
4. **Exclude if needed**: Add to `EXCLUDED_COMPONENTS` in `drift-detection.test.ts`

### Generator Template

```typescript
import { createTextNode, getVariableByName, SECTION_GAP } from "./shared";
import registry from "../../../../ai/component-registry.json";

const componentSpec = registry.components.YourComponent;

export function getYourComponentConfig() {
  return componentSpec.props;
}

export async function generateYourComponentComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  // Implementation
  return startY + 500 + SECTION_GAP;
}
```

## Drift Prevention

CI enforces generator ↔ registry sync:

- `drift-detection.test.ts` validates all components have generators
- Fails MRs touching `component-registry.json` without generator updates
- Exclusions documented in test file

## Technical Constraints

- **ES2020 target** - Figma runtime requirement
- **No external dependencies** - Bundled into single `code.js`
- **Variable bindings** - Requires `kumo-colors` collection from token sync

## Troubleshooting

| Error                              | Solution                               |
| ---------------------------------- | -------------------------------------- |
| "kumo-colors collection not found" | Run token sync first                   |
| "Variable not found"               | Check token name matches CSS           |
| "Font not found"                   | Inter is required (default Figma font) |
