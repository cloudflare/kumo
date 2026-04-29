---
"@cloudflare/kumo": patch
---

`Combobox.Item` now renders a visible disabled state when the `disabled` prop is set. Previously the prop was forwarded to Base UI (so click/keyboard selection were correctly blocked) but the row looked identical to an enabled one. Adds `data-[disabled]:*` Tailwind classes for muted text, `cursor-not-allowed`, reduced opacity, and suppresses the highlight background on disabled rows during keyboard navigation. Also fixes `className` passthrough — user-supplied classes are now merged via `cn()` instead of being overridden.
