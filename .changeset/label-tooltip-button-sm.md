---
"@cloudflare/kumo": patch
---

`Label`: bump the inline "More information" help button from `size="xs"` to
`size="sm"` (20px → 26px). Follows the Button `xs` deprecation — the label
tooltip trigger is internal, so this is a size increase rather than a
deprecation. The 26px button sits comfortably next to `text-base` (13px)
label copy without dominating it.
