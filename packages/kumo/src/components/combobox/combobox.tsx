import { Combobox as ComboboxBase } from "@base-ui/react/combobox";
import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { Fragment, type PropsWithChildren, type ReactNode } from "react";
import { inputVariants } from "../input/input";
import { cn } from "../../utils/cn";
import { Field, type FieldErrorMatch } from "../field/field";

export const KUMO_COMBOBOX_VARIANTS = {
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
  inputSide: "right",
} as const;

// Derived types from KUMO_COMBOBOX_VARIANTS
export type KumoComboboxInputSide =
  keyof typeof KUMO_COMBOBOX_VARIANTS.inputSide;

export interface KumoComboboxVariantsProps {
  inputSide?: KumoComboboxInputSide;
}

export function comboboxVariants({
  inputSide = KUMO_COMBOBOX_DEFAULT_VARIANTS.inputSide,
}: KumoComboboxVariantsProps = {}) {
  return cn(KUMO_COMBOBOX_VARIANTS.inputSide[inputSide].classes);
}

// Legacy type alias for backwards compatibility
export type ComboboxInputSide = KumoComboboxInputSide;

export type ComboboxRootProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = ComboboxBase.Root.Props<Value, Multiple>;

// Simplified props type for AI/documentation (non-generic)
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
  ...props
}: ComboboxBase.Root.Props<Value, Multiple> & {
  label?: ReactNode;
  required?: boolean;
  labelTooltip?: ReactNode;
  description?: ReactNode;
  error?: string | { message: ReactNode; match: FieldErrorMatch };
}) {
  const comboboxControl = (
    <ComboboxBase.Root {...props}>{children}</ComboboxBase.Root>
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
        className="z-50 outline-none"
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        side={side}
      >
        <ComboboxBase.Popup
          className={cn(
            "max-h-[min(var(--available-height),24rem)] max-w-(--available-width) min-w-(--anchor-width) scroll-pt-2 scroll-pb-2 overflow-y-auto overscroll-contain p-1.5",
            "z-50 overflow-hidden bg-kumo-control text-kumo-default", // background
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

function TriggerValue({
  className,
  ...props
}: ComboboxBase.Value.Props & { className?: string }) {
  return (
    <ComboboxBase.Trigger
      className={cn(
        inputVariants(),
        "relative flex items-center pr-8",
        className,
      )}
    >
      <ComboboxBase.Value>{props.children}</ComboboxBase.Value>
      <ComboboxBase.Icon className="absolute top-1/2 right-2 -translate-y-1/2">
        <CaretDownIcon className="fill-kumo-ring" />
      </ComboboxBase.Icon>
    </ComboboxBase.Trigger>
  );
}

function TriggerInput(props: ComboboxBase.Input.Props) {
  return (
    <div
      className={cn("relative inline-block w-full max-w-xs", props.className)}
    >
      <ComboboxBase.Input
        {...props}
        className={cn(inputVariants(), "w-full pr-12")}
      />

      <ComboboxBase.Clear className="absolute top-1/2 right-8 flex -translate-y-1/2 cursor-pointer bg-transparent p-0">
        <XIcon />
      </ComboboxBase.Clear>

      <ComboboxBase.Trigger className="p-0">
        <ComboboxBase.Icon className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer">
          <CaretDownIcon className="fill-kumo-ring" />
        </ComboboxBase.Icon>
      </ComboboxBase.Trigger>
    </div>
  );
}

function Item({ children, ...props }: ComboboxBase.Item.Props) {
  return (
    <ComboboxBase.Item
      {...props}
      className="group grid cursor-pointer grid-cols-[1fr_16px] gap-2 rounded px-2 py-1.5 text-base data-highlighted:bg-kumo-overlay"
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
        "px-4 py-2 text-[0.925rem] leading-4 text-kumo-subtle empty:m-0 empty:p-0",
      )}
      children={props.children ?? "No labels found."}
    />
  );
}

function Input(props: ComboboxBase.Input.Props) {
  return (
    <ComboboxBase.Input
      {...props}
      className={cn(inputVariants(), "w-full first:mb-2", props.className)}
    />
  );
}

function GroupLabel(props: ComboboxBase.GroupLabel.Props) {
  return (
    <ComboboxBase.GroupLabel
      {...props}
      className="ml-[16px] px-4 py-1.5 text-sm font-medium"
    />
  );
}

function Group(props: ComboboxBase.Group.Props) {
  return <ComboboxBase.Group {...props} className="mt-2 first:mt-0" />;
}

function Chip(props: ComboboxBase.Chip.Props) {
  return (
    <ComboboxBase.Chip
      {...props}
      className="flex items-center gap-1 rounded-md bg-kumo-overlay px-2 py-1"
    >
      {props.children}
      <ComboboxBase.ChipRemove className="cursor-pointer rounded-md p-1 hover:bg-kumo-fill-hover">
        <XIcon size={12} weight="bold" />
      </ComboboxBase.ChipRemove>
    </ComboboxBase.Chip>
  );
}

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
  // Determine which value to use for rendering chips
  const chipsToRender = controlledValue;

  return (
    <ComboboxBase.Chips
      className={cn(
        inputVariants(),
        cn("flex flex-col", "gap-1 p-1", "min-h-9", "h-auto"),
        className,
      )}
    >
      {inputSide === "top" && (
        <ComboboxBase.Input
          placeholder={placeholder}
          className="w-full px-2 py-1 outline-none"
        />
      )}
      {/* Chips container */}
      <div className="flex flex-wrap gap-1">
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
            className="min-w-[100px] flex-1 px-2 py-1 outline-none"
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

  // BaseUI
  List: ComboboxBase.List,
  Collection: ComboboxBase.Collection,
});
