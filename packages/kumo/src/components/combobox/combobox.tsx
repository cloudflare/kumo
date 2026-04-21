import { Combobox as ComboboxBase } from "@base-ui/react/combobox";
import {
  CaretDownIcon,
  CheckIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  Fragment,
  createContext,
  useContext,
  useCallback,
  useState,
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
import {
  usePortalContainer,
  type PortalContainer,
} from "../../utils/portal-provider";

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

interface KumoCreatableComboboxItem {
  creatable: string;
  id: string;
  value: string;
}

function isCreatableComboboxItem(
  item: unknown,
): item is KumoCreatableComboboxItem {
  return typeof item === "object" && item !== null && "creatable" in item;
}

function getComboboxItemText<Value>(
  item: Value,
  itemToStringLabel?: (itemValue: Value) => string,
) {
  if (itemToStringLabel) {
    return itemToStringLabel(item);
  }

  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "object" && item !== null) {
    if ("label" in item && typeof item.label === "string") {
      return item.label;
    }

    if ("value" in item && typeof item.value === "string") {
      return item.value;
    }
  }

  return String(item);
}

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
> = ComboboxBase.Root.Props<Value, Multiple> & {
  onCreate?: (value: string) => void;
};

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
  /**
   * Called when the user selects the creatable option.
   * Update `items` and `value` from this callback to persist the new option.
   */
  onCreate?: (value: string) => void;
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
  onCreate,
  items,
  value,
  inputValue,
  onInputValueChange,
  onValueChange,
  onItemHighlighted,
  itemToStringLabel,
  itemToStringValue,
  filter,
  isItemEqualToValue,
  ...props
}: ComboboxBase.Root.Props<Value, Multiple> & {
  label?: ReactNode;
  required?: boolean;
  labelTooltip?: ReactNode;
  description?: ReactNode;
  error?: string | { message: ReactNode; match: FieldErrorMatch };
  size?: KumoComboboxSize;
  onCreate?: (value: string) => void;
}) {
  const [internalInputValue, setInternalInputValue] = useState("");
  const query =
    inputValue === undefined ? internalInputValue : String(inputValue);

  const updateInputValue = useCallback(
    (
      nextInputValue: string,
      eventDetails?: ComboboxBase.Root.ChangeEventDetails,
    ) => {
      if (onInputValueChange) {
        onInputValueChange(nextInputValue, eventDetails!);
        return;
      }

      setInternalInputValue(nextInputValue);
    },
    [onInputValueChange],
  );

  const normalizedItems = (items ?? []) as Value[];
  const itemToStringLabelWithCreatable = useCallback(
    (item: Value | KumoCreatableComboboxItem) =>
      isCreatableComboboxItem(item)
        ? item.value
        : getComboboxItemText(item, itemToStringLabel),
    [itemToStringLabel],
  );
  const itemToStringValueWithCreatable = useCallback(
    (item: Value | KumoCreatableComboboxItem) => {
      if (isCreatableComboboxItem(item)) {
        return item.value;
      }

      return itemToStringValue
        ? itemToStringValue(item)
        : getComboboxItemText(item, itemToStringLabel);
    },
    [itemToStringLabel, itemToStringValue],
  );
  const filterWithCreatable = useCallback(
    (
      item: Value | KumoCreatableComboboxItem,
      nextQuery: string,
      itemToString?: (itemValue: Value | KumoCreatableComboboxItem) => string,
    ) => {
      if (!filter) {
        return true;
      }

      if (isCreatableComboboxItem(item)) {
        return true;
      }

      return filter(
        item,
        nextQuery,
        itemToString as ((itemValue: Value) => string) | undefined,
      );
    },
    [filter],
  );
  const isItemEqualToValueWithCreatable = useCallback(
    (
      item: Value | KumoCreatableComboboxItem,
      selectedValue: Value | KumoCreatableComboboxItem,
    ) => {
      if (
        isCreatableComboboxItem(item) ||
        isCreatableComboboxItem(selectedValue)
      ) {
        return (
          isCreatableComboboxItem(item) &&
          isCreatableComboboxItem(selectedValue) &&
          item.id === selectedValue.id
        );
      }

      return isItemEqualToValue
        ? isItemEqualToValue(item, selectedValue)
        : Object.is(item, selectedValue);
    },
    [isItemEqualToValue],
  );
  const handleItemHighlighted = useCallback(
    (
      highlightedValue: Value | KumoCreatableComboboxItem | undefined,
      eventDetails: ComboboxBase.Root.HighlightEventDetails,
    ) => {
      onItemHighlighted?.(
        isCreatableComboboxItem(highlightedValue)
          ? undefined
          : highlightedValue,
        eventDetails,
      );
    },
    [onItemHighlighted],
  );
  const trimmedQuery = query.trim();
  const loweredQuery = trimmedQuery.toLocaleLowerCase();
  const exactItemExists =
    trimmedQuery === "" ||
    normalizedItems.some(
      (item) =>
        itemToStringLabelWithCreatable(item).trim().toLocaleLowerCase() ===
        loweredQuery,
    );
  const itemsForView =
    onCreate && trimmedQuery !== "" && !exactItemExists
      ? [
          ...normalizedItems,
          {
            creatable: trimmedQuery,
            id: `create:${loweredQuery}`,
            value: `Create \"${trimmedQuery}\"`,
          } satisfies KumoCreatableComboboxItem,
        ]
      : normalizedItems;

  const handleValueChange = useCallback(
    (
      nextValue: Value[] | Value | KumoCreatableComboboxItem | null,
      eventDetails: ComboboxBase.Root.ChangeEventDetails,
    ) => {
      const emitValueChange = onValueChange as
        | ((
            value: Value[] | Value | null,
            eventDetails: ComboboxBase.Root.ChangeEventDetails,
          ) => void)
        | undefined;

      if (Array.isArray(nextValue)) {
        const creatableSelection = (nextValue as unknown[]).find(
          isCreatableComboboxItem,
        );

        if (creatableSelection) {
          onCreate?.(creatableSelection.creatable);
          updateInputValue("", eventDetails);
          return;
        }

        emitValueChange?.(nextValue as Value[], eventDetails);
        updateInputValue("", eventDetails);
        return;
      }

      if (isCreatableComboboxItem(nextValue)) {
        onCreate?.(nextValue.creatable);
        updateInputValue("", eventDetails);
        return;
      }

      emitValueChange?.(nextValue as Value | null, eventDetails);

      if (nextValue !== null) {
        updateInputValue("", eventDetails);
      }
    },
    [onCreate, onValueChange, updateInputValue],
  );

  const comboboxControl = (
    <ComboboxSizeContext.Provider value={size}>
      <ComboboxBase.Root
        {...props}
        items={
          itemsForView as ComboboxBase.Root.Props<
            Value | KumoCreatableComboboxItem,
            Multiple
          >["items"]
        }
        isItemEqualToValue={isItemEqualToValueWithCreatable}
        value={
          value as ComboboxBase.Root.Props<
            Value | KumoCreatableComboboxItem,
            Multiple
          >["value"]
        }
        inputValue={query}
        filter={filter ? filterWithCreatable : undefined}
        itemToStringLabel={itemToStringLabelWithCreatable}
        itemToStringValue={itemToStringValueWithCreatable}
        onInputValueChange={
          updateInputValue as ComboboxBase.Root.Props<
            Value | KumoCreatableComboboxItem,
            Multiple
          >["onInputValueChange"]
        }
        onValueChange={
          handleValueChange as ComboboxBase.Root.Props<
            Value | KumoCreatableComboboxItem,
            Multiple
          >["onValueChange"]
        }
        onItemHighlighted={
          handleItemHighlighted as ComboboxBase.Root.Props<
            Value | KumoCreatableComboboxItem,
            Multiple
          >["onItemHighlighted"]
        }
      >
        {children}
      </ComboboxBase.Root>
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
  container: containerProp,
}: PropsWithChildren<{
  className?: string;
  align?: ComboboxBase.Positioner.Props["align"];
  alignOffset?: ComboboxBase.Positioner.Props["alignOffset"];
  side?: ComboboxBase.Positioner.Props["side"];
  sideOffset?: ComboboxBase.Positioner.Props["sideOffset"];
  /**
   * Container element for the portal. Use this to render the combobox inside
   * a Shadow DOM or custom container. Overrides `KumoPortalProvider` context.
   * @default document.body (or KumoPortalProvider container if set)
   */
  container?: PortalContainer;
}>) {
  const contextContainer = usePortalContainer();
  const container = containerProp ?? contextContainer ?? undefined;

  return (
    <ComboboxBase.Portal container={container}>
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

function TriggerInput({
  clearLabel = "Clear selection",
  showOptionsLabel = "Show options",
  ...props
}: ComboboxBase.Input.Props & {
  /** Accessible label for the clear button. Pass a translated string for i18n.
   * @default "Clear selection"
   */
  clearLabel?: string;
  /** Accessible label for the dropdown trigger. Pass a translated string for i18n.
   * @default "Show options"
   */
  showOptionsLabel?: string;
}) {
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
        aria-label={clearLabel}
        className={cn(
          "absolute top-1/2 flex -translate-y-1/2 cursor-pointer bg-transparent p-0",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-0",
          iconStyles.clearRight,
        )}
      >
        <XIcon size={iconStyles.iconSize} />
      </ComboboxBase.Clear>

      <ComboboxBase.Trigger
        aria-label={showOptionsLabel}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-kumo-subtle",
          "m-0 bg-transparent p-0", // Reset Stratus global button styles
          iconStyles.caretRight,
        )}
      >
        <ComboboxBase.Icon>
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
  children,
  ...props
}: ComboboxBase.List.Props & { className?: string }) {
  const renderItem =
    typeof children === "function"
      ? (children as (item: unknown) => ReactNode)
      : undefined;

  return (
    <ComboboxBase.List
      {...props}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pt-2 scroll-pb-2",
        className,
      )}
    >
      {renderItem
        ? (item: unknown) =>
            isCreatableComboboxItem(item) ? (
              <ComboboxBase.Item
                key={item.id}
                value={item}
                className="mx-1.5 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-base data-highlighted:bg-kumo-tint"
              >
                <PlusIcon size={14} className="shrink-0" />
                <span>
                  Create{" "}
                  <span className="font-medium">
                    &quot;{item.creatable}&quot;
                  </span>
                </span>
              </ComboboxBase.Item>
            ) : (
              renderItem(item)
            )
        : children}
    </ComboboxBase.List>
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
      className="border-t border-kumo-hairline mt-2 pt-2 first:border-t-0 first:mt-0 first:pt-0"
    />
  );
}

function Chip({
  removeLabel = "Remove",
  ...props
}: ComboboxBase.Chip.Props & {
  /** Accessible label for the chip remove button. Pass a translated string for i18n.
   * @default "Remove"
   */
  removeLabel?: string;
}) {
  return (
    <ComboboxBase.Chip
      {...props}
      className={cn(
        "flex items-center gap-2.5", // Layout
        "h-6 pl-2 pr-[3px]", // Dimensions
        "rounded-sm ring-1 ring-kumo-hairline", // Border
        "bg-kumo-overlay", // Background
        "text-sm", // Typography
      )}
    >
      {props.children}
      <ComboboxBase.ChipRemove
        aria-label={removeLabel}
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
