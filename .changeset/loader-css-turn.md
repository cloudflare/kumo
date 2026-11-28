---
"@cloudflare/kumo": patch
---

`Loader` now draws a fixed arc and turns it with a CSS `transform` animation (`motion-safe:animate-[spin_2s_linear_infinite]`) instead of three SVG SMIL elements. In WebKit the SMIL version stood still on its first frame, a dot on the faint ring, when macOS "Auto-play animated images" was off, and where it ran it was repainted every frame. The new arc turns once every 2s, as before, and stands still when the user prefers reduced motion. The arc keeps the old animation's longest length (`stroke-dasharray` `42 150`) but no longer grows and shrinks. Props, sizes, `role="status"` and `aria-label` are unchanged.
