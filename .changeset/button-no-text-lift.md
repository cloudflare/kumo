---
"@cloudflare/kumo": patch
---

`Button` and `LinkButton` no longer lift their label with bottom padding. The lift centered Latin lowercase but pushed Japanese, Chinese, Korean and all-caps labels about 1px above center. Labels now sit at the line box center again. The reduced leading padding for icon + text buttons is unchanged.
