import { Combobox as ComboboxBase } from "@base-ui/react/combobox";
import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import {
  Fragment,
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  inputVariants,
  KUMO_INPUT_VARIANTS,
  type KumoInputSize,
} from "../input/input";
import { cn } from "../../utils/cn";
import { Field, type FieldErrorMatch } from "../field/field";

/** Combobox variant definitions. */
export const KUMO_COMBOBOX_VARIANTS = {
  size: KUMO_INPUT_VARIANTS.size,
  inputSide: {
    right: {
      classes: "",
      description: "Input positioned inline to the right of chips",
    },
    top: {
      classes: "",
      description: "Input positioned above chips",
    },
  },
} as const;

export const KUMO_COMBOBOX_DEFAULT_VARIANTS = {
  size: "base",
  inputSide: "right",
} as const;

// Context to pass size down to sub-components
const ComboboxSizeContext = createContext<KumoInputSize>("base");

// Derived types from KUMO_COMBOBOX_VARIANTS
export type KumoComboboxSize = keyof typeof KUMO_COMBOBOX_VARIANTS.size;
export type KumoComboboxInputSide =
  keyof typeof KUMO_COMBOBOX_VARIANTS.inputSide;

export interface KumoComboboxVariantsProps {
  /**
   * Size of the combobox trigger. Matches Input component sizes.
   * - `"xs"` — Extra small for compact UIs (h-5 / 20px)
   * - `"sm"` — Small for secondary fields (h-6.5 / 26px)
   * - `"base"` — Default size (h-9 / 36px)
   * - `"lg"` — Large for prominent fields (h-10 / 40px)
   * @default "base"
   */
  size?: KumoComboboxSize;
  /**
   * Position of the text input relative to chips in multi-select mode.
   * - `"right"` — Input inline to the right of chips
   * - `"top"` — Input above chips
   * @default "right"
   */
  inputSide?: KumoComboboxInputSide;
}

export function comboboxVariants({
  inputSide = KUMO_COMBOBOX_DEFAULT_VARIANTS.inputSide,
}: KumoComboboxVariantsProps = {}) {
  return cn(KUMO_COMBOBOX_VARIANTS.inputSide[inputSide].classes);
}

// Legacy type alias for backwards compatibility
export type ComboboxInputSide = KumoComboboxInputSide;
export type ComboboxSize = KumoComboboxSize;

export type ComboboxRootProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = ComboboxBase.Root.Props<Value, Multiple>;

/**
 * Combobox component props (simplified for documentation; the actual Root is generic).
 *
 * Combobox provides an autocomplete/typeahead input with a filterable dropdown.
 * Supports single-select, multi-select with chips, grouped items, and Field wrapper integration.
 *
 * @example
 * ```tsx
 * // Single-select with search input
 * <Combobox value={value} onValueChange={setValue} items={options}>
 *   <Combobox.TriggerInput placeholder="Search…" />
 *   <Combobox.Content>
 *     <Combobox.List>
 *       {(item) => <Combobox.Item value={item}>{item.label}</Combobox.Item>}
 *     </Combobox.List>
 *     <Combobox.Empty>No results</Combobox.Empty>
 *   </Combobox.Content>
 * </Combobox>
 *
 * // Multi-select with chips
 * <Combobox multiple items={options} label="Tags">
 *   <Combobox.TriggerMultipleWithInput
 *     placeholder="Add tag…"
 *     renderItem={(item) => <Combobox.Chip value={item}>{item.label}</Combobox.Chip>}
 *   />
 *   <Combobox.Content>
 *     <Combobox.List>
 *       {(item) => <Combobox.Item value={item}>{item.label}</Combobox.Item>}
 *     </Combobox.List>
 *   </Combobox.Content>
 * </Combobox>
 * ```
 */
export interface ComboboxProps extends KumoComboboxVariantsProps {
  /** Array of items to display in the dropdown */
  items: unknown[];
  /** Currently selected value(s) */
  value?: unknown;
  /** Callback when selection changes */
  onValueChange?: (value: unknown) => void;
  /** Enable multi-select mode */
  multiple?: boolean;
  /** Combobox content (trigger, content, items) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Label content for the combobox (enables Field wrapper) - can be a string or any React node */
  label?: ReactNode;
  /** Whether the combobox is required */
  required?: boolean;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /** Helper text displayed below the combobox */
  description?: ReactNode;
  /** Error message or validation error object */
  error?: string | { message: ReactNode; match: FieldErrorMatch };
}

