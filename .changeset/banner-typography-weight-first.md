---
"@cloudflare/kumo": minor
---

`Banner`: align title and description with the weight-first typography scale.
Both now inherit the banner container's text size (`text-base` in
`size="base"`, `text-sm` in `size="sm"`), and the title is distinguished
from the description by `font-medium` alone — matching how
`<Text variant="heading">` relates to `<Text variant="body">`.

Previously the description carried an internal `text-sm` override that made
it render one step below the container's `text-base` title. That override
is gone; a banner now reads as one hierarchy level, with weight as the
signal.

**Rendered pixel changes (as part of the wider font-scale refresh):**

- `size="base"`: title `text-base` renders at 13px (was 14px on the old
  scale). Description was `text-sm` → 13px on both scales; on the new
  scale it now inherits `text-base` at 13px. Net: title shrinks 14 → 13px,
  description stays at 13px, and the two now sit at identical size
  distinguished only by weight.
- `size="sm"`: title and description both render at `text-sm` = 12px (were
  both 13px on the old scale). Description already inherited from the
  container, so the class change is purely a token rename with the same
  net pixel shift the whole scale is undergoing.

The `text-sm` class is no longer applied directly to the description
element in either size; it lives on the banner container. If you were
relying on that class being present on the description node specifically
(e.g. for selector-based styling), update to select the banner container
instead.

**Visual regression note:** consumers with Chromatic or screenshot tests on
`Banner` will see diffs — the title shrinks on `size="base"`, and the
whole component picks up the refreshed scale on both sizes. This is
intentional; approve the new baseline.
