---
"@cloudflare/kumo": minor
---

`Button`: refresh size scale to align with the refreshed typography.

**Height changes:**

| Size | Before | After |
| ---- | ------ | ----- |
| `sm` | 26px   | 26px (unchanged) |
| `base` | 36px | 32px |
| `lg` | 40px   | 36px |

**Font size:** `sm` buttons render at `text-sm` (12px) — one step below body
— so a small button reads as secondary next to `base` (13px) copy. `base`
and `lg` both render at `text-base` (13px); `lg` signals prominence via
height and padding, not larger type, so a button-plus-input row keeps its
type on one line without vertical bounce.

**Optical centering (`sm`):** `sm` now applies `leading-none` to fix vertical
centering. At 12px the default `text-sm` line-height (~17px) combined with
the 26px button height left ~8.6px of slack that sans-serif ascender-heavy
metrics pushed off-center. Collapsing the line-box to glyph height lets flex
centering land the text exactly on the button's optical midline. Other sizes
keep their default `text-base` line-heights.

**Deprecated:** `size="xs"`. Use `size="sm"` instead. The `xs` variant still
renders and looks the same as before, but emits a `console.warn` in
development and will be removed in a future major version.

Icon-only (`shape="square"` / `shape="circle"`) buttons shrink in step with
their text siblings — `base` is 32×32, `lg` is 36×36.
