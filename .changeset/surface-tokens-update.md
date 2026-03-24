---
"@cloudflare/kumo": minor
---

Adjust semantic color tokens and generated theme output for Kumo surfaces and neutrals.

Specific token updates:

- Renamed `kumo-surface` to `kumo-canvas`.
- Added new semantic token `kumo-active` for active states.
- Update token mapping across different themes and states.
- Base neutral token scale updates in `kumo-binding.css`.
- Updated `Tabs` component to use `kumo-recessed` since `kumo-surface` was removed.
- Update all instances of `ring-kumo-line` with `ring-kumo-ring`.
- Updated `LayerCard` with `ring-kumo-ring` instead of `ring-kumo-fill`.
- Update all instances of `bg-kumo-elevated` with `bg-kumo-base` or `bg-kumo-recessed` in `Combobox` specifically since it depends on context and placement of components
- Update all instances of `bg-kumo-control` with `bg-kumo-base`