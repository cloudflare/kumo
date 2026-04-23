---
"@cloudflare/kumo": minor
---

feat(table): add `onCheckedChange` prop to `Table.CheckCell` and `Table.CheckHead`, aligning with the `Checkbox` component's signature.

The new prop exposes an optional second argument with event details, matching Base UI's idiom:

```tsx
<Table.CheckCell
  checked={selected.has(row.id)}
  onCheckedChange={(checked, eventDetails) => {
    toggle(row.id);
    eventDetails?.event.stopPropagation();
  }}
/>
```

The existing `onValueChange` prop still works but is now deprecated and flagged by the `no-deprecated-props` lint rule. It will be removed in a future major version. Migrate by renaming the prop — the single-argument callback shape is preserved.

This change is additive and does not require consumer code changes at this time.
