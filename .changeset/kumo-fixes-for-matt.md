---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": minor
---

fix(cli): resolve broken doc/docs/ls commands by fixing registry path from catalog/ to ai/
fix(dialog): wrap sub-components to isolate @base-ui/react type references from downstream consumers
fix(label): render as `<label>` element with htmlFor support instead of `<span>`
feat(input): add Textarea alias for InputArea
feat(toast): add ToastProvider alias for Toasty
feat(button): require aria-label on icon-only buttons (shape="square" | "circle") via discriminated union
fix(docs): add Tailwind 4 @source directive to usage example, add confirmation dialog recipe, update Select basic example, document icon-only button aria-label pattern
