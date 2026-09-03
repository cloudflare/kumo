# PAGES KNOWLEDGE BASE

Astro file-based routes for guides, API output, component and block references,
charts, changelog entries, and machine-readable resources.

## STRUCTURE

```text
pages/
├── components/    # Kumo component reference pages
├── blocks/        # CLI-installed block references
├── charts/        # Chart guides and interactive examples
├── changelog/     # Changelog index and pagination
├── api/           # JSON endpoints
├── tests/         # Rendered test routes
├── llms.txt.ts    # Generated machine-readable docs route
└── *.mdx          # Top-level guides
```

## WHERE TO LOOK

| Task              | Location                    | Notes                                       |
| ----------------- | --------------------------- | ------------------------------------------- |
| General guide     | `*.mdx`                     | Uses an Astro layout in frontmatter         |
| Component API     | `components/`               | See child guide                             |
| Block docs        | `blocks/`                   | Block source lives under `components/kumo/` |
| Chart docs        | `charts/`                   | Mix of MDX and Astro for complex pages      |
| Registry endpoint | `api/component-registry.ts` | Server-side registry serialization          |
| Build endpoint    | `api/version.ts`            | Injected package and Git metadata           |
| Agent text        | `llms.txt.ts`               | Converts rendered documentation to Markdown |

## CONVENTIONS

- Use `~/layouts/MdxDocLayout.astro` for standard MDX documentation.
- Put route metadata in frontmatter: `title`, `description`, and `sourceFile` when
  the page documents package source.
- Use `ComponentSection` to group rendered document sections.
- Hydrate only the interactive leaf. Keep static prose and layout server-rendered.
- Add public routes to the applicable hard-coded list in
  `../components/SidebarNav.tsx`.
- Use `.astro` only when MDX cannot express the page structure cleanly.

## ANTI-PATTERNS

- Do not add navigation state or browser APIs to server-rendered page frontmatter.
- Do not use the client virtual registry from endpoint or Astro server code.
- Do not omit accessible labels in examples described by the page.
- Do not rely on directory discovery for navigation; routing is automatic, but
  navigation is not.
