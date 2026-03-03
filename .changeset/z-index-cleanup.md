---
"@cloudflare/kumo": patch
---

Standardize z-index usage with isolation containment

- Add `isolation: isolate` to components with internal stacking (Tabs, MenuBar, InputGroup, Flow/Parallel)
- Simplify internal z-index values to `z-0`/`z-1`/`z-2` instead of arbitrary values like `z-10`/`z-20`
- Remove superfluous `z-10` from CommandPalette List
- Update Toast viewport to `z-1` (matching Base UI's documented pattern)
- Update ClipboardText viewport to use `isolate` instead of `z-50`

This prevents z-index values from leaking outside component boundaries.
