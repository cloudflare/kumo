import { Combobox as ComboboxBase } from "@base-ui/react/combobox";
import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import {
  Fragment,
  createContext,
  useContext,
  useId,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  inputVariants,
  KUMO_INPUT_VARIANTS,
  type KumoInputSize,
} from "../input/input";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import {
  Field,
  normalizeFieldError,
  type FieldErrorMatch,
} from "../field/field";
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

// Context to pass size and error state down to sub-components
const ComboboxContext = createContext<{
  size: KumoInputSize;
  hasError: boolean;
  hasLabel: boolean;
  describedBy?: string;
}>({ size: "base", hasError: false, hasLabel: false });

type AccessibleNameProps = {
  /** Accessible name for the control when no visible `label` is provided. */
  "aria-label"?: string;
  /** ID of an element that labels the control when no visible `label` is provided. */
  "aria-labelledby"?: string;
};

type AriaDescriptionProps = {
  /** IDs of elements that describe the control. */
  "aria-describedby"?: string;
  /** Marks the control as invalid for assistive technologies. */
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
};

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
  return cn(
    resolveVariant(
      KUMO_COMBOBOX_VARIANTS.inputSide,
      inputSide,
      KUMO_COMBOBOX_DEFAULT_VARIANTS.inputSide,
    ).classes,
  );
}

