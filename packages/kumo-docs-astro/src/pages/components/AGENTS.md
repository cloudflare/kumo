# COMPONENT PAGES KNOWLEDGE BASE

Reference pages that connect component demos, installation examples, props data,
and visual-regression targets.

## PAGE SHAPE

```mdx
---
layout: ~/layouts/MdxDocLayout.astro
title: "Component"
description: "..."
sourceFile: "components/component"
---

import ComponentExample from "~/components/docs/ComponentExample.astro";
import ComponentSection from "~/components/docs/ComponentSection.astro";
import { ComponentBasicDemo } from "~/components/demos/ComponentDemo";
```

Typical order: primary demo, installation, usage, examples, and props.

## WHERE TO LOOK

| Task                | Location                                       | Notes                            |
| ------------------- | ---------------------------------------------- | -------------------------------- |
| Demo implementation | `../../components/demos/{Name}Demo.tsx`        | Export name must match `demo`    |
| Example frame       | `../../components/docs/ComponentExample.astro` | Code and VR metadata             |
| Props rendering     | `../../components/docs/PropsTable.astro`       | Registry-backed; not handwritten |
| Source API          | `../../../../kumo/src/components/{name}/`      | Component implementation         |

## CONVENTIONS

- Set `sourceFile` to the package registry key, usually `components/{name}`.
- Pass the exact exported demo name to `ComponentExample` through `demo`.
- Give visual-regression examples stable, unique `vrSection` slugs and meaningful
  `vrTitle` values.
- Use `client:visible` for normal isolated examples. Use `client:load` when a demo
  must register overlays, shortcuts, or immediate interactive state.
- Show both barrel and granular imports when the component supports both.
- Keep example headings and rendered demos in the same order as their imports.
- Use `PropsTable` data from the component registry. Update the component API at
  its source rather than editing a local props description.

## ANTI-PATTERNS

- Do not copy demo implementation JSX into the page; import the canonical demo.
- Do not invent prop tables or defaults that can drift from the registry.
- Do not change `vrSection` identifiers casually; screenshot selection depends on
  them.
- Do not use `client:load` for every example. It increases initial JavaScript and
  can make large reference pages expensive.
- Do not add a page without matching demo, sidebar, and homepage updates when the
  component is intended for all three surfaces.
