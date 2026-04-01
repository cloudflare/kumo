---
"@cloudflare/kumo": minor
---

Add Shadow DOM support via `KumoPortalProvider` and `container` prop on all portal-based components

All overlay components (Dialog, DropdownMenu, Combobox, Select, Tooltip, Popover, CommandPalette, Toast) now support rendering inside Shadow DOM or custom containers.

**New exports:**

- `KumoPortalProvider` - Context provider to set default portal container for all overlays
- `PortalContainer` - Type for portal container (HTMLElement, ShadowRoot, or ref)

**Component updates:**
All portal-based components now accept an optional `container` prop:

- `Dialog` - `container` prop on Dialog component
- `DropdownMenu.Content` - `container` prop
- `Combobox.Content` - `container` prop
- `Select` - `container` prop
- `Tooltip` - `container` prop
- `Popover.Content` - `container` prop
- `CommandPalette.Root` and `CommandPalette.Dialog` - `container` prop
- `Toasty` (Toast provider) - `container` prop

**Usage:**

Set once at the app level:

```tsx
<KumoPortalProvider container={shadowRoot}>
  <App />
</KumoPortalProvider>
```

Or override per component:

```tsx
<Dialog container={customContainer}>
  <Dialog.Title>Modal inside shadow DOM</Dialog.Title>
</Dialog>
```

When no provider or prop is set, components default to `document.body` (existing behavior).
