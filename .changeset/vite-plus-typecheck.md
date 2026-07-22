---
"@cloudflare/kumo": patch
---

Enable full type-checking in `vp check` / `vp lint` (typeAware + typeCheck) and fix the type issues it surfaced in files `tsc --noEmit` never covered. Only runtime-visible change: the CLI entrypoint explicitly voids its `main()` promise.