function composeAriaDescribedBy(
  ...ids: Array<string | undefined>
): string | undefined {
  const describedBy = ids.filter(Boolean).join(" ");
  return describedBy || undefined;
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
 * <Combobox value={value} onValueChange={setValue} items={options} label="Fruit">
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

function warnIfMissingAccessibleName({
  component,
  hasLabel,
  ariaLabel,
  ariaLabelledBy,
  example,
}: {
  component: string;
  hasLabel: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  example: string;
}) {
  if (process.env.NODE_ENV === "production") return;

  if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
    console.warn(
      `[Kumo Combobox]: ${component} must have an accessible name. Provide either:\n` +
        "  - label prop: <Combobox label='Fruit' ... />\n" +
        `  - aria-label: ${example}\n` +
        "  - aria-labelledby for custom label association",
    );
  }
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
  const descriptionId = useId();
  const errorId = useId();
  const normalizedError = normalizeFieldError(error);
  const describedBy = !label
    ? normalizedError
      ? errorId
      : description
        ? descriptionId
        : undefined
    : undefined;
  const comboboxControl = (
    <ComboboxContext.Provider
      value={{
        size,
        hasError: Boolean(normalizedError),
        hasLabel: Boolean(label),
        describedBy,
      }}
    >
      <ComboboxBase.Root {...props}>{children}</ComboboxBase.Root>
    </ComboboxContext.Provider>
  );

  // Render with Field wrapper if label, description, or error are provided
  if (label) {
    return (
      <Field
        label={label}
        required={required}
        labelTooltip={labelTooltip}
        description={description}
        error={normalizedError}
      >
        {comboboxControl}
      </Field>
    );
  }

  if (normalizedError || description) {
    return (
      <div className="grid gap-2">
        {comboboxControl}
        {normalizedError ? (
          <span id={errorId} className="text-sm leading-snug text-kumo-danger">
            {normalizedError.message}
          </span>
        ) : (
          description && (
            <span
              id={descriptionId}
              className="text-sm leading-snug text-kumo-subtle"
            >
              {description}
            </span>
          )
        )}
      </div>
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
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: ComboboxBase.Value.Props &
  { className?: string } &
  AccessibleNameProps &
  AriaDescriptionProps) {
  const { size, hasError, hasLabel, describedBy } = useContext(ComboboxContext);
  const iconStyles = triggerValueIconStyles[size];
  warnIfMissingAccessibleName({
    component: "Combobox.TriggerValue",
    hasLabel,
    ariaLabel,
    ariaLabelledBy,
    example: "<Combobox.TriggerValue aria-label='Select fruit' />",
  });

  return (
    <ComboboxBase.Trigger
      data-kumo-component="Combobox"
      data-kumo-part="trigger"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={composeAriaDescribedBy(ariaDescribedBy, describedBy)}
      aria-invalid={hasError ? true : ariaInvalid}
      className={cn(
        inputVariants({ size, variant: hasError ? "error" : "default" }),
        "relative flex items-center",
        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        "data-[placeholder]:text-kumo-placeholder",
        iconStyles.padding,
        className,
      )}
    >
      <ComboboxBase.Value {...props} />
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
    padding: "pr-12",
    iconSize: 12,
    clearRight: "right-6",
    caretRight: "right-0",
  },
  sm: {
    padding: "pr-12",
    iconSize: 14,
    clearRight: "right-6",
    caretRight: "right-0",
  },
  base: {
    padding: "pr-12",
    iconSize: 16,
    clearRight: "right-6",
    caretRight: "right-0",
  },
  lg: {
    padding: "pr-14",
    iconSize: 18,
    clearRight: "right-8",
    caretRight: "right-2",
  },
};

function TriggerInput({
  clearLabel = "Clear selection",
  showOptionsLabel = "Show options",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
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
  const { size, hasError, hasLabel, describedBy } = useContext(ComboboxContext);
  const iconStyles = triggerInputIconStyles[size];
  warnIfMissingAccessibleName({
    component: "Combobox.TriggerInput",
    hasLabel,
    ariaLabel,
    ariaLabelledBy,
    example: "<Combobox.TriggerInput aria-label='Select fruit' />",
  });

  return (
    <div
      className={cn(
        "relative inline-block w-full max-w-xs",
        "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
        className,
      )}
    >
      <ComboboxBase.Input
        {...props}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={composeAriaDescribedBy(ariaDescribedBy, describedBy)}
        aria-invalid={hasError ? true : ariaInvalid}
        className={cn(
          inputVariants({ size, variant: hasError ? "error" : "default" }),
          "w-full",
          iconStyles.padding,
          "disabled:cursor-not-allowed",
        )}
      />

      <ComboboxBase.Clear
        data-kumo-component="Combobox"
        data-kumo-part="clear"
        aria-label={clearLabel}
        className={cn(
          "absolute top-1/2 flex -translate-y-1/2 items-center justify-center cursor-pointer rounded-sm bg-transparent p-0",
          "before:absolute before:left-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-0",
          iconStyles.clearRight,
        )}
      >
        <XIcon size={iconStyles.iconSize} />
      </ComboboxBase.Clear>

      <ComboboxBase.Trigger
        data-kumo-component="Combobox"
        data-kumo-part="trigger"
        aria-label={showOptionsLabel}
        className={cn(
          "absolute top-1/2 flex -translate-y-1/2 items-center justify-center cursor-pointer rounded-sm text-kumo-subtle",
          "before:absolute before:left-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
          "m-0 bg-transparent p-0", // Reset Stratus global button styles
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
          iconStyles.caretRight,
        )}
      >
        <ComboboxBase.Icon className="flex items-center">
          <CaretDownIcon size={iconStyles.iconSize} className="fill-current" />
        </ComboboxBase.Icon>
      </ComboboxBase.Trigger>
    </div>
  );
}

function Item({
  children,
  className,
  ...props
}: ComboboxBase.Item.Props & { className?: string }) {
  return (
    <ComboboxBase.Item
      data-kumo-component="Combobox"
      data-kumo-part="item"
      {...props}
      className={cn(
        "group mx-1.5 grid grid-cols-[1fr_16px] gap-2 rounded px-2 py-1.5 text-base",
        "cursor-pointer data-highlighted:bg-kumo-tint",
        // Disabled rows: muted text, no pointer, suppress highlight bg even
        // when keyboard nav lands on them. Base UI sets `data-disabled` on
        // the element when the `disabled` prop is true.
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-kumo-subtle data-[disabled]:opacity-60 data-[disabled]:data-highlighted:bg-transparent",
        className,
      )}
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

function Input({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: ComboboxBase.Input.Props) {
  const { hasError, hasLabel, describedBy } = useContext(ComboboxContext);
  warnIfMissingAccessibleName({
    component: "Combobox.Input",
    hasLabel,
    ariaLabel,
    ariaLabelledBy,
    example: "<Combobox.Input aria-label='Search fruits' />",
  });

  return (
    <ComboboxBase.Input
      {...props}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={composeAriaDescribedBy(ariaDescribedBy, describedBy)}
      aria-invalid={hasError ? true : ariaInvalid}
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
        "mx-1.5 px-2 py-1.5 text-sm text-kumo-subtle",
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
        data-kumo-component="Combobox"
        data-kumo-part="chip-remove"
        aria-label={removeLabel}
        className={cn(
          "relative flex cursor-pointer items-center justify-center rounded-md p-1 hover:bg-kumo-fill-hover",
          "before:absolute before:left-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
          "bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
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
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: {
  placeholder?: string;
  renderItem: (value: ValueType) => React.ReactNode;
  className?: string;
  inputSide?: "right" | "top";
  /** Optional controlled value for rendering chips (use when pre-selecting values) */
  value?: ValueType[];
} & AccessibleNameProps &
  AriaDescriptionProps) {
  const { size, hasError, hasLabel, describedBy } = useContext(ComboboxContext);
  const inputAriaDescribedBy = composeAriaDescribedBy(
    ariaDescribedBy,
    describedBy,
  );
  const inputAriaInvalid = hasError ? true : ariaInvalid;
  warnIfMissingAccessibleName({
    component: "Combobox.TriggerMultipleWithInput",
    hasLabel,
    ariaLabel,
    ariaLabelledBy,
    example:
      "<Combobox.TriggerMultipleWithInput aria-label='Select tags' ... />",
  });
  // Determine which value to use for rendering chips
  const chipsToRender = controlledValue;

  return (
    <ComboboxBase.Chips
      className={cn(
        inputVariants({ size, variant: hasError ? "error" : "default" }),
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
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={inputAriaDescribedBy}
          aria-invalid={inputAriaInvalid}
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
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={inputAriaDescribedBy}
            aria-invalid={inputAriaInvalid}
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
 * Provide an accessible name with `label` on the root, or with
 * `aria-label`/`aria-labelledby` on the trigger/search input sub-component;
 * placeholder text is not a substitute for an accessible name.
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

  Trigger: ComboboxBase.Trigger,
  Value: ComboboxBase.Value,
  Icon: ComboboxBase.Icon,

  // Filtering
  useFilter: ComboboxBase.useFilter,
});
