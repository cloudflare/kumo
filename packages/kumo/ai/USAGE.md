# @cloudflare/kumo — AI Usage Guide

> Cloudflare's React component library built on [Base UI](https://base-ui.com) + Tailwind CSS v4.

## Quick Start

### CSS setup (required)

In your main CSS file (e.g. `global.css`), add **all three lines in this order**:

```css
@source "path/to/node_modules/@cloudflare/kumo/dist/**/*.{js,jsx,ts,tsx}";
@import "@cloudflare/kumo/styles";
@import "tailwindcss";
```

- **`@source`** — Tells Tailwind to scan kumo's compiled JS for class names. Without this, kumo component internals will be unstyled. Adjust the relative path so it resolves to your project's `node_modules/`.
- **Import order matters** — `@cloudflare/kumo/styles` must come **before** `@import "tailwindcss"` so kumo's `@theme` tokens are registered first.

### Component usage

```tsx
import { Button, Input, Dialog } from "@cloudflare/kumo";
```

## Critical Rules

1. **Semantic tokens only** — use `bg-kumo-base`, `text-kumo-default`, etc. Never use raw Tailwind colors (`bg-blue-500`).
2. **No `dark:` variant** — light/dark mode is handled automatically via CSS `light-dark()`. Never add `dark:` prefixes.
3. **Merge classes with `cn()`** — import from `@cloudflare/kumo` and use it to combine class names.
4. **Compound components** — many components use a dot-notation API: `<Dialog.Root>`, `<Dialog.Trigger>`, etc.

## Component Quick Reference

| Component | Category | Description | Key Props |
|-----------|----------|-------------|-----------|
| `Badge` | Display | Status/label indicator | `variant`: primary, secondary, destructive, outline, beta |
| `Banner` | Feedback | Page-level alert message | `variant`: default, alert, error; `icon`, `onDismiss` |
| `Breadcrumbs` | Display | Navigation breadcrumb trail | Compound: `.Link` (with `href`), `.Separator`, `.Current`; `size`: sm, base |
| `Button` | Action | Clickable action trigger | `variant`: primary, secondary, ghost, destructive, secondary-destructive, outline; `size`, `shape`, `icon`, `loading` |
| `Checkbox` | Input | Toggle or multi-select control | `checked`, `onCheckedChange`, `label`, `indeterminate` |
| `Checkbox.Group` | Input | Group of checkboxes with fieldset | `legend`, `orientation`, `allValues`, `value`, `onValueChange` |
| `ClipboardText` | Action | Copy-to-clipboard text display | `value`, `label` |
| `Code` | Display | Inline code or multi-line code block | `children`; use `CodeBlock` for multi-line with copy |
| `Collapsible` | Display | Expandable/collapsible section | `title`, `defaultOpen` |
| `Combobox` | Input | Autocomplete input with dropdown | `items`, `value`, `onValueChange`, `multiple`, `label` |
| `CommandPalette` | Navigation | Spotlight-style search overlay | `.Root`, `.Input`, `.List`, `.Item`, `.ResultItem` |
| `DateRangePicker` | Input | Dual-calendar date range selector | `onStartDateChange`, `onEndDateChange`, `size`, `timezone` |
| `Dialog` | Overlay | Modal dialog with backdrop | `size`: sm, base, lg, xl; uses `.Root`, `.Trigger`, `.Title`, `.Close` |
| `DropdownMenu` | Overlay | Context/action menu | `.Trigger`, `.Content`, `.Item`; item `variant`: default, danger |
| `Empty` | Display | Empty state placeholder | `icon`, `title`, `description`, `commandLine`, `contents` |
| `Field` | Input | Form field wrapper with label/error | `label`, `description`, `error`, `required`, `labelTooltip` |
| `Grid` | Layout | Responsive CSS grid | `variant`: 2up, side-by-side, 2-1, 1-2, 1-3up, 3up, 4up, 1-2-4up; `gap`: none, sm, base, lg |
| `Input` | Input | Text input field | `size`: xs, sm, base, lg; `variant`: default, error; `label`, `error` |
| `Label` | Other | Form label with optional tooltip | `children`, `tooltip`, `required` |
| `LayerCard` | Display | Card with header and collapsible body | `title`, `tag`, `actions`, `icon` |
| `Link` | Other | Styled anchor/router link | `variant`: inline, current, plain; `href`, `external` |
| `Loader` | Feedback | Animated loading spinner | `size`: number (default 16) |
| `MenuBar` | Navigation | Horizontal icon toolbar | `isActive`, `options: { icon, tooltip, onClick }[]` |
| `Meter` | Display | Progress/usage meter bar | `value`, `max`, `label`, `size` |
| `Pagination` | Navigation | Page navigation controls | `page`, `setPage`, `perPage`, `totalCount`; `controls`: full, simple |
| `Popover` | Overlay | Popup content anchored to trigger | `.Trigger`, `.Content`, `.Title`, `.Description`, `.Close`; `side`, `align` |
| `Radio` | Input | Single-select radio group | `.Group` with `legend`, `.Item` with `label`, `value` |
| `Select` | Input | Dropdown select menu | `value`, `onValueChange`, `label`, `hideLabel` (default: true); children: `<Select.Option value="…">` |
| `SensitiveInput` | Input | Input with show/hide toggle | `label`, `size`, `variant` |
| `Surface` | Layout | Themed container panel | `variant`: flat, raised; `as` for polymorphic rendering |
| `Switch` | Input | Toggle switch control | `checked`, `onCheckedChange`, `label`, `size` |
| `Table` | Display | Data table with selection | `.Header`, `.Head`, `.Body`, `.Row`, `.Cell`, `.Footer`, `.CheckCell`, `.CheckHead`, `.ResizeHandle`; `layout`: auto, fixed |
| `Tabs` | Navigation | Tabbed navigation | `tabs: { value, label, render? }[]`; `variant`: segmented, underline; `value`, `onValueChange` |
| `Text` | Display | Themed text with semantic variants | `variant`: heading1, heading2, heading3, body, secondary, success, error, mono, mono-secondary; `size`: xs, sm, base, lg; `as` |
| `Toast` / `Toasty` | Feedback | Toast notification system | Wrap app with `<Toasty>`, use `Toast.useToastManager().notify()` |
| `Tooltip` | Overlay | Hover/focus tooltip | `content`, `side`, `align`, `asChild` |

