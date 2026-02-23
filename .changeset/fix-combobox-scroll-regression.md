---
"@cloudflare/kumo": patch
---

Fix Combobox dropdown scrolling regression and improve scroll behavior.

**Bug fix:** The `overflow-hidden` class was accidentally re-introduced during a semantic color token migration, which overrode `overflow-y-auto` and caused dropdown content to be clipped instead of scrollable.

**Improvement:** Restructured Combobox.Content to use flexbox layout so that when using `Combobox.Input` inside the dropdown (searchable popup pattern), the input stays fixed at the top while only the list scrolls. Previously, the entire popup content would scroll together.

**Scrollbar fix:** Moved horizontal padding from the popup container to individual child components, so the scrollbar renders flush with the popup edge instead of being inset (which was clipping the checkmark indicators).
