---
"@cloudflare/kumo": major
---

feat(Collapsible)!: refactor to compound component API

**Breaking change:** Collapsible now uses a compound component pattern matching other Kumo components like Popover and Dialog.

### Before

```tsx
<Collapsible label="Show details" open={open} onOpenChange={setOpen}>
  Content here
</Collapsible>
```

### After

```tsx
<Collapsible.Root open={open} onOpenChange={setOpen}>
  <Collapsible.Trigger>Show details</Collapsible.Trigger>
  <Collapsible.Panel>Content here</Collapsible.Panel>
</Collapsible.Root>
```

### Migration

For the quickest migration, use the new `DefaultTrigger` and `DefaultPanel` components which preserve the previous styling:

```tsx
<Collapsible.Root open={open} onOpenChange={setOpen}>
  <Collapsible.DefaultTrigger>Show details</Collapsible.DefaultTrigger>
  <Collapsible.DefaultPanel>Content here</Collapsible.DefaultPanel>
</Collapsible.Root>
```

### New Sub-components

| Component | Description |
|-----------|-------------|
| `Collapsible.Root` | Manages open state |
| `Collapsible.Trigger` | Composable trigger with `render` prop support |
| `Collapsible.Panel` | Content container |
| `Collapsible.DefaultTrigger` | Pre-styled trigger with caret icon (migration helper) |
| `Collapsible.DefaultPanel` | Pre-styled panel with border-left accent (migration helper) |
