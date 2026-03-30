---
"@cloudflare/kumo": minor
---

Badge: add color-based variants and deprecate semantic variants

- Add color variants: `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `neutral`, `inverted`
- Add subtle variants for each color (`red-subtle`, `orange-subtle`, etc.) with lighter backgrounds and darker text
- Retain `outline` and `beta` variants unchanged
- Deprecate `primary` (use `inverted`), `secondary` (use `neutral`), `destructive` (use `red`), `success` (use `green`)
- Dark mode support: subtle variants flip to dark backgrounds with light text, regular color variants darken slightly, inverted flips to white bg with black text
- Default variant changed from `primary` to `neutral`
