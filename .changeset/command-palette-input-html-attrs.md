---
"@cloudflare/kumo": patch
---

Allow `CommandPalette.Input` to accept standard HTML input attributes (`autoComplete`, `autoCorrect`, `autoCapitalize`, `spellCheck`, `data-*`, etc.) by extending its props type with `InputHTMLAttributes<HTMLInputElement>`. Export new `CommandPaletteInputProps` type.
