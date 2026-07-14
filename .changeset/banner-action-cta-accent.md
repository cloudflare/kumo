---
"@cloudflare/kumo": minor
---

Improves Banner contrast and CTA colors, adds compact sizing, and keeps components that consume the updated status tokens visually balanced.

- Updated status tokens to improve contrast between Banner backgrounds, text, and CTAs.
- Rebalanced Badge status tints, Toast backgrounds, and Command Palette search highlights to correspond with the updated tokens.
- Added a new `Banner.Action` CTA compound that builds on `Button` with banner-specific accent styling. It supports `primary` (filled), `secondary` (accent-hued outline on a transparent background), and `ghost` variants.
- Added a `size` prop to `Banner` (`"base"` | `"sm"`); the compact `"sm"` size suits dialogs and other tight spaces and sets its `Banner.Action` children to the `xs` size.
