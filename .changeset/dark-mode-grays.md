---
"@cloudflare/kumo": minor
---

feat(theme): rework dark mode gray surfaces and borders

Lifts the dark surface ladder so layers separate by lightness (canvas 15.5%, elevated 17.5%, base 20.5%, overlay 25%), adds a faint cool tint taken from the brand blue hue (chroma 0.003, hue 260), switches `kumo-line` and `kumo-hairline` to translucent white, matches `kumo-control` to `kumo-base` so inputs rely on their ring like in light mode, and lightens the dark placeholder text. Light mode and the fedramp theme are unchanged.
