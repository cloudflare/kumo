/**
 * Static metadata configurations for component registry.
 *
 * Contains:
 * - Pass-through component documentation (for Base UI wrappers)
 * - Additional props that can't be auto-detected
 * - Type overrides for complex types
 * - Styling metadata for Figma plugin
 */

import type { PropSchema, PassthroughDoc, ComponentStyling } from "./types.js";

// =============================================================================
// Pass-through Component Documentation
// =============================================================================

/**
 * Documentation for pass-through sub-components from base-ui.
 * These provide props, descriptions, and usage examples for components
 * that are directly re-exported from @base-ui/react.
 */
export const PASSTHROUGH_COMPONENT_DOCS: Record<string, PassthroughDoc> = {
  // Dialog sub-components
  "DialogBase.Root": {
    description:
      "Controls the open state of the dialog. Doesn't render its own HTML element.",
    props: {
      open: {
        type: "boolean",
        description: "Whether the dialog is currently open (controlled mode)",
      },
      defaultOpen: {
        type: "boolean",
        description: "Whether the dialog is initially open (uncontrolled mode)",
        default: "false",
      },
      onOpenChange: {
        type: "(open: boolean, event: Event) => void",
        description: "Callback fired when the dialog opens or closes",
      },
      modal: {
        type: "boolean | 'trap-focus'",
        description:
          "Whether the dialog is modal. When true, focus is trapped and page scroll is locked",
        default: "true",
      },
      dismissible: {
        type: "boolean",
        description: "Whether clicking outside closes the dialog",
        default: "true",
      },
    },
    usageExamples: [
      "<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>",
      "<Dialog.Root defaultOpen={false}>",
    ],
  },
  "DialogBase.Trigger": {
    description: "A button that opens the dialog when clicked.",
    renderElement: "<button>",
    props: {
      render: {
        type: "ReactElement | ((props, state) => ReactElement)",
        description: "Custom element to render instead of the default button",
      },
      disabled: {
        type: "boolean",
        description: "Whether the trigger is disabled",
      },
    },
    usageExamples: [
      "<Dialog.Trigger render={<Button>Open</Button>} />",
      "<Dialog.Trigger>Open Dialog</Dialog.Trigger>",
    ],
  },
  "DialogBase.Title": {
    description: "A heading that labels the dialog for accessibility.",
    renderElement: "<h2>",
    props: {
      render: {
        type: "ReactElement | ((props, state) => ReactElement)",
        description: "Custom element to render instead of the default h2",
      },
    },
    usageExamples: [
      "<Dialog.Title>Confirm Action</Dialog.Title>",
      "<Dialog.Title render={<h3 />}>Custom Heading</Dialog.Title>",
    ],
  },
  "DialogBase.Description": {
    description: "A paragraph providing additional context about the dialog.",
    renderElement: "<p>",
    props: {
      render: {
        type: "ReactElement | ((props, state) => ReactElement)",
        description: "Custom element to render instead of the default p",
      },
    },
    usageExamples: [
      "<Dialog.Description>Are you sure you want to proceed?</Dialog.Description>",
    ],
  },
  "DialogBase.Close": {
    description: "A button that closes the dialog when clicked.",
    renderElement: "<button>",
    props: {
      render: {
        type: "ReactElement | ((props, state) => ReactElement)",
        description: "Custom element to render instead of the default button",
      },
      disabled: {
        type: "boolean",
        description: "Whether the close button is disabled",
      },
    },
    usageExamples: [
      "<Dialog.Close render={<Button>Cancel</Button>} />",
      "<Dialog.Close>×</Dialog.Close>",
    ],
  },

  // Combobox sub-components
  "ComboboxBase.List": {
    description:
      "A container for combobox items. Supports render prop for custom item rendering.",
    renderElement: "<div>",
    props: {
      children: {
        type: "ReactNode | ((item: T, index: number) => ReactNode)",
        description:
          "Items to render, or a function that receives each item and returns a node",
      },
    },
    usageExamples: [
      `<Combobox.List>
  {(item) => <Combobox.Item value={item}>{item.label}</Combobox.Item>}
</Combobox.List>`,
    ],
  },
  "ComboboxBase.Collection": {
    description:
      "Renders filtered list items. Use when you need more control over item rendering.",
    props: {
      children: {
        type: "(item: T, index: number) => ReactNode",
        required: true,
        description:
          "Function that receives each filtered item and returns a node",
      },
    },
    usageExamples: [
      `<Combobox.Collection>
  {(item, index) => (
    <Combobox.Item key={index} value={item}>
      {item.label}
    </Combobox.Item>
  )}
</Combobox.Collection>`,
    ],
  },
};

