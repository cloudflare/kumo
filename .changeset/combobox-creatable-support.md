---
"@cloudflare/kumo": minor
---

Add creatable combobox support with a new `onCreate` prop and matching docs/demo coverage.

- Show a `Create "..."` option when the current input has no exact match
- Call `onCreate` when the creatable option is selected so apps can append and select the new item
- Preserve existing item rendering, filtering, and equality hooks while supporting the creatable sentinel item internally
- Document the creatable pattern and add a dedicated docs demo
