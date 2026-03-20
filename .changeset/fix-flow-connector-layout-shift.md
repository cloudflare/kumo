---
"@cloudflare/kumo": patch
---

fix(flow): vibe-coded POC for connector misalignment on scroll/layout shift — not sure if this fully works

Connector lines were jumping out of place (or disappearing entirely) when a sidebar opened/closed or the page/inner container scrolled. Suspected root cause: `getBoundingClientRect` values stored in node state were going stale relative to the live `containerRect` read at connector-draw time.

Attempted fix: add `scroll`/`resize` listeners at the `FlowNode`, `FlowParallelNode`, and `FlowNodeList` levels so rects get remeasured after any layout shift. Also moved connector computation out of `useMemo`/render phase into `useLayoutEffect` so all DOM reads happen in the same synchronous pass.

Seems to work against a repro demo (sidebar toggle + inner scroll), but hasn't been tested against the real Stratus layout yet. Treat as a POC.
