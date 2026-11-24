---
"@cloudflare/kumo": major
---

`TableOfContents` and `PoweredByCloudflare` resolve links through `LinkProvider`. With this change no Kumo component renders a raw anchor or sets `target` on its own.

## `TableOfContents`

- `TableOfContents.Item` and `TableOfContents.Group` with `href` resolve through `LinkProvider`. Items with in-page fragments (`#intro`) stay plain anchors.
- `TableOfContents.Item`'s `render` is now only for custom non-link elements, such as `render={<button type="button" />}`. Remove `render={<RouterLink />}`; configure the router on `LinkProvider` instead. An element passed to `render` doesn't go through `LinkProvider`.

## `PoweredByCloudflare`

- The badge no longer always opens in a new tab. It follows the provider's `externalLinks` policy, which defaults to the current tab. Pass `target="_blank"` to keep the old behavior. When it opens in a new tab, it shows the new-tab icon and announcement like any other link; `newTabIcon={false}` hides the icon.
- The badge's logo is now decorative (`aria-hidden`), so its accessible name is "Powered by Cloudflare" instead of "Cloudflare logo Powered by Cloudflare". The standalone `CloudflareLogo` keeps its "Cloudflare logo" label.

## Added

- `newTabIcon` on `TableOfContents.Item`, `TableOfContents.Group`, and `PoweredByCloudflare`
