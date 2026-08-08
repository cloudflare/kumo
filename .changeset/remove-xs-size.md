---
"@cloudflare/kumo": major
---

**BREAKING:** Remove the `xs` size variant from `Button`, `Input`, `InputArea`, `InputGroup`, `Select`, `Combobox`, `Autocomplete`, `SensitiveInput`, and `Toolbar`.

The type unions no longer include `"xs"` and the runtime `KUMO_*_VARIANTS.size` objects no longer contain an `xs` entry. Passing `size="xs"` will fail TypeScript compilation. Migrate to `size="sm"` — it is the next visual step and remains available.

**`Banner`:** A `size="sm"` Banner used to render its `Banner.Action` children at Button's `xs` size (h-5). It now renders them at `sm` (h-6.5) instead. `Banner.Action` accepts only `size="sm"` as a consequence.

**Unaffected:**

- `Text` — `xs` is a legitimate typographic step (12px) and stays.
- `Banner.Action` — the type still exists but is narrowed to `"sm"` only.
