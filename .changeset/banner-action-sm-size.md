---
"@cloudflare/kumo": patch
---

`Banner`: stop rendering `Banner.Action` children at the deprecated
`size="xs"` in compact (`size="sm"`) banners. Both `base` and compact
banners now render actions at `Button`'s `sm` size (26px), which is the
smallest size in the current Button scale. This silences the
`[Kumo Button]: size="xs" is deprecated` warning that was emitted whenever
a compact banner rendered a `Banner.Action`.

`BannerActionSize` narrows from `"xs" | "sm"` to `"sm"`. Consumers didn't
set this prop directly — `Banner.Action` receives its size via context
from the parent `Banner` — so this is a type-level cleanup with no
behavioral change beyond removing the internal `xs` usage.
