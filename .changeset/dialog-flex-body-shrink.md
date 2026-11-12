---
"@cloudflare/kumo": patch
---

fix(dialog): let flex column dialogs shrink a scrollable body again

2.18.0 added `*:shrink-0` to every `Dialog`, which stopped dialogs built as `flex flex-col max-h-[…] overflow-hidden` with a `flex-1 min-h-0 overflow-y-auto` body from scrolling: the body kept its full height and the footer was clipped out of reach. `Dialog` no longer sets `flex-shrink` on its children. `LayerCard.Primary` and `LayerCard.Secondary` now carry `shrink-0` themselves, so layered dialogs still keep their sections from being squashed, and a section can opt back into shrinking with `className="min-h-0 flex-1"`.

If you added `*:shrink` to a `Dialog` to work around 2.18.0, it is no longer needed and can be removed.