function Root<Value, Multiple extends boolean | undefined = false>({
  label,
  required,
  labelTooltip,
  description,
  error,
  children,
  size = "base",
  ...props
}: ComboboxBase.Root.Props<Value, Multiple> & {
  label?: ReactNode;
  required?: boolean;
  labelTooltip?: ReactNode;
  description?: ReactNode;
  error?: string | { message: ReactNode; match: FieldErrorMatch };
  size?: KumoComboboxSize;
}) {
  const comboboxControl = (
    <ComboboxSizeContext.Provider value={size}>
      <ComboboxBase.Root {...props}>{children}</ComboboxBase.Root>
    </ComboboxSizeContext.Provider>
  );

  // Render with Field wrapper if label, description, or error are provided
  if (label) {
    return (
      <Field
        label={label}
        required={required}
        labelTooltip={labelTooltip}
        description={description}
        error={
          error
            ? typeof error === "string"
              ? { message: error, match: true }
              : error
            : undefined
        }
      >
        {comboboxControl}
      </Field>
    );
  }

  // Render bare combobox without Field wrapper
  return comboboxControl;
}

function Content({
  children,
  className,
  align = "start",
  sideOffset = 4,
  alignOffset,
  side,
}: PropsWithChildren<{
  className?: string;
  align?: ComboboxBase.Positioner.Props["align"];
  alignOffset?: ComboboxBase.Positioner.Props["alignOffset"];
  side?: ComboboxBase.Positioner.Props["side"];
  sideOffset?: ComboboxBase.Positioner.Props["sideOffset"];
}>) {
  return (
    <ComboboxBase.Portal>
      <ComboboxBase.Positioner
        className=""
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        side={side}
      >
        <ComboboxBase.Popup
          className={cn(
            "flex flex-col", // flexbox layout for sticky input + scrollable list
            "max-h-[min(var(--available-height),24rem)] max-w-(--available-width) min-w-(--anchor-width) py-1.5",
            "bg-kumo-base text-kumo-default", // background
            "rounded-lg shadow-lg ring ring-kumo-line", // border part
            className,
          )}
        >
          {children}
        </ComboboxBase.Popup>
      </ComboboxBase.Positioner>
    </ComboboxBase.Portal>
  );
}

// Size-dependent styles for TriggerValue icon
const triggerValueIconStyles: Record<
  KumoComboboxSize,
  { padding: string; iconSize: number; iconRight: string }
> = {
  xs: { padding: "pr-5", iconSize: 12, iconRight: "right-1" },
  sm: { padding: "pr-6", iconSize: 14, iconRight: "right-1.5" },
  base: { padding: "pr-8", iconSize: 16, iconRight: "right-2" },
  lg: { padding: "pr-10", iconSize: 18, iconRight: "right-3" },
};

function TriggerValue({
  className,
  ...props
}: ComboboxBase.Value.Props & { className?: string }) {
  const size = useContext(ComboboxSizeContext);
  const iconStyles = triggerValueIconStyles[size];

  return (
    <ComboboxBase.Trigger
      className={cn(
        inputVariants({ size }),
        "relative flex items-center",
        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        iconStyles.padding,
        className,
      )}
    >
      <ComboboxBase.Value>{props.children}</ComboboxBase.Value>
      <ComboboxBase.Icon
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center text-kumo-subtle",
          iconStyles.iconRight,
        )}
      >
        <CaretDownIcon size={iconStyles.iconSize} className="fill-current" />
      </ComboboxBase.Icon>
    </ComboboxBase.Trigger>
  );
}

// Size-dependent styles for TriggerInput icons
const triggerInputIconStyles: Record<
  KumoComboboxSize,
  { padding: string; iconSize: number; clearRight: string; caretRight: string }
