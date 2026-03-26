import { Switch as BaseSwitch } from "@base-ui/react/switch";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type Ref,
  type ReactNode,
  createContext,
  useContext,
} from "react";
import { cn } from "../../utils/cn";
import { Field } from "../field/field";
import { Fieldset } from "@base-ui/react/fieldset";

/** Switch size and variant definitions mapping names to their Tailwind classes. */
export const KUMO_SWITCH_VARIANTS = {
  size: {
    sm: {
      classes: "h-5.5 w-8.5",
      description: "Small switch for compact UIs",
    },
    base: {
      classes: "h-6.5 w-10.5",
      description: "Default switch size",
    },
    lg: {
      classes: "h-7.5 w-12.5",
      description: "Large switch for prominent toggles",
    },
  },
  variant: {
    default: {
      classes: "",
      description: "Default switch with squircle shape and brand blue color",
    },
    neutral: {
      classes: "",
      description: "Monochrome switch with squircle shape for subtle toggles",
    },
  },
} as const;

export const KUMO_SWITCH_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export type KumoSwitchSize = keyof typeof KUMO_SWITCH_VARIANTS.size;
export type KumoSwitchVariant = keyof typeof KUMO_SWITCH_VARIANTS.variant;

export interface KumoSwitchVariantsProps {
  size?: KumoSwitchSize;
  variant?: KumoSwitchVariant;
}

export function switchVariants({
  size = KUMO_SWITCH_DEFAULT_VARIANTS.size,
  variant = KUMO_SWITCH_DEFAULT_VARIANTS.variant,
}: KumoSwitchVariantsProps = {}) {
  const sizeConfig =
    KUMO_SWITCH_VARIANTS.size[size] ?? KUMO_SWITCH_VARIANTS.size.base;
  const variantConfig =
    KUMO_SWITCH_VARIANTS.variant[variant] ??
    KUMO_SWITCH_VARIANTS.variant.default;
  return cn(sizeConfig.classes, variantConfig.classes);
}

export type SwitchSize = KumoSwitchSize;
export type SwitchVariant = KumoSwitchVariant;

const SwitchGroupContext = createContext<{ controlFirst: boolean }>({
  controlFirst: true,
});

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  variant?: SwitchVariant;
  label?: ReactNode;
  labelTooltip?: ReactNode;
  required?: boolean;
  controlFirst?: boolean;
  size?: KumoSwitchSize;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  transitioning?: boolean;
};

export interface SwitchGroupProps {
  legend: string;
  children: ReactNode;
  error?: string;
  description?: ReactNode;
  disabled?: boolean;
  controlFirst?: boolean;
  className?: string;
}

export type SwitchItemProps = {
  variant?: SwitchVariant;
  label: string;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: KumoSwitchSize;
  transitioning?: boolean;
};

