---
"@cloudflare/kumo": minor
---

Make `Button` and `LinkButton` titles reachable by keyboard and screen readers.

A disabled or loading `Button` with a `title` now stays in the tab order with `aria-disabled` instead of native `disabled`, ignores clicks and key presses (including form submission), and is the tooltip trigger itself, so the tooltip opens on hover and keyboard focus. Previously the tooltip was attached to a wrapping `<span>` that couldn't take focus, so keyboard and screen reader users never reached the explanation. Buttons without a `title` are unchanged. If your tests check these buttons with `toBeDisabled()` or `:disabled`, check `aria-disabled="true"` instead.

While disabled or loading, the `title` is also the button's accessible description, unless an icon-only button already uses it as its name. Enabled buttons are not described by their title. Loading buttons set `aria-busy`. Button variants and `InputGroup.Button` style `aria-disabled` buttons like disabled ones, and hover styles that skip disabled buttons skip them too.

The tooltip trigger no longer changes when `disabled` or `loading` toggles, so an open tooltip stays put.
