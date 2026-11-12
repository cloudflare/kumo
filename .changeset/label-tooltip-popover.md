---
"@cloudflare/kumo": minor
---

Open `Label`'s info button (`tooltip`, and `labelTooltip` on form controls) with a tap or Enter, and expose its content to screen readers.

The info button now opens a popover instead of a tooltip. Hover still opens it after the same delay. A tap, a click, Enter or Space also opens it, and its content is a `dialog` that assistive technology can reach. Before, touch users couldn't open it and screen readers never announced its content. Keyboard focus alone no longer opens it; press Enter. Tests that find the content after hovering keep working; tests that look for the tooltip by role should look for `dialog`.