const SwitchBase = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      disabled,
      size = "base",
      variant = "default",
      label,
      labelTooltip,
      required,
      controlFirst = true,
      onCheckedChange,
      transitioning,
      ...props
    },
    ref,
  ) => {
    const ariaLabelFallback = typeof label === "string" ? label : "Switch";
    const switchControl = (
      <BaseSwitch.Root
        ref={ref}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        nativeButton
        render={(rootProps, state) => {
          const {
            ref: rootRef,
            className: baseClassName,
            role: baseRole,
            "aria-checked": _ariaChecked,
            "aria-pressed": _ariaPressed,
            ...restRootProps
          } = rootProps as typeof rootProps & {
            ref?: Ref<HTMLButtonElement>;
            className?: string;
            role?: string;
            "aria-checked"?: boolean;
            "aria-pressed"?: boolean;
          };

          const isNeutral = variant === "neutral";
          const squircleRadius =
            "rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle]";

          const sizeStyles = {
            sm: { track: "h-4 w-8", thumb: "w-4", slide: "left-4" },
            base: { track: "h-4.5 w-9", thumb: "w-4.5", slide: "left-4.5" },
            lg: { track: "h-5 w-10", thumb: "w-5", slide: "left-5" },
          };
          const s = sizeStyles[size];

          // Resolved: Improved logic with main branch styling updates
          const getTrackColors = () => {
            if (disabled) {
              return "bg-neutral-100 ring-neutral-200 opacity-50";
            }
            return isNeutral
              ? state.checked
                ? "bg-neutral-500 dark:bg-kumo-base ring-neutral-600 dark:ring-neutral-700"
                : "bg-neutral-150 dark:bg-kumo-base ring-kumo-line"
              : state.checked
                ? "bg-blue-500 dark:bg-blue-600 ring-blue-600 dark:ring-blue-500"
                : "bg-neutral-200 dark:bg-neutral-700 ring-neutral-300 dark:ring-neutral-600";
          };

          const getThumbColors = () => {
            if (disabled) {
              return "bg-neutral-300 ring-neutral-300";
            }
            return isNeutral
              ? state.checked
                ? "ring-neutral-600 dark:ring-neutral-200 bg-kumo-base dark:bg-neutral-400"
                : "bg-kumo-base dark:bg-neutral-850 ring-neutral-300 dark:ring-neutral-700"
              : state.checked
                ? "ring-blue-600 dark:ring-blue-100 bg-kumo-base dark:bg-blue-300"
                : "bg-kumo-base dark:bg-neutral-850 ring-neutral-300 dark:ring-neutral-700";
          };

          const trackColors = getTrackColors();
          const thumbColors = getThumbColors();

          const trackClassName = cn(
            "relative inline-flex items-center ring cursor-pointer border-none p-0",
            // Adopting main's improved accessibility focus styles
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
            // Keeping your improved fluid animation
            "transition-[background-color,box-shadow] duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
            "disabled:cursor-not-allowed",
            s.track,
            squircleRadius,
            trackColors,
            className,
            baseClassName,
          );

          const thumbClassName = cn(
            "absolute top-0 bottom-0 shadow-[0_0_1px_0.5px_var(--color-kumo-shadow-edge),0_1px_2px_var(--color-kumo-shadow-drop)]",
            s.thumb,
            squircleRadius,
            thumbColors,
            "transition-[left,background-color,box-shadow] duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
            state.checked ? s.slide : "left-0",
          );

          const role = (props.role as string | undefined) ?? baseRole ?? "switch";
          const checkedA11yProps =
            role === "switch"
              ? { "aria-checked": state.checked }
              : { "aria-pressed": state.checked };

          return (
            <button
              {...restRootProps}
              {...props}
              ref={rootRef}
              type="button"
              role={role}
              {...checkedA11yProps}
              aria-busy={transitioning || undefined}
              aria-label={props["aria-label"] ?? ariaLabelFallback}
              className={trackClassName}
            >
              <div className={thumbClassName} />
            </button>
          );
        }}
      />
    );

    if (!label) return switchControl;

    return (
      <Field
        label={label}
        required={required}
        labelTooltip={labelTooltip}
        controlFirst={controlFirst}
      >
        {switchControl}
      </Field>
    );
  },
);

SwitchBase.displayName = "Switch";

