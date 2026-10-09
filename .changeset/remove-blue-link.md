---
"@cloudflare/kumo": major
---

**Breaking:** `Link` now ships a single visual style — an underlined anchor that inherits color from the surrounding text (renders as the default foreground, i.e. black on light mode). The `"inline"`, `"current"`, and `"plain"` variants have been removed and consolidated into a single `"default"` variant.

Migration:

- `<Link variant="inline">` → `<Link>` (default). The result is no longer blue; if you need the brand-blue treatment, wrap the link and add `className="text-kumo-link"` yourself.
- `<Link variant="current">` → `<Link>` (default). Behavior is unchanged; the default now always inherits `currentColor`.
- `<Link variant="plain">` → `<Link className="no-underline">` (or drop `Link` and use a plain `<a>` styled by your app). Kumo no longer ships an un-underlined link variant.

The `KUMO_LINK_VARIANTS` export still exists and continues to satisfy the Kumo variant standard; it now contains a single `default` entry.
