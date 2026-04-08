# Component Source (`src/components/`)

39 UI components. Base UI primitives + Tailwind v4 styling. Compound component pattern throughout.

**Parent:** See [packages/kumo/AGENTS.md](../../AGENTS.md) for library context.

## STRUCTURE

Each component follows: `{name}/{name}.tsx` + optional `{name}.test.tsx`, `{name}.browser.test.tsx`

```
components/
├── button/button.tsx           # Simple component
├── dialog/dialog.tsx           # Compound (Root, Trigger, Title, Description, Close)
├── command-palette/            # Complex: 865 lines, 14 sub-components, 2 contexts
├── date-range-picker/          # Complex: 667 lines (DEPRECATED, refactoring target)
├── combobox/                   # Complex: 561 lines (Root, Content, TriggerValue, TriggerInput, Item, Chip)
├── flow/                       # 8 files, descendants tracking system
├── chart/                      # 5 files, ECharts wrapper + timeseries + sparkline
└── ...
```

## REQUIRED EXPORTS

Every component file MUST export (lint-enforced by `enforce-variant-standard`):

```typescript
// 1. Variants object - machine-readable styling options
export const KUMO_BUTTON_VARIANTS = {
  variant: {
    primary: { classes: "bg-kumo-brand ...", description: "Primary action" },
    secondary: { classes: "bg-kumo-elevated ...", description: "Secondary action" },
    // ...
  },
  size: { xs: {...}, sm: {...}, base: {...}, lg: {...} },
  shape: { base: {...}, square: {...}, circle: {...} }
} as const;

// 2. Defaults - must reference keys from variants
export const KUMO_BUTTON_DEFAULT_VARIANTS = {
  variant: "secondary",
  size: "base",
  shape: "base"
} as const;

// 3. Optional: Figma plugin metadata
export const KUMO_BUTTON_STYLING = {
  baseClasses: "inline-flex items-center ...",
  iconPosition: "left"
} as const;
```

## COMPONENT PATTERNS

### Simple Component

```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, shape, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";  // REQUIRED (77 total across codebase)
```

### Compound Component (Object.assign)

13 components use this pattern:

```typescript
const DialogRoot = forwardRef<...>(...);
const DialogTrigger = forwardRef<...>(...);
const DialogTitle = forwardRef<...>(...);

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Title: DialogTitle,
  // ...
});

// displayName with dot notation
DialogRoot.displayName = "Dialog";
DialogTrigger.displayName = "Dialog.Trigger";
```

### Context Hierarchy (13 contexts total)

```typescript
// Multi-level context for compound components
const DialogRoleContext = createContext<"dialog" | "alertdialog">("dialog");
const ComboboxSizeContext = createContext<Size>("base");
const FlowNodeAnchorContext = createContext<AnchorRegistration | null>(null);
const SwitchGroupContext = createContext<{ controlFirst: boolean }>({
  controlFirst: true,
});
```

### Base UI Adaptation (36 imports)

```typescript
import { Dialog as DialogBase } from "@base-ui/react/dialog";

// Wrap with styling + kumo conventions
const DialogContent = forwardRef<...>(({ className, ...props }, ref) => (
  <DialogBase.Popup
    ref={ref}
    className={cn("bg-kumo-elevated rounded-lg ...", className)}
    {...props}
  />
));
```

### Field Wrapper Integration

Input, Select, Combobox auto-wrap with Field when `label` prop provided:

```typescript
if (label) {
  return <Field label={label} description={description} error={error}>{input}</Field>;
}
return input;
```

### Type Derivation from Variants

```typescript
export type KumoButtonVariant = keyof typeof KUMO_BUTTON_VARIANTS.variant;
export type KumoButtonSize = keyof typeof KUMO_BUTTON_VARIANTS.size;
// Legacy alias for backwards compatibility
export type ButtonVariant = KumoButtonVariant;
```

## STYLING CONVENTIONS

### cn() Always (43 files import it)

```typescript
// CORRECT
className={cn("base-classes", conditional && "extra", className)}

// WRONG - loses passthrough className
className="base-classes"
```

### State Classes (for Figma extraction)

Tailwind state prefixes are extractable:

```typescript
classes: "bg-kumo-elevated hover:bg-kumo-base focus:ring-kumo-hairline disabled:opacity-50";
// Parsed into: { default, hover, focus, disabled } state map
```

## ANTI-PATTERNS

| Pattern               | Why                   | Instead                                    |
| --------------------- | --------------------- | ------------------------------------------ |
| Missing `displayName` | Breaks React DevTools | Set after forwardRef                       |
| Raw className string  | Loses passthrough     | Use `cn(base, className)`                  |
| `as any`              | Type safety           | Model types correctly (3 exist, don't add) |
| Hardcoded colors      | Breaks theming        | Use semantic tokens                        |
| `dark:` prefix        | Redundant             | Tokens auto-adapt                          |

## COMPLEXITY HOTSPOTS

| Component           | Lines   | Notes                                              |
| ------------------- | ------- | -------------------------------------------------- |
| `command-palette`   | 865     | 14 sub-components, two-level context, keyboard nav |
| `date-range-picker` | 667     | 150 lines duplicated ternary (DEPRECATED)          |
| `combobox`          | 561     | Complex async filtering                            |
| `pagination`        | 510     | Multiple layout modes                              |
| `flow`              | 8 files | Descendants tracking, connector drawing            |
| `chart`             | 5 files | ECharts passed externally to avoid bundling        |

## NOTES

- **64 forwardRef usages**: All interactive components use forwardRef
- **Discriminated union props**: ButtonWithTextProps vs IconOnlyButtonProps pattern for conditional required props
- **A11y dev warnings**: Components log console.warn in dev if missing accessible name
- **Descendants hook**: `flow/use-children.tsx` uses `claimRenderOrder()` and `measurementEpoch` for deterministic connector drawing
- **LinkProvider**: `utils/link-provider.tsx` abstracts framework-specific links (wrap app with custom Link component)
