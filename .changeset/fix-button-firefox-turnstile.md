---
"@cloudflare/kumo": patch
---

fix(button): resolve Firefox rendering artifact when Turnstile is present

Replace `translate-y-px` with `box-shadow: inset 0 1px 0 0 var(--kumo-button-emphasis-bg)` on the primary/destructive button emphasis overlay span. The transform triggered a rendering bug in Firefox on pages with Turnstile's `contain: strict` CSS. The box-shadow achieves the same visual depth effect without the rendering issue.
