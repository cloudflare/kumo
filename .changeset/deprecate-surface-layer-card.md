---
"@cloudflare/kumo": patch
---

feat(layer-card): support simple card usage and deprecate Surface

- allow `LayerCard` to be used directly without `LayerCard.Primary` for simple single-layer card layouts
- keep `LayerCard.Secondary` and `LayerCard.Primary` supported for the existing layered card pattern
- deprecate `Surface` in favor of `LayerCard` while keeping the old API working as a compatibility wrapper
- update docs and examples to prefer `LayerCard`, including table examples that no longer need a nested `LayerCard.Primary`