// =============================================================================
// Additional Props
// =============================================================================

/**
 * Additional props to inject for specific components.
 * These are important inherited props that the schema generator misses
 * because they come from base library types.
 */
export const ADDITIONAL_COMPONENT_PROPS: Record<
  string,
  Record<string, PropSchema>
> = {
  Meter: {
    value: {
      type: "number",
      description: "Current value of the meter",
    },
    max: {
      type: "number",
      description: "Maximum value of the meter (default: 100)",
    },
    min: {
      type: "number",
      description: "Minimum value of the meter (default: 0)",
    },
  },
  Tooltip: {
    content: {
      type: "ReactNode",
      required: true,
      description: "Content to display in the tooltip",
    },
  },
  Pagination: {
    setPage: {
      type: "(page: number) => void",
      required: true,
      description: "Callback when page changes",
    },
  },
  Switch: {
    onClick: {
      type: "(event: React.MouseEvent) => void",
      required: true,
      description: "Callback when switch is clicked",
    },
  },
  Combobox: {
    onValueChange: {
      type: "(value: T | T[]) => void",
      description: "Callback when selection changes",
    },
    multiple: {
      type: "boolean",
      description: "Allow multiple selections",
    },
    isItemEqualToValue: {
      type: "(item: T, value: T) => boolean",
      description: "Custom equality function for comparing items",
    },
  },
  Select: {
    onValueChange: {
      type: "(value: string) => void",
      description: "Callback when selection changes",
    },
    defaultValue: {
      type: "string",
      description: "Initial value for uncontrolled mode",
    },
  },
  DateRangePicker: {
    onStartDateChange: {
      type: "(date: Date | null) => void",
      description: "Callback when start date changes",
    },
    onEndDateChange: {
      type: "(date: Date | null) => void",
      description: "Callback when end date changes",
    },
  },
  Tabs: {
    onValueChange: {
      type: "(value: string) => void",
      description: "Callback when active tab changes",
    },
  },
  Collapsible: {
    onOpenChange: {
      type: "(open: boolean) => void",
      description: "Callback when collapsed state changes",
    },
  },
  Checkbox: {
    onValueChange: {
      type: "(checked: boolean) => void",
      description: "Callback when checkbox value changes",
    },
  },
};

// =============================================================================
// Type Overrides
// =============================================================================

/**
 * Type overrides for props with opaque or unhelpful generated types.
 * Maps component name -> prop name -> cleaner type string.
 */
export const PROP_TYPE_OVERRIDES: Record<string, Record<string, string>> = {
  Code: {
    values: "Record<string, { value: string; highlight?: boolean }>",
  },
  Combobox: {
    items: "T[]",
    value: "T | T[]",
  },
  Select: {
    value: "string",
  },
};

// =============================================================================
// Styling Metadata
// =============================================================================

/**
 * Component-specific styling metadata for AI/Figma plugin consumption.
 * Documents dimensions, states, icons, and color tokens used in components.
 */
