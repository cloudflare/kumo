---
"@cloudflare/kumo": minor
---

**Select: Improved label API to match Input component pattern**

- `hideLabel` is now deprecated. When `label` is provided, the label is **visible by default** (previously hidden by default).
  - For visible labels: `<Select label="Country" />` (no changes needed if you were using `hideLabel={false}`)
  - For hidden labels: Use `<Select aria-label="Select a country" />` instead of `<Select label="Country" hideLabel={true} />`

- **Bug fix**: Placeholder text now displays correctly when using object map `items` format (e.g., `items={{ a: "Option A" }}`). Previously, placeholders only worked with array format items.

**Backward compatibility**: `hideLabel={true}` still works but shows a deprecation warning in development. Existing code using `hideLabel={false}` requires no changes.

**Migration guide:**

```tsx
// Before (label hidden by default)
<Select label="Country" />                    // label was sr-only
<Select label="Country" hideLabel={false} />  // label was visible

// After (label visible by default, matching Input)
<Select label="Country" />                    // label is now visible
<Select aria-label="Country" />               // use aria-label for hidden labels
```
