# Spec: Flow Manual Layout

## Problem

The current `Flow` component relies on the DOM's layout algorithm to position the nodes (and subsequently, the arrows connecting the nodes). While this keeps things simple and intuitive, it leads to two main issues:

1. **Incorrect arrows** where arrows are drawn to/from stale node positions.
2. **Animations being practically impossible** as layout has to be synchronously calculated _and_ measured on every frame.

## Solution

Proposal: **Remove Flow's dependency from the DOM by manually calculating layout for each Flow node**.

By maunally calculating layout, we get to control exactly where each Flow node should render and when these updates should occur.

## Implementation

### Considerations

- **Width and height of flow nodes are NOT known ahead of time**. Flow nodes can be arbitrarily rendered using the `render` prop, so we cannot make any assumptions on the size of the flow node without measuring the DOM.


### Phases

There are two phases to this implementation:

1. **Measurement**, where both (a) the width and height of each flow node is recorded, and (b) where links are computed based on component hierarchy.
2. **Layout**, where the positions of each flow node is computed based on the results of (a) and (b) in the measurement phase.
3. **Render**, where the edges between each node is drawn as an SVG path based on the computed coordinates from the layout phase.

### Measurement

**Measuring flow nodes**

Each flow node measures its width and height (via `.getBoundingClientRect()`) on mount and whenever its size changes (detected via `ResizeObserver`). Measurements are recorded at the root `Flow` component.

**Flow state**

```tsx
type FlowState = {
  nodes: {
    [id: string]: {
      width: number;
      height: number;
      position?: { x: number; y: number };
    }
  };
  edges: [string, string][];
}
```

- `width` and `height` are computed within a flow node and passed up to the root flow component
- `edges` is an array of `[to, from]` pairs where `to` and `from` are IDs of flow nodes
- `edges` are computed based on the component hierarchy (see next section for details)
- `position` is populated in the layout phase

**Computing edges**

Edges are computed based on the React component hierarchy according to the following rules:

1. Adjacent `Flow.Node`s are connected from the former flow node to the latter.

```tsx
<Flow>
  <Flow.Node>A</Flow.Node>
  <Flow.Node>B</Flow.Node>
</Flow>
```

```
Edges:
A -> B
```

This applies even if nodes are nested in other elements, as long as they are not nested under other Flow components.

```tsx
<Flow>
  <div>
    <Flow.Node>A</Flow.Node>
  </div>
  <Flow.Node>B</Flow.Node>
</Flow>
```

```
Edges:
A -> B
```

2. `Flow.Node`s adjacent to a `Flow.Parallel` will be connected to _all_ nodes in the parallel group.

```tsx
<Flow>
  <Flow.Node>A</Flow.Node>
  <Flow.Parallel>
    <Flow.Node>B1</Flow.Node>
    <Flow.Node>B2</Flow.Node>
  </Flow.Parallel>
  <Flow.Node>C</Flow.Node>
</Flow>
```

```
Edges:
A -> B1
A -> B2
B1 -> C
B2 -> C
```

3. Adjacent `Parallel` nodes will _not_ link to one another.

```tsx
<Flow>
  <Flow.Node>A</Flow.Node>
  <Flow.Parallel>
    <Flow.Node>B1</Flow.Node>
    <Flow.Node>B2</Flow.Node>
  </Flow.Parallel>
  <Flow.Parallel>
    <Flow.Node>C1</Flow.Node>
    <Flow.Node>C2</Flow.Node>
  </Flow.Parallel>
  <Flow.Node>D</Flow.Node>
</Flow>
```

```
Edges:
A -> B1
A -> B2
C1 -> D
C2 -> D
```

4. `Flow.Node`s adjacent to a `Flow.List` will be connected to the _first_ and _last_ node in the list group.

```tsx
<Flow>
  <Flow.Node>A</Flow.Node>
  <Flow.Parallel>
    <Flow.List>
      <Flow.Node>B1</Flow.Node>
      <Flow.Node>B2</Flow.Node>
    </Flow.List>
    <Flow.Node>C1</Flow.Node>
  </Flow.Parallel>
  <Flow.Node>D</Flow.Node>
</Flow>
```

```
Edges:
A -> B1
A -> C1
B1 -> B2
B2 -> D
C1 -> D
```

**Anchors**

TBD

### Layout

TBD

### Render

TBD