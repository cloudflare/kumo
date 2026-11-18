---
"@cloudflare/kumo": major
---

Remove the `xs` and `lg` control sizes. Button (including `RefreshButton` and `LinkButton`), Input, InputArea, InputGroup, Select, Combobox, Autocomplete, SensitiveInput, Toolbar, and Switch now only accept `size="sm"` and `size="base"`.

Migration: replace `size="xs"` with `size="sm"` and `size="lg"` with `size="base"`. Unknown sizes passed at runtime fall back to `base` with a dev-mode warning.

Related changes:

- `Banner.Action` is always `sm`, so actions in a `size="sm"` banner are now `sm` instead of `xs`. `BannerActionSize` is now `"sm"`.
- `InputGroup.Button` in a `size="sm"` group now renders at `sm` instead of `xs`.
- `ClipboardText` keeps its `lg` size, but it now renders at the `base` control height (36px instead of 40px).
