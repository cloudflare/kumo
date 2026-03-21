---
"@cloudflare/kumo": patch
---

fix(switch): improve animations, disabled state styling, and dark mode support

- Refactored color definitions into getTrackColors() and getThumbColors() helper functions with proper disabled state handling
- Removed opacity-50 and opacity-60 from disabled states to allow custom disabled color palette to be fully visible
- Updated transition timing from duration-150 to duration-250 with cubic-bezier easing for smoother spring effect
- Preserved dark: color variants for proper dark mode support (necessary until semantic tokens exist for these custom neutral/blue colors)
