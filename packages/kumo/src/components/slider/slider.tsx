import { Slider as BaseSlider } from "@base-ui/react/slider";
import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Slider size definitions mapping sizes to their track heights. */
export const KUMO_SLIDER_VARIANTS = {
  size: {
    sm: {
      classes: "h-6",
      description: "Compact slider for dense layouts",
    },
    base: {
      classes: "h-8",
      description: "Default slider size",
    },
  },
} as const;

export const KUMO_SLIDER_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoSliderSize = keyof typeof KUMO_SLIDER_VARIANTS.size;

export interface KumoSliderVariantsProps {
  /**
   * Height of the slider track.
   * - `"sm"` — Compact slider for dense layouts
   * - `"base"` — Default slider size
   * @default "base"
   */
  size?: KumoSliderSize;
}

export function sliderVariants({
  size = KUMO_SLIDER_DEFAULT_VARIANTS.size,
}: KumoSliderVariantsProps = {}) {
  return cn(
    "rounded-lg bg-kumo-recessed p-[3px] ring ring-kumo-line",
    KUMO_SLIDER_VARIANTS.size[size].classes,
  );
}

type SliderValue = number | readonly number[];

/**
 * Slider component props.
 *
 * @example
 * ```tsx
 * <Slider label="Match count" defaultValue={2} max={5} />
 * <Slider label="Price" defaultValue={[25, 75]} />
 * ```
 */
export interface SliderProps<Value extends SliderValue = SliderValue>
  extends
    Omit<BaseSlider.Root.Props<Value>, "children">,
    KumoSliderVariantsProps {
  /** Label displayed above the slider track. */
  label?: ReactNode;
  /**
   * Whether to show each thumb's value in a badge below the track.
   * @default true
   */
  showValue?: boolean;
  /**
   * Whether to show the minimum and maximum values at the ends of the track.
   * @default true
   */
  showRange?: boolean;
  /**
   * Accessible name for each thumb. Use it when there is no visible `label`,
   * or to tell the thumbs of a range slider apart.
   */
  getAriaLabel?: (index: number) => string;
}

function countThumbs(value: SliderValue | undefined) {
  return Array.isArray(value) ? value.length : 1;
}

/**
 * Lets people pick a number, or a range between two numbers, by dragging a
 * thumb along a track. Pass an array to `value` or `defaultValue` for a range.
 *
 * @example
 * ```tsx
 * <Slider label="Volume" defaultValue={40} />
 * ```
 */
export function Slider<Value extends SliderValue = SliderValue>({
  label,
  showValue = true,
  showRange = true,
  size = KUMO_SLIDER_DEFAULT_VARIANTS.size,
  getAriaLabel,
  className,
  min = 0,
  max = 100,
  format,
  locale,
  value,
  defaultValue,
  ...props
}: SliderProps<Value>) {
  const thumbCount = countThumbs(value ?? defaultValue);
  const isRange = thumbCount > 1;
  const formatter = new Intl.NumberFormat(locale, format);
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <BaseSlider.Root
      {...props}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      format={format}
      locale={locale}
      // Keeps the thumbs, and the grips inside them, within the track at
      // either end of the range.
      thumbAlignment="edge"
      className={cn(
        "flex w-full flex-col gap-2 data-disabled:opacity-50",
        className,
      )}
    >
      {label ? (
        <BaseSlider.Label
          className={cn("font-medium text-kumo-default", textSize)}
        >
          {label}
        </BaseSlider.Label>
      ) : null}
      <BaseSlider.Control className={sliderVariants({ size })}>
        <BaseSlider.Track className="relative h-full">
          <BaseSlider.Indicator className="rounded-md bg-kumo-base shadow-sm ring ring-kumo-line" />
          {Array.from({ length: thumbCount }, (_, index) => (
            <BaseSlider.Thumb
              key={index}
              index={isRange ? index : undefined}
              getAriaLabel={getAriaLabel}
              className="h-full w-4 cursor-grab rounded-md outline-none has-focus-visible:ring-2 has-focus-visible:ring-kumo-focus data-disabled:cursor-not-allowed data-dragging:cursor-grabbing"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-1/2 h-1/2 w-0.5 -translate-1/2 rounded-full bg-kumo-fill-hover",
                  // Grips sit just inside the indicator: at its start for the
                  // first thumb of a range, at its end otherwise.
                  isRange && index === 0 ? "ml-[7px]" : "-ml-[7px]",
                )}
              />
              {showValue ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded bg-kumo-brand px-1.5 font-medium whitespace-nowrap text-white tabular-nums",
                    textSize,
                  )}
                >
                  <BaseSlider.Value>
                    {(formattedValues) => formattedValues[index]}
                  </BaseSlider.Value>
                </span>
              ) : null}
            </BaseSlider.Thumb>
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
      {showRange ? (
        <div
          aria-hidden
          className={cn(
            "flex justify-between text-kumo-subtle tabular-nums",
            textSize,
          )}
        >
          <span>{formatter.format(min)}</span>
          <span>{formatter.format(max)}</span>
        </div>
      ) : null}
    </BaseSlider.Root>
  );
}

Slider.displayName = "Slider";
