---
"@cloudflare/kumo": patch
---

fix(select): align the trigger surface with form controls

Select triggers now use `bg-kumo-control`, including their open and disabled
states, so they match Input, Combobox, and the rest of the form-control family.
Consumer background classes can still override the default without using
`!important`. The popup remains on the floating `bg-kumo-base` surface.
