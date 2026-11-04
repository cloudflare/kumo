---
"@cloudflare/kumo": patch
---

Fix several catalog runtime bugs:

- `setByPath` replaces `null` intermediate values instead of throwing, and ignores `__proto__`/`constructor`/`prototype` segments
- `getByPath` and `setByPath` decode JSON Pointer escapes (`~1` → `/`, `~0` → `~`)
- `{ auth }` conditions now work inside `and`/`or`/`not` visibility expressions (evaluator, `LogicExpression` type, and Zod schema). Unrecognised `auth` values now hide the element instead of showing it
- `resolveProps` resolves `{ path }` references inside arrays
- `hasAction` no longer reports `Object.prototype` names such as `toString` as registered actions