export const COMPONENT_STYLING_METADATA: Record<string, ComponentStyling> = {
  Checkbox: {
    dimensions: "h-4 w-4",
    borderRadius: "rounded-sm",
    baseTokens: ["bg-kumo-base", "ring-kumo-line"],
    states: {
      checked: ["bg-kumo-contrast", "text-kumo-inverse"],
      indeterminate: ["bg-kumo-contrast", "text-kumo-inverse"],
      error: ["ring-kumo-danger"],
      hover: ["ring-kumo-ring"],
      focus: ["ring-kumo-ring"],
      disabled: ["opacity-50", "cursor-not-allowed"],
    },
    icons: [
      {
        name: "ph-check",
        state: "checked",
        size: 12,
      },
      {
        name: "ph-minus",
        state: "indeterminate",
        size: 12,
      },
    ],
  },
  ClipboardText: {
    baseTokens: ["bg-kumo-base", "text-kumo-default", "ring-kumo-line", "border-kumo-fill"],
    states: {
      input: ["bg-kumo-control", "text-kumo-default", "ring-kumo-line"],
      text: ["bg-kumo-base", "font-mono"],
      button: ["border-kumo-fill"],
    },
    inputStyles: {
      base: "bg-kumo-control text-kumo-default ring ring-kumo-line",
      sizes: {
        xs: "h-5 gap-1 rounded-sm px-1.5 text-xs",
        sm: "h-6.5 gap-1 rounded-md px-2 text-xs",
        base: "h-9 gap-1.5 rounded-lg px-3 text-base",
        lg: "h-10 gap-2 rounded-lg px-4 text-base",
      },
    },
    sizeVariants: {
      sm: {
        height: 26,
        classes: "text-xs",
        buttonSize: "sm",
        dimensions: {
          paddingX: 8,
          gap: 1,
          borderRadius: 6,
          fontSize: 12,
        },
      },
      base: {
        height: 36,
        classes: "text-sm",
        buttonSize: "base",
        dimensions: {
          paddingX: 12,
          gap: 6,
          borderRadius: 8,
          fontSize: 14,
        },
      },
      lg: {
        height: 40,
        classes: "text-sm",
        buttonSize: "lg",
        dimensions: {
          paddingX: 16,
          gap: 8,
          borderRadius: 8,
          fontSize: 14,
        },
      },
    },
    icons: [
      {
        name: "ph-clipboard",
        state: "default",
        size: 16,
      },
      {
        name: "ph-check",
        state: "copied",
        size: 16,
      },
    ],
  },
  Code: {
    baseTokens: ["text-kumo-strong"],
    dimensions: "m-0 w-auto p-0",
    borderRadius: "rounded-none",
    states: {
      base: [
        "bg-transparent",
        "border-none",
        "font-mono",
        "text-sm",
        "leading-[20px]",
      ],
      code_block_container: [
        "min-w-0",
        "rounded-md",
        "border",
        "border-kumo-fill",
        "bg-kumo-base",
      ],
    },
  },
  Input: {
    baseTokens: ["bg-kumo-control", "text-kumo-default", "text-kumo-subtle", "ring-kumo-line"],
    sizeVariants: {
      xs: {
        height: 20,
        classes: "h-5 gap-1 rounded-sm px-1.5 text-xs",
        dimensions: {
          paddingX: 6,
          fontSize: 12,
          borderRadius: 2,
        },
      },
      sm: {
        height: 26,
        classes: "h-6.5 gap-1 rounded-md px-2 text-xs",
        dimensions: {
          paddingX: 8,
          fontSize: 12,
          borderRadius: 6,
        },
      },
      base: {
        height: 36,
        classes: "h-9 gap-1.5 rounded-lg px-3 text-base",
        dimensions: {
          paddingX: 12,
          fontSize: 16,
          borderRadius: 8,
        },
      },
      lg: {
        height: 40,
        classes: "h-10 gap-2 rounded-lg px-4 text-base",
        dimensions: {
          paddingX: 16,
          fontSize: 16,
          borderRadius: 8,
        },
      },
    },
    states: {
      base: ["bg-kumo-control", "text-kumo-default", "ring-kumo-line"],
      focus: ["ring-kumo-ring"],
      error: ["ring-kumo-danger"],
      disabled: ["opacity-50", "text-kumo-subtle"],
    },
  },
  Tabs: {
    container: {
      height: 34,
      borderRadius: 8,
      background: "color-accent",
      padding: 1,
    },
    tab: {
      paddingX: 10,
      verticalMargin: 1,
      fontSize: 16,
      fontWeight: 500,
      borderRadius: 8,
      activeColor: "text-color-surface",
      inactiveColor: "text-color-label",
    },
    indicator: {
      background: "color-surface-secondary",
      ring: "color-color-2",
      borderRadius: 8,
      shadow: "shadow-sm",
    },
  },
  Dialog: {
    baseTokens: ["bg-kumo-base", "text-kumo-default", "border-kumo-line", "shadow-m"],
    sizeVariants: {
      sm: {
        height: 0, // Dialog height is auto (content-driven)
        classes: "min-w-72",
        dimensions: {
          paddingX: 16,
          paddingY: 16,
          gap: 8,
          borderRadius: 12,
        },
      },
      base: {
        height: 0,
        classes: "min-w-96",
        dimensions: {
          paddingX: 24,
          paddingY: 24,
          gap: 16,
          borderRadius: 12,
        },
      },
      lg: {
        height: 0,
        classes: "min-w-[32rem]",
        dimensions: {
          paddingX: 24,
          paddingY: 24,
          gap: 16,
          borderRadius: 12,
        },
      },
      xl: {
        height: 0,
        classes: "min-w-[48rem]",
        dimensions: {
          paddingX: 24,
          paddingY: 24,
          gap: 16,
          borderRadius: 12,
        },
      },
    },
    states: {
      base: ["bg-kumo-base", "text-kumo-default", "shadow-m"],
      backdrop: ["bg-kumo-overlay", "opacity-80"],
    },
  },
  // Note: Toasty styling is now extracted from KUMO_TOAST_STYLING in toast.tsx
  DateRangePicker: {
    sizeVariants: {
      sm: {
        height: 0,
        classes: "p-3 gap-2",
        dimensions: {
          calendarWidth: 168,
          cellHeight: 22,
          cellWidth: 24,
          textSize: 12,
          iconSize: 14,
          padding: 12,
          gap: 8,
        },
      },
      base: {
        height: 0,
        classes: "p-4 gap-2.5",
        dimensions: {
          calendarWidth: 196,
          cellHeight: 26,
          cellWidth: 28,
          textSize: 14,
          iconSize: 16,
          padding: 16,
          gap: 10,
        },
      },
      lg: {
        height: 0,
        classes: "p-5 gap-3",
        dimensions: {
          calendarWidth: 252,
          cellHeight: 32,
          cellWidth: 36,
          textSize: 16,
          iconSize: 18,
          padding: 20,
          gap: 12,
        },
      },
    },
  },
  Pagination: {
    layout: {
      height: 36,
      buttonSize: 36,
      inputWidth: 50,
      iconSize: 16,
      gap: 8,
      borderRadius: 6,
    },
  },
  InputArea: {
    sizeVariants: {
      xs: { minHeight: 60, width: 200 },
      sm: { minHeight: 72, width: 240 },
      base: { minHeight: 88, width: 320 },
      lg: { minHeight: 100, width: 360 },
    },
  },
  LayerCard: {
    container: {
      width: 280,
      borderRadius: 8,
    },
    secondary: {
      paddingX: 8,
      paddingY: 8,
      gap: 8,
      fontSize: 16,
      fontWeight: 500,
    },
    primary: {
      paddingX: 16,
      paddingY: 16,
      paddingRight: 12,
      gap: 8,
      fontSize: 16,
      fontWeight: 400,
      borderRadius: 8,
    },
  },
  MenuBar: {
    container: {
      height: 32,
      borderRadius: 8,
      padding: 2,
      gap: 2,
    },
    button: {
      width: 36,
      borderRadius: 6,
      iconSize: 18,
    },
  },
  Select: {
    trigger: {
      height: 36, // h-9
      paddingX: 12, // px-3
      paddingY: 0,
      borderRadius: 8, // rounded-lg
      fontSize: 16, // text-base
      fontWeight: 400, // font-normal
    },
    popup: {
      width: 280,
      borderRadius: 8, // rounded-lg
      padding: 6, // p-1.5
    },
    option: {
      paddingX: 8, // px-2
      paddingY: 6, // py-1.5
      borderRadius: 4, // rounded
      fontSize: 16, // text-base
      fontWeight: 400,
    },
  },
};