> = {
  xs: {
    padding: "pr-7",
    iconSize: 12,
    clearRight: "right-5",
    caretRight: "right-1",
  },
  sm: {
    padding: "pr-9",
    iconSize: 14,
    clearRight: "right-6",
    caretRight: "right-1.5",
  },
  base: {
    padding: "pr-12",
    iconSize: 16,
    clearRight: "right-8",
    caretRight: "right-2",
  },
  lg: {
    padding: "pr-14",
    iconSize: 18,
    clearRight: "right-9",
    caretRight: "right-3",
  },
};

function TriggerInput(props: ComboboxBase.Input.Props) {
  const size = useContext(ComboboxSizeContext);
  const iconStyles = triggerInputIconStyles[size];

  return (
    <div
      className={cn(
        "relative inline-block w-full max-w-xs",
        "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
        props.className,
      )}
    >
      <ComboboxBase.Input
        {...props}
        className={cn(
          inputVariants({ size }),
          "w-full",
          iconStyles.padding,
          "disabled:cursor-not-allowed",
        )}
      />

      <ComboboxBase.Clear
        className={cn(
          "absolute top-1/2 flex -translate-y-1/2 cursor-pointer bg-transparent p-0",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-0",
          iconStyles.clearRight,
        )}
      >
        <XIcon size={iconStyles.iconSize} />
      </ComboboxBase.Clear>

      <ComboboxBase.Trigger className="p-0">
        <ComboboxBase.Icon
          className={cn(
            "absolute top-1/2 flex -translate-y-1/2 cursor-pointer text-kumo-subtle",
            iconStyles.caretRight,
          )}
        >
          <CaretDownIcon size={iconStyles.iconSize} className="fill-current" />
        </ComboboxBase.Icon>
      </ComboboxBase.Trigger>
    </div>
  );
}

function Item({ children, ...props }: ComboboxBase.Item.Props) {
  return (
    <ComboboxBase.Item
      {...props}
      className="group mx-1.5 grid cursor-pointer grid-cols-[1fr_16px] gap-2 rounded px-2 py-1.5 text-base data-highlighted:bg-kumo-tint"
    >
      <div className="col-start-1">{children}</div>
      <ComboboxBase.ItemIndicator className="col-start-2 flex items-center">
        <CheckIcon />
      </ComboboxBase.ItemIndicator>
    </ComboboxBase.Item>
  );
}

function Empty(props: ComboboxBase.Empty.Props) {
  return (
    <ComboboxBase.Empty
      {...props}
      className={cn(
        "mx-1.5 shrink-0 px-4 py-2 text-[0.925rem] leading-4 text-kumo-subtle empty:m-0 empty:p-0",
      )}
      children={props.children ?? "No labels found."}
    />
  );
}

function Input(props: ComboboxBase.Input.Props) {
  return (
    <ComboboxBase.Input
      {...props}
      className={cn(
        inputVariants(),
        "mx-1.5 w-[calc(100%-0.75rem)] shrink-0 first:mb-2",
        props.className,
      )}
    />
  );
}

function List({
  className,
  ...props
}: ComboboxBase.List.Props & { className?: string }) {
  return (
    <ComboboxBase.List
      {...props}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pt-2 scroll-pb-2",
        className,
      )}
    />
  );
}

function GroupLabel(props: ComboboxBase.GroupLabel.Props) {
  return (
    <ComboboxBase.GroupLabel
      {...props}
      className={cn(
        "mx-1.5 px-2 py-1.5 text-sm text-kumo-strong",
        props.className,
      )}
    />
  );
}

function Group(props: ComboboxBase.Group.Props) {
  return (
    <ComboboxBase.Group
      {...props}
      className="border-t border-kumo-line mt-2 pt-2 first:border-t-0 first:mt-0 first:pt-0"
    />
  );
}

function Chip(props: ComboboxBase.Chip.Props) {
  return (
    <ComboboxBase.Chip
      {...props}
      className={cn(
        "flex items-center gap-2.5", // Layout
        "h-6 pl-2 pr-[3px]", // Dimensions
        "rounded-sm ring-1 ring-kumo-line", // Border
        "bg-kumo-overlay", // Background
        "text-sm", // Typography
      )}
    >
      {props.children}
      <ComboboxBase.ChipRemove
        className={cn(
          "cursor-pointer rounded-md p-1 hover:bg-kumo-fill-hover",
          "bg-transparent flex",
        )}
      >
        <XIcon size={10} />
      </ComboboxBase.ChipRemove>
    </ComboboxBase.Chip>
  );
}

