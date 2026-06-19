import {
  forwardRef,
  useId,
  type ComponentType,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import type { HTMLAttributes } from "react";
import { ArrowRightIcon, InfoIcon, TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import { cn } from "../../utils/cn";
import { useLinkComponent } from "../../utils/link-provider";
import { Button } from "../button";
import { SkeletonLine } from "../loader/skeleton-line";
import { Text } from "../text";
import { Tooltip } from "../tooltip";

/** @internal Placeholder — MetricCard has no visual variants. */
export const KUMO_METRIC_CARD_VARIANTS = {} as const;

/** @internal Placeholder — MetricCard has no visual variants. */
export const KUMO_METRIC_CARD_DEFAULT_VARIANTS = {} as const;

// Sub-types

export interface MetricCardTrend {
  /** Arrow direction: up, down, or neutral. */
  direction: "up" | "down" | "neutral";
  /** Pre-formatted trend label, e.g. "13.8%", "2.3pp", "5.1ms". */
  label: string;
  /** When true, a downward trend is positive (green) and upward is negative (red). */
  lessIsBetter?: boolean;
  /** When true, forces neutral/gray coloring regardless of direction. */
  isNeutral?: boolean;
}

/** Props passed to a custom tooltip icon component. */
export interface MetricCardTooltipIconProps {
  size?: number;
  className?: string;
}

export interface MetricCardSparkline {
  /** Array of numeric data points to plot. */
  data: number[];
  /**
   * Color theme for the sparkline. When omitted, uses the brand color.
   */
  theme?: "success" | "danger" | "neutral";
  /** Custom color that overrides `theme`, e.g. a hex value or CSS variable. */
  color?: string;
  /** Override the auto-scaled minimum y value. */
  yMin?: number;
  /** Override the auto-scaled maximum y value. */
  yMax?: number;
}

/**
 * MetricCard component props.
 *
 * @example
 * ```tsx
 * <MetricCard label="Requests" value="1.2M" />
 * <MetricCard label="Error rate" value="0.3" unit="%" />
 * <MetricCard
 *   label="p99 Latency"
 *   value="142"
 *   unit="ms"
 *   trend={{ direction: "down", label: "12%", lessIsBetter: true }}
 * />
 * ```
 *
 * @example Loading and error states (value omitted)
 * ```tsx
 * <MetricCard label="Requests" loading />
 * <MetricCard label="Requests" error />
 * ```
 */
export interface MetricCardProps
  extends // "lang" omitted to prevent it from appearing in the component API reference (inherited from HTMLAttributes)
  Omit<HTMLAttributes<HTMLElement>, "onClick" | "lang"> {
  /** Label text displayed above the value. */
  label: string;
  /**
   * Metric value to display. Strings and numbers receive automatic metric typography
   * (text-xl, font-semibold, tabular-nums). ReactNode values like Badge render as-is.
   * Optional when `loading` or `error` is true.
   */
  value?: ReactNode;
  /** Unit displayed after the value in smaller text, e.g. "%", "ms". */
  unit?: string;
  /** Trend indicator with direction arrow and label. */
  trend?: MetricCardTrend;
  /** Sparkline chart rendered at the bottom of the card. */
  sparkline?: MetricCardSparkline;
  /** When set, renders the card as an anchor element. */
  href?: string;
  /** Click handler. Renders as a button when no `href` is provided. */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Shows skeleton loading state for the value.
   * @default false
   */
  loading?: boolean;
  /**
   * Shows an em-dash placeholder in place of the value.
   * @default false
   */
  error?: boolean;
  /** Content displayed in a tooltip next to the label. */
  tooltip?: ReactNode;
  /** Custom icon component for the tooltip trigger. Defaults to Info icon from Phosphor. */
  tooltipIcon?: ComponentType<MetricCardTooltipIconProps>;
}

// Sparkline (internal)

const SPARKLINE_THEME_COLORS: Record<
  NonNullable<MetricCardSparkline["theme"]>,
  string
> = {
  success: "var(--text-color-kumo-success)",
  danger: "var(--text-color-kumo-danger)",
  neutral: "var(--text-color-kumo-subtle)",
};

const DEFAULT_SPARKLINE_COLOR = "var(--color-kumo-brand)";

function Sparkline({ data, theme, color, yMin, yMax }: MetricCardSparkline) {
  const gradientId = useId();

  if (data.length === 0) return null;

  // Ensure at least two points for a meaningful line
  const points = data.length === 1 ? [data[0], data[0]] : data;

  const min = yMin ?? Math.min(...points);
  const max = yMax ?? Math.max(...points);
  const range = max - min || 1; // Avoid division by zero for flat lines

  const height = 32;
  const width = points.length * 8;
  // Vertical padding so the stroke isn't clipped at top or bottom
  const strokePad = 2;

  const resolvedColor =
    color ?? (theme ? SPARKLINE_THEME_COLORS[theme] : DEFAULT_SPARKLINE_COLOR);

  // Map data points to SVG coordinates
  // x range: [-pad, width+pad] — extends beyond viewBox so round caps are clipped
  //   and the visible line starts right at the card edges
  // y range: [strokePad, height - strokePad] — vertical padding to avoid clipping
  const drawHeight = height - strokePad * 2;
  const pad = 2; // extend beyond viewBox to compensate for strokeLinecap clipping
  const coords: [number, number][] = points.map((value, i) => {
    const x = -pad + (i / (points.length - 1)) * (width + pad * 2);
    const y = strokePad + drawHeight * (1 - (value - min) / range);
    return [x, y];
  });

  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");

  const fillPath = `${linePath} L${width + pad},${height} L${-pad},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block h-[30px] w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={resolvedColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={1.0}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Trend indicator (internal)

const DIRECTION_ICONS = {
  up: TrendUpIcon,
  down: TrendDownIcon,
  neutral: ArrowRightIcon,
} as const;

function getTrendColor(direction: MetricCardTrend["direction"], lessIsBetter: boolean, isNeutral: boolean): string {
  if (isNeutral || direction === "neutral") return "text-kumo-subtle";

  const isPositive = lessIsBetter ? direction === "down" : direction === "up";
  return isPositive ? "text-kumo-success" : "text-kumo-danger";
}

function TrendIndicator({ direction, label, lessIsBetter = false, isNeutral = false }: MetricCardTrend) {
  const colorClass = getTrendColor(direction, lessIsBetter, isNeutral);
  const DirectionIcon = DIRECTION_ICONS[direction];

  return (
    <span
      className={cn("inline-flex items-baseline gap-1 text-xs", colorClass)}
    >
      <DirectionIcon size={12} weight="bold" aria-hidden="true" className="self-center" />
      {label}
    </span>
  );
}

// MetricCard

const BASE_CLASSES =
  "flex h-full min-w-[170px] flex-col overflow-hidden rounded-lg bg-kumo-base text-left ring ring-kumo-line";

const CONTENT_CLASSES = "flex flex-col justify-center p-4 gap-px";

const INTERACTIVE_CLASSES =
  "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand";

/**
 * Compact card displaying a single metric with optional trend indicator,
 * sparkline, loading/error states, and tooltip.
 *
 * @example
 * ```tsx
 * <MetricCard label="Requests" value="1.2M" />
 * ```
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="Error Rate"
 *   value="0.12"
 *   unit="%"
 *   trend={{ direction: "up", label: "3.2%", lessIsBetter: true }}
 *   sparkline={{ data: [0.08, 0.09, 0.11, 0.12], theme: "danger" }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <MetricCard label="Health" value={<Badge variant="success">Healthy</Badge>} />
 * ```
 */
export const MetricCard = forwardRef<HTMLElement, MetricCardProps>(
  function MetricCard(
    {
      label,
      value,
      unit,
      trend,
      sparkline,
      href,
      onClick,
      loading = false,
      error = false,
      tooltip,
      tooltipIcon,
      className,
      ...rest
    },
    ref,
  ) {
    const LinkComponent = useLinkComponent();
    const isInteractive = Boolean(href) || Boolean(onClick);

    // Content

    const displayValue = error ? "\u2014" : value;
    const isTextValue =
      displayValue == null ||
      typeof displayValue === "string" ||
      typeof displayValue === "number";
    const showSparkline = !loading && !error && sparkline;

    const TooltipIconComponent = tooltipIcon ?? InfoIcon;

    const labelRow = (
      <Text
        DANGEROUS_className="flex items-center gap-1.5 font-normal"
        as="span"
        size="sm"
        variant="secondary"
      >
        {label}
        {tooltip && (
          <Tooltip
            content={tooltip}
            render={
              <Button
                variant="ghost"
                size="xs"
                shape="square"
                aria-label="More information"
                className="text-kumo-subtle"
              >
                <TooltipIconComponent size={14} />
              </Button>
            }
          />
        )}
      </Text>
    );

    const valueRow = loading ? (
      <SkeletonLine minWidth={40} maxWidth={70} blockHeight="1.75rem" />
    ) : (
      <div
        className={cn(
          "flex gap-2",
          isTextValue ? "items-baseline" : "items-center",
        )}
      >
        <div
          className={cn(
            "flex gap-0.5",
            isTextValue ? "items-baseline" : "items-center",
          )}
        >
          {isTextValue ? (
            <span className="text-xl font-semibold leading-7 tabular-nums">
              {displayValue}
            </span>
          ) : (
            displayValue
          )}
          {!error && unit && isTextValue && (
            <Text as="span" size="sm" variant="secondary">
              {unit}
            </Text>
          )}
        </div>
        {!error && trend && <TrendIndicator {...trend} />}
      </div>
    );

    const content = (
      <>
        <div className={cn(CONTENT_CLASSES, showSparkline && "pb-3", !isTextValue && "gap-1.5")}>
          {labelRow}
          {valueRow}
        </div>
        {showSparkline && (
          <div className="pointer-events-none mt-auto h-[30px] w-full overflow-hidden">
            <Sparkline {...sparkline} />
          </div>
        )}
      </>
    );

    // Polymorphic element

    const sharedClassName = cn(
      BASE_CLASSES,
      isInteractive && INTERACTIVE_CLASSES,
      className,
    );

    if (href) {
      return (
        <LinkComponent
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          to={href}
          onClick={onClick}
          className={cn(sharedClassName, "no-underline")}
          {...(rest as HTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </LinkComponent>
      );
    }

    if (onClick) {
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          className={sharedClassName}
          {...(rest as HTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={sharedClassName}
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        {content}
      </div>
    );
  },
);

MetricCard.displayName = "MetricCard";
