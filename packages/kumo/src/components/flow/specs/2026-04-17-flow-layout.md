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

There are three phases to this implementation:

1. **Measurement**, where both the width and height of each flow node is recorded and the tree of nodes is derived from the React component structure.
2. **Layout**, where the positions of each flow node is computed based on the results of (a) and (b) in the measurement phase.
3. **Render**, where the edges between each node is drawn as an SVG path based on the computed coordinates from the layout phase.

## Measurement

**Measuring flow nodes**

Each flow node measures its width and height (via `.getBoundingClientRect()`) on mount and whenever its size changes (detected via `ResizeObserver`). Measurements are stored on the node object, which then gets passed up to the root Flow component.

**Flow state**

The root Flow component stores the tree structure of all nodes that it contains, mimicking the React component structure.

```tsx
type FlowState = {
  nodes: {
    [id: string]: {
      width: number;
      height: number;
    }
  };
  tree: TreeNode;
}

type TreeNode = {
  kind: "list" | "parallel"
  children: TreeNode[]
} | {
  kind: "node"
  id: string;
}
```

**Examples**

```tsx
<Flow>
  <Flow.Node>A</Flow.Node>
  <Flow.Node>B</Flow.Node>
</Flow>
```

```tsx
Tree:
{
  kind: "list",
  children: [
    {
      kind: "node",
      id: ... // generated ID from the node component
    },
    {
      kind: "node",
      id: ... // generated ID from the node component
    }
  ]
}
```

---

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

```tsx
Tree:
{
  kind: "list",
  children: [
    {
      kind: "node",
      id: ... // generated ID from the node component
    },
    {
      kind: "parallel",
      children: [
        {
          kind: "node",
          id: ... // generated ID from the node component
        },
        {
          kind: "node",
          id: ... // generated ID from the node component
        },
      ]
    },
    {
      kind: "node",
      id: ... // generated ID from the node component
    }
  ]
}
```

---

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

```tsx
Tree:
{
  kind: "list",
  children: [
    {
      kind: "node",
      id: ... // generated ID from the node component
    },
    {
      kind: "parallel",
      children: [
        {
          kind: "list",
          children: [
            {
              kind: "node",
              id: ... // generated ID from the node component
            },
            {
              kind: "node",
              id: ... // generated ID from the node component
            },
          ]
        },
        {
          kind: "node",
          id: ... // generated ID from the node component
        },
      ]
    },
    {
      kind: "node",
      id: ... // generated ID from the node component
    }
  ]
}
```

## Layout

In the layout phase, the edges and positions of the nodes are derived from the tree stored in state. **Derived is the keyword here**—neither edges nor node positions should be stored in state:

```tsx
const [flowState, setFlowState] = useState(...)

const edges = computeEdges(flowState);
const nodePositions = computePositions(flowState)
```

```tsx
type Edges = [string, string][] // [fromId, toId]
type NodePositions = Record<string, { x: number; y: number }> // string = ID
```

**Computing edges**

Edges are computed from the stored tree according to the following rules:

1. Adjacent nodes are connected from the former flow node to the latter.

```tsx
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    { kind: "node", id: "B" },
  ]
}
```

```
Edges:
A -> B
```

2. Nodes adjacent to a parallel node will be connected to all children of the parallel node.

```tsx
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    {
      kind: "parallel",
      children: [
        { kind: "node", id: "B1" },
        { kind: "node", id: "B2" },
      ]
    },
    { kind: "node", id: "C" },
  ]
}
```

```
Edges:
A -> B1
A -> B2
B1 -> C
B2 -> C
```

3. Adjacent parallel nodes will _not_ link to one another.


```tsx
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    {
      kind: "parallel",
      children: [
        { kind: "node", id: "B1" },
        { kind: "node", id: "B2" },
      ]
    },
    {
      kind: "parallel",
      children: [
        { kind: "node", id: "C1" },
        { kind: "node", id: "C2" },
      ]
    },
    { kind: "node", id: "D" },
  ]
}
```

```
Edges:
A -> B1
A -> B2
C1 -> D
C2 -> D
```

4. Nodes adjacent to a list node will be connected to the _first_ and _last_ node in the list group.

```tsx
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    {
      kind: "parallel",
      children: [
        {
          kind: "list",
          children: [
            { kind: "node", id: "B1" },
            { kind: "node", id: "B2" },
          ]
        },
        { kind: "node", id: "C1" },
      ]
    },
    { kind: "node", id: "D" },
  ]
}
```

```
Edges:
A -> B1
A -> C1
B1 -> B2
B2 -> D
C1 -> D
```

**Computing positions**

```tsx
function computePositions(
  flowState: FlowState,
  { columnGap = 64, rowGap = 48 } = {}
): Record<string, { x: number; y: number }>;
```

Node positions are derived by the size of the node and the group (parallel/list) that the node belongs to.

1. **List**

Children of list nodes are laid out horizontally, separated by `columnGap` between each node.

