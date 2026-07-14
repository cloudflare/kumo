---
"@cloudflare/kumo": minor
---

Fixes muddy CTA colors that washed out against banner backgrounds, adjust banner hues for better contrast and adds new size options.

- Modified existing tokens to better align with banner backgrounds, text and CTA combinations that reflect the different variants
- Added a new `Banner.Action` CTA compound that builds on `Button` with banner-specific accent styling. It supports `primary` (filled), `secondary` (accent-hued outline on a transparent background), and `ghost` variants
- Added a `size` prop to `Banner` (`"base"` | `"sm"`); the compact `"sm"` size suits dialogs and other tight spaces and sets its `Banner.Action` children to the `xs` size
