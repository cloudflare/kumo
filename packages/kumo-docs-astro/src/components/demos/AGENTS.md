# DEMOS KNOWLEDGE BASE

Executable Kumo examples used by documentation pages, the homepage showcase,
visual regression, and component registry generation.

## STRUCTURE

```text
demos/
├── *Demo.tsx       # Component-oriented exported examples
├── Chart/          # ECharts and chart-specific examples
├── data/           # Shared static demo fixtures
├── HomeGrid.tsx    # Homepage showcase and route map
└── FigmaPage.tsx   # Figma integration presentation
```

## WHERE TO LOOK

| Task               | Location                                    | Notes                                            |
| ------------------ | ------------------------------------------- | ------------------------------------------------ |
| Component examples | `{Component}Demo.tsx`                       | Match the related reference page                 |
| Homepage coverage  | `HomeGrid.tsx`                              | Showcase layout and `componentRoutes` are manual |
| Chart examples     | `Chart/`                                    | Chart tooltip values require HTML escaping       |
| Shared fixtures    | `data/`                                     | Keep static data out of component APIs           |
| Extraction rules   | `../../../scripts/extract-demo-examples.ts` | TypeScript AST parser                            |

## CONVENTIONS

- Registry files must use `{Component}Demo.tsx` names.
- Registry exports must end in `Demo`. Both exported function declarations and
  exported arrow functions are supported.
- Add JSDoc to exported function declarations when registry consumers need a
  description. The extractor does not collect arrow-function JSDoc.
- Keep returned JSX self-contained and suitable for copying. The extractor reads
  the top-level return expression, not arbitrary runtime behavior.
- Use controlled state only when the example demonstrates controlled behavior.
- Make icon-only actions accessible and preserve keyboard behavior in interactive
  examples.
- Use semantic Kumo tokens. Never add raw palette utilities or `dark:` variants.

## ANTI-PATTERNS

- Do not rename a file or export away from the `Demo` suffix if it belongs in the
  registry.
- Do not hide the primary example behind helper code that the AST extractor cannot
  represent as usable JSX.
- Do not add a component only to `HomeGrid.tsx`; also add its route page,
  navigation entry, and `componentRoutes` entry as applicable.
- Do not interpolate unescaped dynamic values into ECharts HTML tooltips.

## VALIDATION

```bash
pnpm --filter @cloudflare/kumo-docs-astro codegen:demos
pnpm --filter @cloudflare/kumo-docs-astro typecheck
pnpm --filter @cloudflare/kumo-docs-astro lint
```