const SwitchItem = forwardRef<HTMLButtonElement, SwitchItemProps>(
  (
    {
      className,
      checked,
      disabled,
      size = "base",
      variant = "default",
      label,
      onCheckedChange,
      transitioning,
    },
    ref,
  ) => {
    const { controlFirst } = useContext(SwitchGroupContext);

    return (
      <label
        className={cn(
          "m-0 relative inline-flex items-center gap-2",
          !controlFirst && "flex-row-reverse justify-end",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <BaseSwitch.Root
          ref={ref}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          nativeButton
          render={(rootProps, state) => {
            const {
              ref: rootRef,
              className: baseClassName,
              role: baseRole,
              "aria-checked": _ariaChecked,
              "aria-pressed": _ariaPressed,
              ...restRootProps
            } = rootProps as typeof rootProps & {
              ref?: Ref<HTMLButtonElement>;
              className?: string;
              role?: string;
              "aria-checked"?: boolean;
              "aria-pressed"?: boolean;
            };

            const isNeutral = variant === "neutral";
            const squircleRadius =
              "rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle]";

            const sizeStyles = {
              sm: { track: "h-4 w-8", thumb: "w-4", slide: "left-4" },
              base: { track: "h-4.5 w-9", thumb: "w-4.5", slide: "left-4.5" },
              lg: { track: "h-5 w-10", thumb: "w-5", slide: "left-5" },
            };
            const s = sizeStyles[size];

            const getTrackColors = () => {
              if (disabled) {
                return "bg-neutral-100 ring-neutral-200 opacity-50";
              }
              return isNeutral
                ? state.checked
                  ? "bg-neutral-500 dark:bg-kumo-base ring-neutral-600 dark:ring-neutral-700"
                  : "bg-neutral-150 dark:bg-kumo-base ring-kumo-line"
                : state.checked
                  ? "bg-blue-500 dark:bg-blue-600 ring-blue-600 dark:ring-blue-500"
                  : "bg-neutral-200 dark:bg-neutral-700 ring-neutral-300 dark:ring-neutral-600";
            };

            const getThumbColors = () => {
              if (disabled) {
                return "bg-neutral-300 ring-neutral-300";
              }
              return isNeutral
                ? state.checked
                  ? "ring-neutral-600 dark:ring-neutral-200 bg-kumo-base dark:bg-neutral-400"
                  : "bg-kumo-base dark:bg-neutral-850 ring-neutral-300 dark:ring-neutral-700"
                : state.checked
                  ? "ring-blue-600 dark:ring-blue-100 bg-kumo-base dark:bg-blue-300"
                  : "bg-kumo-base dark:bg-neutral-850 ring-neutral-300 dark:ring-neutral-700";
            };

            const trackColors = getTrackColors();
            const thumbColors = getThumbColors();

            const trackClassName = cn(
              "relative inline-flex items-center ring cursor-pointer border-none p-0",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
              "transition-[background-color,box-shadow] duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
              "disabled:cursor-not-allowed",
              s.track,
              squircleRadius,
              trackColors,
              baseClassName,
            );

            const thumbClassName = cn(
              "absolute top-0 bottom-0 shadow-[0_0_1px_0.5px_var(--color-kumo-shadow-edge),0_1px_2px_var(--color-kumo-shadow-drop)]",
              s.thumb,
              squircleRadius,
              thumbColors,
              "transition-[left,background-color,box-shadow] duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
              state.checked ? s.slide : "left-0",
            );

            const role = baseRole ?? "switch";
            const checkedA11yProps =
              role === "switch"
                ? { "aria-checked": state.checked }
                : { "aria-pressed": state.checked };

            return (
              <button
                {...restRootProps}
                ref={rootRef}
                type="button"
                role={role}
                {...checkedA11yProps}
                aria-busy={transitioning || undefined}
                className={trackClassName}
              >
                <div className={thumbClassName} />
              </button>
            );
          }}
        />
        <span className="text-base font-medium text-kumo-default">{label}</span>
      </label>
    );
  },
);

SwitchItem.displayName = "Switch.Item";

function SwitchGroup({
  legend,
  children,
  error,
  description,
  disabled,
  controlFirst = true,
  className,
}: SwitchGroupProps) {
  return (
    <SwitchGroupContext.Provider value={{ controlFirst }}>
      <Fieldset.Root
        className={cn(
          "flex flex-col gap-4 rounded-lg border border-kumo-line p-4",
          className,
        )}
        disabled={disabled}
      >
        <Fieldset.Legend className="text-lg font-medium text-kumo-default">
          {legend}
        </Fieldset.Legend>
        <div className="flex flex-col gap-2">{children}</div>
        {error && <p className="text-sm text-kumo-danger">{error}</p>}
        {description && (
          <p className="text-sm text-kumo-subtle">{description}</p>
        )}
      </Fieldset.Root>
    </SwitchGroupContext.Provider>
  );
}

export const Switch = Object.assign(SwitchBase, {
  Item: SwitchItem,
  Group: SwitchGroup,
});

Switch.displayName = "Switch";