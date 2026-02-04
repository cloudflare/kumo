import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Field as FieldBase } from "@base-ui/react/field";
import { CaretUpDownIcon } from "@phosphor-icons/react";
import { cn } from "../../utils/cn";
import { buttonVariants } from "../button";
import { Label } from "../label";
import { type FieldErrorMatch } from "../field/field";

export const KUMO_NATIVE_SELECT_VARIANTS = {
  size: {
    xs: {
      classes: "h-5 text-xs rounded-sm px-1.5 pr-6",
      description: "Extra small select for compact UIs",
    },
    sm: {
      classes: "h-6.5 text-xs rounded-md px-2 pr-7",
      description: "Small select for secondary fields",
    },
    base: {
      classes: "h-9 text-base rounded-lg px-3 pr-8",
      description: "Default select size",
    },
    lg: {
      classes: "h-10 text-base rounded-lg px-4 pr-9",
      description: "Large select for prominent fields",
    },
  },
} as const;

export const KUMO_NATIVE_SELECT_DEFAULT_VARIANTS = {
  size: "base",
} as const;

/**
 * NativeSelect component styling metadata for Figma plugin code generation
 */
export const KUMO_NATIVE_SELECT_STYLING = {
  dimensions: {
    xs: {
      height: 20,
      paddingX: 6,
      paddingRight: 24,
      fontSize: 12,
      borderRadius: 2,
    },
    sm: {
      height: 26,
      paddingX: 8,
      paddingRight: 28,
      fontSize: 12,
      borderRadius: 6,
    },
    base: {
      height: 36,
      paddingX: 12,
      paddingRight: 32,
      fontSize: 16,
      borderRadius: 8,
    },
    lg: {
      height: 40,
      paddingX: 16,
      paddingRight: 36,
      fontSize: 16,
      borderRadius: 8,
    },
  },
  baseTokens: {
    background: "color-secondary",
    text: "text-color-surface",
    ring: "color-border",
  },
  stateTokens: {
    focus: { ring: "color-active" },
    disabled: { opacity: 0.5 },
  },
  icons: {
    caret: { name: "ph-caret-up-down", size: 20 },
  },
} as const;

// Derived types from KUMO_NATIVE_SELECT_VARIANTS
export type KumoNativeSelectSize =
  keyof typeof KUMO_NATIVE_SELECT_VARIANTS.size;

export interface KumoNativeSelectVariantsProps {
  size?: KumoNativeSelectSize;
}

// Omit native `size` attribute (number) to avoid conflict with our custom `size` variant
type BaseSelectProps = Omit<ComponentPropsWithoutRef<"select">, "size">;

export function nativeSelectVariants({
  size = KUMO_NATIVE_SELECT_DEFAULT_VARIANTS.size,
}: KumoNativeSelectVariantsProps = {}) {
  return cn(
    // Use button secondary variant as base for visual parity with Select
    buttonVariants({ variant: "secondary" }),
    // Override button defaults for select behavior
    "w-full cursor-pointer appearance-none text-left font-normal",
    // Size-specific styles
    KUMO_NATIVE_SELECT_VARIANTS.size[size].classes,
  );
}

/**
 * NativeSelect component props.
 *
 * A native HTML select element styled to match the Kumo Select component.
 * Use this when you need native OS select behavior (especially on mobile)
 * or when you don't need custom option rendering.
 *
 * @example
 * // Basic usage
 * <NativeSelect value={country} onChange={(e) => setCountry(e.target.value)}>
 *   <option value="">Select a country</option>
 *   <option value="us">United States</option>
 *   <option value="ca">Canada</option>
 * </NativeSelect>
 *
 * @example
 * // With Field wrapper (label, description, error)
 * <NativeSelect
 *   label="Country"
 *   description="Where you're located"
 *   value={country}
 *   onChange={handleChange}
 * >
 *   <option value="us">United States</option>
 * </NativeSelect>
 */
export interface NativeSelectProps
  extends KumoNativeSelectVariantsProps,
    BaseSelectProps {
  /** Label content for the select (enables Field wrapper) - can be a string or any React node */
  label?: ReactNode;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /** Helper text displayed below the select */
  description?: ReactNode;
  /** Error message or validation error object */
  error?: string | { message: ReactNode; match: FieldErrorMatch };
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      className,
      size = "base",
      label,
      labelTooltip,
      description,
      error,
      children,
      disabled,
      required,
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = providedId ?? generatedId;

    // Icon sizes matching the select sizes
    const iconConfig = {
      xs: { size: 14, right: "right-1" },
      sm: { size: 16, right: "right-1.5" },
      base: { size: 20, right: "right-2.5" },
      lg: { size: 20, right: "right-3" },
    } as const;

    const { size: iconSize, right: iconRight } = iconConfig[size];

    const selectElement = (
      <div
        data-kumo-native-select-wrapper
        className={cn("relative inline-flex", className)}
      >
        <select
          ref={ref}
          id={selectId}
          data-kumo-native-select
          className={cn(
            nativeSelectVariants({ size }),
            disabled && "cursor-not-allowed opacity-50",
          )}
          disabled={disabled}
          required={required}
          {...props}
        >
          {children}
        </select>
        {/* Caret icon overlay - matches Select component */}
        <CaretUpDownIcon
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-kumo-subtle",
            iconRight,
          )}
          size={iconSize}
        />
      </div>
    );

    // Render with Field wrapper if label is provided
    if (label) {
      // Show "(optional)" when required is explicitly false
      const showOptional = required === false;

      return (
        <FieldBase.Root className="grid gap-2">
          <FieldBase.Label
            htmlFor={selectId}
            className="text-base font-medium text-kumo-default"
          >
            <Label showOptional={showOptional} tooltip={labelTooltip} asContent>
              {label}
            </Label>
          </FieldBase.Label>
          {selectElement}
          {error ? (
            <FieldBase.Error
              className="col-span-full text-sm text-kumo-danger"
              match={typeof error === "string" ? true : error.match}
            >
              {typeof error === "string" ? error : error.message}
            </FieldBase.Error>
          ) : (
            description && (
              <FieldBase.Description className="col-span-full text-sm leading-snug text-kumo-subtle">
                {description}
              </FieldBase.Description>
            )
          )}
        </FieldBase.Root>
      );
    }

    // Render bare select without Field wrapper
    return selectElement;
  },
);

NativeSelect.displayName = "NativeSelect";
