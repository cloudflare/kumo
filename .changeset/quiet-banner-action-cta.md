---
"@cloudflare/kumo": patch
---

Softens the `Banner.Action` CTA so it no longer overpowers the banner's message.

- `Banner.Action` now defaults to `variant="secondary"` instead of `variant="primary"`. The default treatment is an accent-tinted fill with an accent hairline, which reads as a button without competing with page-level CTAs. Opt back in with `variant="primary"` when the banner's action is the single most important one on the page.
- Brightened the `secondary` and `ghost` accent colors. Labels and icons now use the banner's accent text token directly rather than inheriting the container color, which previously picked up the neutral banner's dimmed `text-kumo-default/70` and made the CTA look muddy.
- Gated all `Banner.Action` hover colors behind `not-disabled:`, so hover styling stays inert on disabled and loading actions.
