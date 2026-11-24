---
"@cloudflare/kumo": minor
---

`Button`: a disabled or loading button with a `title` can now be reached by keyboard and screen readers. It stays in the tab order with `aria-disabled="true"` instead of native `disabled`, ignores clicks and key presses, opens its tooltip on focus, and uses the title as its description, unless the title repeats the button's name. Buttons without a `title` are unchanged.

If your tests check these buttons with `toBeDisabled()` or `:disabled`, check `aria-disabled="true"` instead. The title is also rendered as hidden text inside the button, so the button's `textContent` includes it, and `getByText(title)` finds two matches when the same text is shown elsewhere on the page.
