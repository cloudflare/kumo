---
"@cloudflare/kumo": minor
---

feat(stepper): add `Stepper` component

New `Stepper` component for multi-step flows, laid out in LayerDialog's layered
frame. Vertical and horizontal orientations, async `beforeNext` validation,
error states, controlled or uncontrolled state, an optional `Stepper.Complete`
view with `reset()`, and `useStepper`/`useStep` hooks. Exported from the
package root and as a dedicated `components/stepper` entry point.
