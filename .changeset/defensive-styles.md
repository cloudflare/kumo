---
"@cloudflare/kumo": patch
---

fix: add defensive styles to prevent global CSS pollution

## Problem

When Kumo components are used in applications with aggressive global styles (e.g., Stratus's `cfBaseStyles` layer), certain elements get polluted:

- `label { margin-bottom: 1rem }` adds unwanted margins to all labels
- `button { background: gray }` affects unstyled button wrappers (e.g., tooltip triggers)
- `a { color: var(--text-color-primary) }` can override link colors if the consuming app defines `--text-color-primary` differently

## Solution

Add defensive Tailwind utility classes directly to components. These:

1. Reset commonly-polluted properties to safe defaults
2. Use `cn()` (tailwind-merge) so consumer styles via `className` still override them
3. Are no-ops in clean CSS environments (no visual change in Kumo docs)

## Changes

### Label margins (`m-0`)

- **Label**: `labelVariants()` now includes `m-0`
- **Field**: `FieldBase.Label` gets `m-0`
- **Checkbox**: label wrapper gets `m-0`
- **Radio**: label wrapper gets `m-0`
- **Switch**: label wrapper gets `m-0`

### Button trigger resets

- **Tooltip trigger** (when `!asChild`): `bg-transparent border-none shadow-none p-0 m-0 h-auto min-h-0 leading-[0] inline-flex items-center`
- **Collapsible trigger**: `bg-transparent border-none shadow-none p-0 m-0`

### Link color namespace fix

- **Link**: Changed from `text-primary` to `text-kumo-link` to avoid collision with consuming apps that define `--text-color-primary` differently

### Label tooltip composition

- **Label**: Tooltip trigger now uses `<Button variant="ghost" size="xs" shape="square">` with `asChild`, leveraging composition instead of relying on defensive resets

## Docs

Added "Custom Trigger" section to Tooltip docs demonstrating that `className` can fully override defensive styles when not using `asChild`.
