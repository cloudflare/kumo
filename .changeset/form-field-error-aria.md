---
"@cloudflare/kumo": patch
---

fix(field, select, radio, checkbox): expose form errors to assistive technology

- An always-shown `error` (a string, or `{ message, match: true }`) now sets `aria-invalid` on `Input`, `InputArea`, `Select`, `InputGroup`, and any control inside `Field`. Errors keyed to a validity state (`match: "valueMissing"`, …) keep Base UI's own validity tracking. Native form validation is unchanged.
- `Select` passes `aria-*` and `data-*` props (`aria-describedby`, `aria-invalid`, `data-testid`, …) to its trigger. They used to be dropped. An external `aria-describedby` is merged with the description or error id.
- `Select` without a visible label (`aria-label`, or the deprecated `hideLabel`) now links its `description` or `error` to the trigger and marks it invalid, as it already did with a visible label.
- `Radio.Group` and `Checkbox.Group` link their `error` and `description` to the group and to each radio or checkbox with `aria-describedby`. An `error` sets `aria-invalid` on the radio group, or on each checkbox.
- `Input` and `Checkbox` no longer warn about a missing accessible name when an enclosing `Field` (or `InputGroup` with `label`) labels them.
