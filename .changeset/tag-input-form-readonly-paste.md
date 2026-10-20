---
"@cloudflare/kumo": patch
---

Fix three `TagInput` bugs:

- `readOnly` now prevents all value changes. Tags can no longer be removed with their remove buttons or Backspace, and new tags can't be added by typing, pasting, or blurring.
- Pasting comma- or newline-separated text now merges it with the draft text and replaces the current selection before splitting it into tags. Previously, text you were already typing was lost.
- Native forms now submit the accepted tags. With `name`, each tag is submitted as its own form value, so the empty draft is no longer sent. With `required`, validation passes as soon as there is at least one tag.
