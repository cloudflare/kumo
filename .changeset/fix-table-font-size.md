---
"@cloudflare/kumo": patch
---

Fix Table body cells rendering at 16px. The Table root now sets text-base (14px) so <td> cells match Kumo's default body font-size instead of inheriting the browser default. Also replaces an arbitrary text-[14px] in Empty with text-base.
