---
"@cloudflare/kumo": patch
---

fix(select): scale popup options with `size`, and add a gap when the popup falls back to anchoring

Two related popup fixes. Neither changes the native-select alignment behaviour —
`Select.Positioner` still uses Base UI's `alignItemWithTrigger`, so the selected
option is still placed on top of the trigger whenever there is room.

**1. Options now scale with the trigger `size`.**

`Select.Option` and `Select.GroupLabel` hardcoded `text-base` / `py-1.5`, so the
popup rendered at `base` proportions no matter what `size` the trigger used — an
option row was a fixed 33px against a 20px `xs` trigger. Base UI shifts the
popup to compensate for that mismatch, which visibly detached it from its
anchor: on `xs` the popup overhung by 12.5px above and 45.5px below and was
pushed 8px left, covering adjacent content.

Option and group-label metrics now track the trigger through a size context, so
row height matches trigger height and text indent matches trigger padding:

| size | trigger | option row (before → after) | popup x-shift (before → after) |
| ---- | ------- | --------------------------- | ------------------------------ |
| `xs` | 20px    | 33px → 20px                 | -8px → 0                       |
| `sm` | 26px    | 33px → 26px                 | -8px → 0                       |
| `lg` | 40px    | 33px → 37px                 | -8px → 0                       |

`base` is unchanged. A selected option now lands exactly on the trigger at every
size instead of being offset.

**2. The anchored fallback gets a 4px offset.**

When there is not enough room to overlay the trigger, Base UI falls back to
normal anchored positioning. That fallback previously rendered flush against the
trigger; it now uses `sideOffset={4}`, matching Combobox and Autocomplete.

`sideOffset` only affects the fallback — Base UI discards the anchored styles
while `alignItemWithTrigger` is active — so the overlay behaviour is untouched.
