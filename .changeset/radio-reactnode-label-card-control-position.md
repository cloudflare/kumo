---
"@cloudflare/kumo": minor
---

feat(radio): accept ReactNode for `Radio.Item` label and honor `controlPosition` on card appearance

- `Radio.Item`'s `label` prop now accepts `ReactNode`, allowing icons, badges, or other markup alongside text.
- `Radio.Group`'s `controlPosition` prop now takes effect on `appearance="card"`. Card appearance continues to default to `"end"` (radio on the right); pass `controlPosition="start"` to render the radio on the left of the label and description.
