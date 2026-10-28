---
"@cloudflare/kumo": minor
---

Refresh DatePicker's styling. Days are 32px squares in 36px columns with 8px between weeks and 14px text, and the previous and next buttons are borderless squares that match the days. Two-month views sit side by side, range bands are rounded at their ends and where weeks wrap, and month and year dropdowns (`captionLayout="dropdown"`) are styled.

DatePicker now uses Kumo tokens instead of hard-coded colors, so it follows the active theme, and `@cloudflare/kumo/styles/standalone` now styles it too. Month-change animations respect `prefers-reduced-motion`.

The `.rdp-*` rules and `--rdp-*` variables in `kumo.css` are gone, apart from the month-change animations. If you customized DatePicker through them, use the `classNames` prop instead.