// Map size to min-height class for TriggerMultipleWithInput
const sizeToMinHeight: Record<KumoComboboxSize, string> = {
  xs: "min-h-5",
  sm: "min-h-6.5",
  base: "min-h-9",
  lg: "min-h-10",
};

function TriggerMultipleWithInput<ValueType>({
  placeholder,
  renderItem,
  className,
  inputSide = "right",
  value: controlledValue,
}: {
  placeholder?: string;
  renderItem: (value: ValueType) => React.ReactNode;
  className?: string;
  inputSide?: "right" | "top";
  /** Optional controlled value for rendering chips (use when pre-selecting values) */
  value?: ValueType[];
}) {
  const size = useContext(ComboboxSizeContext);
  // Determine which value to use for rendering chips
  const chipsToRender = controlledValue;

  return (
    <ComboboxBase.Chips
      className={cn(
        inputVariants({ size }),
        "flex flex-col",
        "gap-1 py-1 px-1.5",
        sizeToMinHeight[size],
        "h-auto",
        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        className,
      )}
    >
      {inputSide === "top" && (
        <ComboboxBase.Input
          placeholder={placeholder}
          className="w-full px-2 py-1 border-0 bg-inherit"
        />
      )}
      {/* Chips container */}
      <div className="flex items-center flex-wrap gap-1.5 flex-1">
        {/* Render chips from controlled value if provided */}
        {chipsToRender !== undefined &&
          chipsToRender.length > 0 &&
          chipsToRender.map((item) => renderItem(item))}
        {/* Also render from BaseUI's internal value for user selections */}
        <ComboboxBase.Value>
          {(internalValue: ValueType[]) => {
            // Skip rendering if using controlled value (to avoid duplicates)
            if (chipsToRender !== undefined) return null;
            return (
              <Fragment>
                {internalValue.map((item) => renderItem(item))}
              </Fragment>
            );
          }}
        </ComboboxBase.Value>
        {inputSide === "right" && (
          <ComboboxBase.Input
            placeholder={placeholder}
            className="min-w-[100px] flex-1 px-2 py-1 border-0 bg-inherit"
          />
        )}
      </div>
    </ComboboxBase.Chips>
  );
}

Root.displayName = "Combobox.Root";
Content.displayName = "Combobox.Content";
TriggerValue.displayName = "Combobox.TriggerValue";
TriggerInput.displayName = "Combobox.TriggerInput";
Item.displayName = "Combobox.Item";
Chip.displayName = "Combobox.Chip";
TriggerMultipleWithInput.displayName = "Combobox.TriggerMultipleWithInput";

/**
 * Combobox — autocomplete input with filterable dropdown list.
 *
 * Compound component: `Combobox` (Root), `.TriggerInput`, `.TriggerValue`,
 * `.TriggerMultipleWithInput`, `.Content`, `.Item`, `.Chip`, `.Input`,
 * `.Empty`, `.GroupLabel`, `.Group`, `.List`, `.Collection`.
 *
 * @example
 * ```tsx
 * <Combobox items={fruits} label="Fruit">
 *   <Combobox.TriggerInput placeholder="Pick a fruit…" />
 *   <Combobox.Content>
 *     <Combobox.List>
 *       {(item) => <Combobox.Item value={item}>{item}</Combobox.Item>}
 *     </Combobox.List>
 *   </Combobox.Content>
 * </Combobox>
 * ```
 *
 * @see https://base-ui.com/react/components/combobox
 */
export const Combobox = Object.assign(Root, {
  // Helper components
  Content,
  TriggerValue,
  TriggerInput,
  TriggerMultipleWithInput,

  // Slightly modified BaseUI
  Chip,
  Item,

  // Styled BaseUI
  Input,
  Empty,
  GroupLabel,
  Group,

  // Styled BaseUI
  List,

  // BaseUI
  Collection: ComboboxBase.Collection,
});
