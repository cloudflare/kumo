---
"@cloudflare/kumo": minor
---

Badge: replace semantic variants with color-based variants

- Replace `primary`, `secondary`, `destructive`, `success`, `outline`, `beta` with color variants: `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `neutral`, `inverted`
- Add subtle variants for each color (`red-subtle`, `orange-subtle`, etc.) with lighter backgrounds and darker text
- Dark mode support: subtle variants flip to dark backgrounds with light text, regular color variants darken slightly, inverted flips to white bg with black text
