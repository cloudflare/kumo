---
"@cloudflare/kumo": minor
---

`Link.ExternalIcon` and `LinkButton` with `external` now include localized screen-reader text announcing that the link opens in a new tab. Override the text with the new `label` prop on `Link.ExternalIcon`, or translate it with `KumoLocaleProvider` (`link.opensInNewTab`).

`Link` now also accepts `external`, which supplies the new-tab target, default `rel="noopener noreferrer"`, indicator, and localized warning together. Explicit `target` and `rel` props take precedence, and a same-tab target omits the indicator and warning. Do not combine `external` with a manually added `Link.ExternalIcon`.

Unspecified `target` and `rel` props remain absent so custom `LinkProvider` navigation defaults are preserved. Provider-selected new tabs do not automatically add an indicator or warning; those cues remain explicit.

This changes the accessible name of links that use `Link.ExternalIcon` or `LinkButton external` (for example, "Docs" becomes "Docs (opens in a new tab)"). Update tests that query these links by exact name.

Consumer-supplied `aria-label` and `aria-labelledby` values remain unchanged. Icon-only links must supply an explicit accessible name, including the new-tab warning when needed, instead of relying on `title` alone.