Given:

```tsx
Nodes:
{
  A: { width: 40, height: 40 },
  B: { width: 60, height: 40 },
  C: { width: 40, height: 40 },
}

Tree:
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    { kind: "node", id: "B" },
    { kind: "node", id: "C" },
  ]
}
```

Output:

```tsx
{
  A: { x: 0, y: 0 },
  B: { x: 40 + <columnGap>, y: 0 },
  C: { x: 40 + <columnGap> + 60 + <columnGap>, y: 0 },
}
```

2. **Parallel**

Nodes within a parallel node are laid out vertically, separated by `rowGap`.

Given:

```tsx
Nodes:
{
  A: { width: 40, height: 40 },
  B1: { width: 60, height: 40 },
  B2: { width: 60, height: 40 },
  C: { width: 40, height: 40 },
}

Tree:
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    {
      kind: "parallel",
      children: [
        { kind: "node", id: "B1" },
        { kind: "node", id: "B2" },
      ]
    },
    { kind: "node", id: "C" },
  ]
}
```

Output:

```tsx
{
  A: { x: 0, y: 0 },
  B1: { x: 40 + <columnGap>, y: 0 },
  B2: { x: 40 + <columnGap>, y: 40 + <rowGap> },
  C: { x: 40 + <columnGap> + 60 + <columnGap>, y: 0 },
}
```

The parallel group should take up the space of the widest child.

Given:

```tsx
Nodes:
{
  A: { width: 40, height: 40 },
  B1: { width: 60, height: 40 },
  B2: { width: 100, height: 40 },
  C: { width: 40, height: 40 },
}

Tree:
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    {
      kind: "parallel",
      children: [
        { kind: "node", id: "B1" },
        { kind: "node", id: "B2" },
      ]
    },
    { kind: "node", id: "C" },
  ]
}
```

Output:

```tsx
{
  A: { x: 0, y: 0 },
  B1: { x: 40 + <columnGap>, y: 0 },
  B2: { x: 40 + <columnGap>, y: 40 + <rowGap> },
  C: { x: 40 + <columnGap> + 100 + <columnGap>, y: 0 },
}
```

This is true if the parallel node has child parallel or list nodes too.

Given:

```tsx
Nodes:
{
  A: { width: 40, height: 40 },
  B1: { width: 60, height: 40 },
  B2: { width: 100, height: 40 },
  C1: { width: 40, height: 40 },
  D: { width: 40, height: 40 }
}

Tree:
{
  kind: "list",
  children: [
    { kind: "node", id: "A" },
    {
      kind: "parallel",
      children: [
        {
          kind: "list",
          children: [
            { kind: "node", id: "B1" },
            { kind: "node", id: "B2" },
          ]
        },
        { kind: "node", id: "C1" },
      ]
    },
    { kind: "node", id: "D" },
  ]
}
```

Output:

```tsx
{
  A: { x: 0, y: 0 },
  B1: { x: 40 + <columnGap>, y: 0 },
  B2: { x: 40 + <columnGap> + 60 + <columnGap>, y: 0 },
  C1: { x: 40 + <columnGap>, y: 40 + <rowGap> },
  D: { x: 40 + <columnGap> + 60 + <columnGap> + 100 + <columnGap>, y: 0 },
}
```

### Anchors

By default, arrows will link to the center point of every `Flow.Node`. Users can adjust this by using the `Flow.Anchor` component:

```tsx
<Flow.Node>
  <Flow.Anchor>Header</Flow.Anchor>
  <div>Some body content</div>
</Flow.Node>
```

Now, arrows will link to the midpoint of the "Header" text instead of the entire node.

Anchors can accept a `type` prop that can either be `start`, `end`, or `both`, defaulting to `both`.

- `type === "start"` — arrows starting at the node will be positioned against the anchor, but arrows ending at the node will remain at the node's centerpoint.
- `type === "end"` — arrows ending at the node will be positioned against the anchor, but arrows starting at the node will remain at the node's centerpoint.
- `type === "both"` — both incoming _and_ outgoing arrows will be positioned against the anchor.

```tsx
<Flow.Node>A</Flow.Node>
<Flow.Node>
  <header>Header</header>
  <div>Body</div>
  <Flow.Anchor type="start">Footer</Flow.Anchor>
</Flow.Node>
<Flow.Node>B</Flow.Node>
```

```
A -|   Header  |-> B
   |-> Body    |
       Footer -|
```

```tsx
<Flow.Node>A</Flow.Node>
<Flow.Node>
  <Flow.Anchor type="end">Header</Flow.Anchor>
  <div>Body</div>
  <Flow.Anchor type="start">Footer</Flow.Anchor>
</Flow.Node>
<Flow.Node>B</Flow.Node>
```

```
A --> Header  |-> B
      Body    |
      Footer -|
```

To implement this, we need to differentiate between the node's _size_ and _anchor points_.

### Render

TBD