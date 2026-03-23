---
"@cloudflare/kumo": patch
---

fix(flow): connector lines no longer misalign when the page scrolls or a sidebar shifts the layout

`getBoundingClientRect` values were stored in React state per node and later subtracted against a freshly-read container rect at connector-draw time. Any layout shift (sidebar open/close, page scroll, inner container scroll) between those two reads produced stale coordinates, causing connector lines to jump out of place or disappear entirely.

Fix: add `scroll` and `resize` listeners (capture phase) at the `FlowNode`, `FlowParallelNode`, and `FlowNodeList` levels so all rects are remeasured after any layout shift. Connector computation in `FlowNodeList` and `FlowParallelNode` is also moved from the render phase into `useLayoutEffect` so the container rect and node rects are always read in the same synchronous pass.
