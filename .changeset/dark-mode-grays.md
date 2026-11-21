---
"@cloudflare/kumo": minor
---

feat(theme): rework dark mode gray surfaces and borders

Lifts the dark surface ladder so layers separate by lightness (canvas 15.5%, elevated 17.5%, base 20.5%, control 23%, overlay 25%), adds a faint cool tint taken from the brand blue hue (chroma 0.003, hue 260), raises `kumo-tint` to 28% so hover and selected states stay visible on controls, switches `kumo-line` and `kumo-hairline` to translucent white, and lightens the dark placeholder text. The segmented Tabs active indicator now uses `bg-kumo-control` instead of `bg-kumo-base`, so the selected tab sits above its card in dark mode. Light mode and the fedramp theme are unchanged.