## Semantic Token Reference

### Text Colors
| Token | Purpose |
|-------|---------|
| `text-kumo-default` | Primary text |
| `text-kumo-inverse` | Inverse text (on dark backgrounds) |
| `text-kumo-strong` | Secondary/muted-strong text |
| `text-kumo-subtle` | Muted/placeholder text |
| `text-kumo-link` | Link text |
| `text-kumo-danger` | Error/destructive text |
| `text-kumo-success` | Success text |
| `text-kumo-warning` | Warning text |
| `text-kumo-brand` | Brand-colored text |

### Background Colors
| Token | Purpose |
|-------|---------|
| `bg-kumo-base` | Page/card background |
| `bg-kumo-elevated` | Slightly elevated surface |
| `bg-kumo-overlay` | Overlay/hover background |
| `bg-kumo-contrast` | High-contrast background (inverted) |
| `bg-kumo-control` | Form control background |
| `bg-kumo-fill` | Muted fill (borders, badges) |
| `bg-kumo-fill-hover` | Hover state for fills |
| `bg-kumo-tint` | Subtle tinted background |
| `bg-kumo-interact` | Interactive element background |
| `bg-kumo-brand` | Brand primary background |
| `bg-kumo-brand-hover` | Brand hover background |
| `bg-kumo-danger` | Error/destructive background |
| `bg-kumo-success` | Success background |
| `bg-kumo-warning` | Warning background |

### Border/Ring Colors
| Token | Purpose |
|-------|---------|
| `border-kumo-fill` | Default border |
| `border-kumo-line` | Subtle separator line |
| `ring-kumo-line` | Default ring (input borders) |
| `ring-kumo-ring` | Focus ring |

## Icons

Kumo uses **[Phosphor Icons](https://phosphoricons.com/)** via `@phosphor-icons/react`:

```tsx
import { PlusIcon, TrashIcon, GearIcon } from "@phosphor-icons/react";

<Button icon={PlusIcon}>Add Worker</Button>
<DropdownMenu.Item icon={TrashIcon} variant="danger">Delete</DropdownMenu.Item>
```

## Controlled State Reference

| Component | Value Prop | Change Callback | Default Prop |
|-----------|-----------|-----------------|-------------|
| `Input` | `value` | `onChange` | `defaultValue` |
| `Select` | `value` | `onValueChange` | `defaultValue` |
| `Combobox` | `value` | `onValueChange` | `defaultValue` |
| `Switch` | `checked` | `onCheckedChange` | `defaultChecked` |
| `Checkbox` | `checked` | `onCheckedChange` | `defaultChecked` |
| `Checkbox.Group` | `value` | `onValueChange` | `defaultValue` |
| `Radio.Group` | `value` | `onValueChange` | `defaultValue` |
| `Tabs` | `value` | `onValueChange` | `selectedValue` |

## Common Patterns

### Field Wrapper (label + description + error)
Most input components accept `label`, `description`, and `error` props that automatically wrap the input in a `<Field>`:

```tsx
<Input label="Email" description="We'll never share your email" error="Required" variant="error" />
<Select label="Region" hideLabel={false} error="Please select a region">
  <Select.Option value="us">US East</Select.Option>
  <Select.Option value="eu">EU West</Select.Option>
</Select>
<Combobox label="Tags" items={tags} multiple />
```

> **Note:** `Select` defaults to `hideLabel={true}` (label is screen-reader only). Pass `hideLabel={false}` for a visible label.

### Compound Components
Many components use a compound/dot-notation API via `Object.assign`:

```tsx
<Dialog.Root>
  <Dialog.Trigger render={(p) => <Button {...p}>Open</Button>} />
  <Dialog size="lg" className="p-8">
    <Dialog.Title>Confirm</Dialog.Title>
    <Dialog.Description>Are you sure?</Dialog.Description>
    <Dialog.Close render={(p) => <Button {...p}>Cancel</Button>} />
  </Dialog>
</Dialog.Root>
```

### Loading States
Buttons support a `loading` prop that shows a spinner and disables interaction:

```tsx
<Button loading>Saving...</Button>
```

### Polymorphic Rendering
Some components accept an `as` prop or Base UI's `render` prop:

```tsx
<Surface as="section" variant="raised">Content</Surface>
<Text variant="heading1" as="h2">Custom heading level</Text>
<Dialog.Trigger render={(p) => <Button {...p}>Open</Button>} />
```

## Full Registry

For complete prop details, variant values, Tailwind classes, and code examples for every component, see:

```
@cloudflare/kumo/ai/component-registry.json
```

This JSON file contains structured metadata for all components, optimized for AI/agent consumption.
