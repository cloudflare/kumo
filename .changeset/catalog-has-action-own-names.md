---
"@cloudflare/kumo": patch
---

Fix `catalog.hasAction()` reporting `Object.prototype` names such as `toString` and `constructor` as registered actions. It now only returns `true` for names in `actionNames`.
