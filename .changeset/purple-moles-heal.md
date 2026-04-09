---
"@cloudflare/kumo": patch
---

fix(switch): improve animations, disabled state styling, and semantic token support

- Refactored color definitions into getTrackColors() and getThumbColors() helper functions with proper disabled state handling
- Removed opacity-50 and opacity-60 from disabled states to allow custom disabled color palette to be fully visible
- Updated transition timing from duration-150 to duration-250 with cubic-bezier easing for smoother spring effect
- Replaced dark: color variants with semantic tokens (bg-kumo-brand, bg-kumo-recessed, ring-kumo-line, etc.) for proper theming support
