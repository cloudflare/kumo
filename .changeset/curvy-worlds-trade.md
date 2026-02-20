---
"@cloudflare/kumo": minor
---

feat(flow): add FlowDiagram components for building directed flow diagrams

New components for visualizing workflows and data flows:

- `FlowDiagram` - Root container with pan/scroll support for large diagrams
- `FlowNode` - Individual node with automatic connector points
- `FlowNode.Anchor` - Custom attachment points for connectors within nodes
- `FlowParallelNode` - Container for parallel branches with junction connectors

Adds `motion` as a new dependency for smooth panning interactions.
