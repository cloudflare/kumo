---
"@cloudflare/kumo": patch
---

Improve Flow diagram components with disabled node support and better connector rendering:

- Add `disabled` prop to FlowNode for greying out connectors
- Add `align` prop to FlowParallelNode for start/end alignment
- Improve connector path rendering with smarter junction detection
- Fix panning behavior to not interfere with node interactions
