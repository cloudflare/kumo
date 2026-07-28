---
"@cloudflare/kumo": patch
---

`Toolbar`: deprecate `size="xs"`. Use `size="sm"` instead. Toolbar forwards
its `size` to child `Button` and `Input` components, both of which already
deprecated `xs`. To avoid three duplicate warnings for the same underlying
issue, Toolbar now:

1. Emits a single `[Kumo Toolbar]: size="xs" is deprecated` warning at the
   Toolbar level in development, and
2. Silently remaps `xs → sm` internally on the forwarded context so child
   `Button`, `Input`, and `InputGroup` render at their `sm` (26px) size and
   do **not** emit their own deprecation warnings.

The container itself still applies the deprecated size's text class for
backwards visual compatibility. The `xs` size will be removed in a future
major version.
