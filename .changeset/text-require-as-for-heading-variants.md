---
"@cloudflare/kumo": major
---

**BREAKING (v2):** `Text` requires an explicit `as` prop when `variant` is a heading (`"heading1"`, `"heading2"`, `"heading3"`).

The previous major bump ([#393](https://github.com/cloudflare/kumo/pull/393)) decoupled heading variants from semantic HTML — heading variants render as `<span>` unless an `as` prop is provided. That made the library more flexible but introduced a silent accessibility footgun: forgetting `as` on a real section heading produced a `<span>`, excluding it from the document outline without any type-level feedback.

This change makes `as` **required** for heading variants via a discriminated union. Body and monospace variants are unchanged (`as` remains optional; defaults to `<p>` and `<span>` respectively).

### Migration

Every `<Text variant="heading1">`, `<Text variant="heading2">`, `<Text variant="heading3">` must now pass `as`. TypeScript will flag each call site:

```tsx
// Before (compiled, silently produced a <span>)
<Text variant="heading1">Page Title</Text>

// After (required)
<Text variant="heading1" as="h1">Page Title</Text>

// Still allowed — decorative heading-styled text that is NOT a section heading:
<Text variant="heading1" as="span">Big bold card label</Text>
```

For each heading call site, decide whether it's a real section heading (use `as="h1"`/`"h2"`/etc.) or decorative (use `as="span"`). Codemod cannot make this choice mechanically — it is a semantic judgment per usage.

Body and monospace variants: no changes required.
