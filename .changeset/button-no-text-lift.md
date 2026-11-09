---
"@cloudflare/kumo": patch
---

`Button` and `LinkButton` labels are now vertically centered regardless of where the button sits on the page. The bottom-padding text lift is removed, and `base` and `lg` buttons use a 20px line height (`leading-5`) so the gap between the label and the button edge is a whole pixel. With the old 21px line height that gap was 7.5px, and browsers rounded the text up or down depending on the button's position, so labels could render 1px high. `Select` triggers use the same size classes and get the same fix. The reduced leading padding for icon + text buttons is unchanged.
