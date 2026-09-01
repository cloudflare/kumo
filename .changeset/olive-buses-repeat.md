---
"@cloudflare/kumo": patch
---

fix(select): anchor the popup below the trigger and expose placement props

`Select.Positioner` relied on Base UI's `alignItemWithTrigger` default (`true`),
which overlays the popup on the trigger so the selected option's text lands on
the trigger's value text, emulating a native `<select>`. Options always render at
`text-base`, so on `xs`/`sm` triggers the popup was much taller than its anchor,
and Base UI's compensating shift detached it from the trigger — on `xs` it
overhung by 12.5px above and 45.5px below and sat 8px to the left, covering
adjacent content.

The popup now prefers `bottom` placement and is offset from the trigger, with
Base UI's collision avoidance still flipping it automatically when the preferred
side lacks space. Placement is configurable:

| prop                   | default    | notes                                                         |
| ---------------------- | ---------- | ------------------------------------------------------------- |
| `side`                 | `"bottom"` | preferred side; still flips automatically on collision        |
| `sideOffset`           | `4`        | gap between trigger and popup, matching Combobox/Autocomplete |
| `align`                | `"start"`  | alignment along the trigger edge                              |
| `alignOffset`          | —          | additional offset along the alignment axis                    |
| `alignItemWithTrigger` | `false`    | opt back in to the native `<select>` overlay                  |

The remaining Base UI Positioner controls are also forwarded unchanged:
`anchor`, `arrowPadding`, `positionMethod`, `collisionAvoidance`,
`collisionBoundary`, `collisionPadding`, `sticky`, and
`disableAnchorTracking`.

The popup also now tracks the trigger width via `min-w-(--anchor-width)` instead
of `min-w-[calc(var(--anchor-width)+3px)]`, which existed to visually offset the
old item-alignment shift.
