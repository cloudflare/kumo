---
"@cloudflare/kumo": major
---

**BREAKING:** Checkbox `onCheckedChange` now receives event details as second argument

The `onCheckedChange` callback signature now matches Base UI, providing access to the underlying event:

```tsx
// Before
onCheckedChange={(checked) => console.log(checked)}

// After (event details available as optional second arg)
onCheckedChange={(checked, eventDetails) => {
  console.log(checked);
  console.log(eventDetails.event); // native event
}}
```

**Removed deprecated props:**

- `onChange` - use `onCheckedChange` instead
- `onValueChange` on individual checkboxes - use `onCheckedChange` instead
- `onClick` - was redundant, use standard React event handling via spread props

**Migration:**

```tsx
// Before (deprecated)
<Checkbox onChange={(e) => console.log(e.target.checked)} />
<Checkbox onValueChange={(checked) => setChecked(checked)} />

// After
<Checkbox onCheckedChange={(checked) => setChecked(checked)} />
```

Note: `Checkbox.Group`'s `onValueChange` prop is unchanged - it still accepts `(values: string[]) => void`.
