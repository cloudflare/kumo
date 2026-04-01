---
"@cloudflare/kumo": patch
---

Switch: polish squircle styling

- Use `ring-inset` on thumb to prevent border protruding beyond the track
- Make thumb ring transparent to remove visible border outline
- Switch focus indicator from `ring` to `outline` with `outline-offset-2` to avoid clashing with the track's own ring border
