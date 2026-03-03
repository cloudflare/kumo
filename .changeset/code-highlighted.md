---
"@cloudflare/kumo": minor
---

Add Shiki-powered `CodeHighlighted` component for syntax highlighting

- **New entry point**: `@cloudflare/kumo/code` - keeps Shiki out of main bundle
- **ShikiProvider**: Lazy-loads Shiki on first render, shares instance across all children
- **CodeHighlighted**: Syntax highlighting with line numbers, line highlighting, copy button
- **Server utilities**: `@cloudflare/kumo/code/server` for SSR/static highlighting
- **Themes**: Ships with `github-light` and `vesper` defaults, supports any Shiki theme
- **i18n**: Customizable labels via provider or per-component
- **CSS customization**: `--kumo-code-highlight-bg` variable for highlight color
- **Deprecates**: Legacy `Code` and `CodeBlock` components (will be removed in v2)
