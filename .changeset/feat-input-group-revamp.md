---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": patch
---

Add `InputGroup` compound component for composing decorated inputs

Compound structure: `InputGroup`, `InputGroup.Input`, `InputGroup.Addon`, `InputGroup.Suffix`, `InputGroup.Button`.

- Field integration — pass `label`, `description`, `error`, `required`, and `labelTooltip` directly to `InputGroup`
- Size variants (`xs`, `sm`, `base`, `lg`) propagate to all sub-components via context, including icon sizing in addons
- `InputGroup.Addon` — positions icons, text, or buttons at `align="start"` (default) or `align="end"` of the input
- `InputGroup.Suffix` — inline text suffix (e.g. `.workers.dev`)
- `InputGroup.Button` — ghost button for secondary actions with tooltip support
- Deprecated `InputGroup.Label` — use `InputGroup.Addon` instead
- Deprecated `InputGroup.Description` — use `InputGroup.Suffix` instead

```tsx
{/* Reveal / hide password */}
<InputGroup>
  <InputGroup.Input
    type={show ? "text" : "password"}
    defaultValue="password"
    aria-label="Password"
  />
  <InputGroup.Addon align="end" className="pr-1">
    <InputGroup.Button
      size="sm"
      aria-label={show ? "Hide password" : "Show password"}
      onClick={() => setShow(!show)}
    >
      {show ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup>
```

```tsx
{/* Search input */}
<InputGroup>
  <InputGroup.Addon>
    <MagnifyingGlassIcon className="text-kumo-subtle" />
  </InputGroup.Addon>
  <InputGroup.Input placeholder="Search..." />
</InputGroup>
```
