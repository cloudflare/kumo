---
"@cloudflare/kumo": minor
---

Deprecate `kumo-hairline` token in favor of `kumo-line`.

The `kumo-line` token has been redefined to use 10% black in light mode and 10% white in dark mode, unifying the two former border/ring tokens into a single semantic token. All internal usage has been migrated from `kumo-hairline` to `kumo-line`.

For backwards compatibility, `--color-kumo-hairline` is kept as a CSS alias for `--color-kumo-line`. Existing consumers using `bg-kumo-hairline`, `border-kumo-hairline`, `ring-kumo-hairline`, etc. will continue to work but should migrate to the `kumo-line` equivalents. The alias will be removed in the next major release.
