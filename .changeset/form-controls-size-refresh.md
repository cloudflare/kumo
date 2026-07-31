---
"@cloudflare/kumo": minor
---

Align form control sizes with the refreshed Button scale. Affects `Input`,
`InputArea`, `Select`, `Combobox`, `Autocomplete`, and `InputGroup`.

**Height changes:**

| Size | Before | After |
| ---- | ------ | ----- |
| `sm` | 26px   | 26px (unchanged) |
| `base` | 36px | 32px |
| `lg` | 40px   | 36px |

**Font size:** `sm` form controls now use `text-sm` (12px) instead of
`text-xs` (11px), matching Button's `sm`. `base` and `lg` remain at
`text-base` (13px) — form inputs stay at body-text legibility across their
larger sizes rather than scaling their type up with height. Button follows
the same policy at `lg` (also `text-base`, 13px), so a button-plus-input
row keeps its type on one line; `lg` here signals a larger touch target
and prominence, not larger type.

**Deprecated:** `size="xs"` on all form controls. Use `size="sm"` instead.
The `xs` variant still renders and looks the same as before, but emits a
`console.warn` in development and will be removed in a future major version.

**Trigger icon sizes** shrink to sit visually flush with the refreshed text
scale. Caret icons shrink one step at every size; the clear X in
`Combobox.TriggerInput` shrinks **two** steps so it doesn't out-weight the
caret next to it (Phosphor's `XIcon` has two crossed strokes and reads
heavier than a single-stroke caret at matching pixel sizes).

| Size | Caret before → after | Combobox clear X before → after |
| ---- | -------------------- | ------------------------------- |
| `xs` | 12px → 10px          | 12px → 8px                      |
| `sm` | 14px → 12px          | 14px → 10px                     |
| `base` | 16px → 14px        | 16px → 12px                     |
| `lg` | 18px → 16px          | 18px → 14px                     |

Applies to `Combobox` (both trigger icons) and `Select` (caret-down).
Previously at `base` a 16px icon read as ~123% of the 13px label and looked
heavy. The chip-remove X inside `Combobox` multi-select chips is unchanged
(already 10px, sits correctly against chip typography). Select's Figma
styling metadata is updated accordingly (`height: 36 → 32`,
`fontSize: 16 → 13`).
