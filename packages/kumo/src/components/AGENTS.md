# Component Source (`src/components/`)

39 UI components. Base UI primitives + Tailwind v4 styling. Compound component pattern throughout.

**Parent:** See [packages/kumo/AGENTS.md](../../AGENTS.md) for library context.

## STRUCTURE

Each component follows: `{name}/{name}.tsx` + optional `{name}.test.tsx`, `{name}.browser.test.tsx`

```
components/
├── button/button.tsx           # Simple component
├── dialog/dialog.tsx           # Compound (14+ sub-components)
├── command-palette/            # Complex: 865 lines, 14 sub-components
├── date-range-picker/          # Complex: 667 lines (refactoring target)
├── combobox/                   # Complex: 561 lines
├── flow/                       # 8 files, descendants tracking system
├── chart/                      # 5 files, timeseries + sparkline
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
Button.displayName = "Button";  // REQUIRED
```

### Compound Component (Object.assign)

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
```

### Context Hierarchy

```typescript
// Multi-level context for compound components
const DialogRoleContext = createContext<"dialog" | "alertdialog">("dialog");
const ComboboxSizeContext = createContext<Size>("base");
const FlowNodeAnchorContext = createContext<AnchorRegistration | null>(null);
```

### Base UI Adaptation

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

## STYLING CONVENTIONS

### cn() Always

```typescript
// CORRECT
className={cn("base-classes", conditional && "extra", className)}

// WRONG - loses passthrough className
className="base-classes"
```

### Variant Function

```typescript
function buttonVariants({ variant, size, shape }: ButtonVariantProps) {
  return cn(
    KUMO_BUTTON_STYLING.baseClasses,
    KUMO_BUTTON_VARIANTS.variant[variant].classes,
    KUMO_BUTTON_VARIANTS.size[size].classes,
    KUMO_BUTTON_VARIANTS.shape[shape].classes,
  );
}
```

### State Classes (for Figma extraction)

Tailwind state prefixes are extractable:

```typescript
classes: "bg-kumo-elevated hover:bg-kumo-base focus:ring-kumo-ring disabled:opacity-50";
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
| `date-range-picker` | 667     | 150 lines duplicated ternary (refactor target)     |
| `combobox`          | 561     | Complex async filtering                            |
| `pagination`        | 510     | Multiple layout modes                              |
| `flow`              | 8 files | Descendants tracking, connector drawing            |

## NOTES

- **Field wrapper integration**: Input, Select, Combobox auto-wrap with Field when `label` prop provided
- **Base UI primitives**: `@base-ui/react` for Dialog, Select, Menu, etc. Styled layer on top
- **Descendants hook**: `flow/use-children.tsx` tracks render order for connector positioning
- **Measurement epoch**: Flow diagram uses counter to coordinate sibling remeasurement
