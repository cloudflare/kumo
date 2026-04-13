---
"@cloudflare/kumo": minor
---

feat(popover): expose `anchor` prop on `Popover.Content` for virtual positioning

Forwards Base UI's `anchor` prop through `Popover.Content` to the underlying `Positioner`, enabling popover positioning against custom elements, refs, or virtual points (e.g., a `DOMRect` from `getBoundingClientRect()`). This is useful when the popover trigger and the desired anchor are in different component trees, or when anchoring to a coordinate rather than a DOM element.
