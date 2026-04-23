---
"@cloudflare/kumo": patch
---

Improve focus ring consistency and clipping behavior across inputs and related controls.

- Move the command palette focus ring to the input header container with `focus-within` and remove duplicate input-level ring styles.
- Update `Select` trigger and option focus styles to use inset focus rings to prevent clipping in rounded/overflow contexts.
- Fix clipboard copy button focus ring clipping by using inset focus-visible ring, matching border-radius inheritance, and isolated stacking.
- Align `InputGroup` and `InputGroup.Button` focus ring color to `ring-kumo-focus`, including hybrid container-zone focus ring classes.
- Update InputGroup tests to match inline focus ring class changes.
- Set DatePicker (`react-day-picker`) focus ring token to `var(--color-kumo-brand)`.
- Update InputGroup container and hybrid keyboard outlines in `kumo-binding.css` to use `var(--color-kumo-focus)` at 1px weight.
