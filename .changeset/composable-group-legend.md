---
"@cloudflare/kumo": minor
---

feat(radio, checkbox, switch): add composable Legend sub-component for group components

- Add `Radio.Legend`, `Checkbox.Legend`, and `Switch.Legend` sub-components
- Accepts `className` for full styling control (e.g. `className="sr-only"` to visually hide)
- Make `legend` string prop optional when using the sub-component instead
- Useful when a parent Field already provides a visible label and the legend would be redundant
- **Breaking:** `Switch.Group` no longer renders a visible border/padding/rounded container — now consistent with `Radio.Group` and `Checkbox.Group`. Use `className` to add a border if needed.
