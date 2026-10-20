---
"@cloudflare/kumo": minor
---

`Link.ExternalIcon` and `LinkButton` with `external` now include localized screen-reader text announcing that the link opens in a new tab. Override the text with the new `label` prop on `Link.ExternalIcon`, or translate it with `KumoLocaleProvider` (`link.opensInNewTab`).

This changes the accessible name of links that use `Link.ExternalIcon` or `LinkButton external` (for example, "Docs" becomes "Docs (opens in a new tab)"). Update tests that query these links by exact name.
