---
"@cloudflare/kumo-docs-astro": patch
---

Add global letter-spacing and typography defaults

- Set global `letter-spacing: -0.01em`, `line-height: 1.5`, and OpenType font features (`cv02`, `cv03`, `cv04`, `calt`) on `html`
- Reset `letter-spacing: normal` on `pre`, `code`, `kbd`, and `.font-mono` elements
- Replace hardcoded `tracking-[-0.02em]` with `tracking-tight` utility across headings
- Switch prose paragraphs and lists from `leading-relaxed` to `leading-normal`
