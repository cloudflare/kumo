import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  isValidElement,
} from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import {
  BannerAction,
  type BannerActionSize,
  BannerActionContext,
} from "./banner-action";

/** Structural base styles applied to all banners; size-specific spacing/alignment lives in `KUMO_BANNER_VARIANTS.size`. */
export const KUMO_BANNER_BASE_STYLES = "flex w-full";

/** Banner variant definitions mapping style options to their Tailwind classes and descriptions. */
export const KUMO_BANNER_VARIANTS = {
  variant: {
    default: {
      classes: "bg-kumo-info-tint text-kumo-info",
      iconClasses: "fill-kumo-info",
      description: "Informational banner for general messages",
    },
    alert: {
      classes: "bg-kumo-warning-tint text-kumo-warning",
      iconClasses: "fill-kumo-warning",
      description: "Warning banner for cautionary messages",
    },
    error: {
      classes: "bg-kumo-danger-tint text-kumo-danger",
      iconClasses: "fill-kumo-danger",
      description: "Error banner for critical issues",
    },
    secondary: {
      classes: "bg-kumo-contrast/5 text-kumo-default/70",
      iconClasses: "fill-kumo-interact",
      description: "Neutral banner for secondary messages",
    },
  },
  size: {
    base: {
      classes: "items-start gap-3 rounded-lg px-4 py-3 text-base",
      description: "Default banner size",
    },
    sm: {
      classes: "items-center gap-2 rounded-md px-3 py-2 text-sm",
      description: "Compact banner for dialogs and tight spaces",
    },
  },
} as const;

export const KUMO_BANNER_DEFAULT_VARIANTS = {
  variant: "default",
  size: "base",
} as const;

// Derived types from KUMO_BANNER_VARIANTS
export type KumoBannerVariant = keyof typeof KUMO_BANNER_VARIANTS.variant;
export type KumoBannerSize = keyof typeof KUMO_BANNER_VARIANTS.size;

/**
 * Per-size render-site classes not carried by `bannerVariants` (which only emits
 * the container classes). `row` is the title↔action flex gap, `icon` the icon
 * wrapper height, `description` the description text size, and `action` the size
 * that child `Banner.Action`s inherit via {@link BannerActionContext}.
 */
const BANNER_SIZE_PARTS: Record<
  KumoBannerSize,
  { row: string; icon: string; description: string; action: BannerActionSize }
> = {
  base: {
    row: "gap-3",
    icon: "h-[1.375em]",
    description: "text-sm",
    action: "sm",
  },
  sm: {
    row: "gap-2",
    icon: "h-[1.25em]",
    description: "text-xs",
    action: "xs",
  },
};

// The `Banner.Action` CTA compound lives in ./banner-action
// and is attached to `Banner` via Object.assign at the bottom of this file.
export type {
  BannerActionVariant,
  BannerActionSize,
  BannerActionProps,
} from "./banner-action";

export interface KumoBannerVariantsProps {
  /**
   * Visual style of the banner.
   * - `"default"` — Informational banner for general messages
   * - `"alert"` — Warning banner for cautionary messages
   * - `"error"` — Error banner for critical issues
   * - `"secondary"` — Neutral banner for secondary messages
   * @default "default"
   */
  variant?: KumoBannerVariant;
  /**
   * Size of the banner.
   * - `"base"` — Default full-size banner
   * - `"sm"` — Compact banner for dialogs and other tight spaces
   * @default "base"
   */
  size?: KumoBannerSize;
}

export function bannerVariants({
  variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
  size = KUMO_BANNER_DEFAULT_VARIANTS.size,
}: KumoBannerVariantsProps = {}) {
  const resolvedVariant = resolveVariant(
    KUMO_BANNER_VARIANTS.variant,
    variant,
    KUMO_BANNER_DEFAULT_VARIANTS.variant,
  );
  const resolvedSize = resolveVariant(
    KUMO_BANNER_VARIANTS.size,
    size,
    KUMO_BANNER_DEFAULT_VARIANTS.size,
  );

  return cn(
    // Structural base styles (exported as KUMO_BANNER_BASE_STYLES for Figma plugin)
    KUMO_BANNER_BASE_STYLES,
    // Apply variant styles from KUMO_BANNER_VARIANTS
    resolvedVariant.classes,
    // Apply size styles (spacing / radius / text) from KUMO_BANNER_VARIANTS
    resolvedSize.classes,
  );
}

// Legacy enum for backwards compatibility
export enum BannerVariant {
  DEFAULT,
  ALERT,
  ERROR,
}

/**
 * Banner component props.
 *
 * @example
 * ```tsx
 * <Banner title="Update available" description="A new version is ready to install." />
 * <Banner variant="alert" title="Session expiring" description="Your session will expire soon." />
 * <Banner variant="error" title="Save failed" description="We couldn't save your changes." />
 * ```
 */
export interface BannerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  /** Icon element rendered before the banner content (e.g. from `@phosphor-icons/react`). */
  icon?: ReactNode;
  /** Primary heading text for the banner. Use for i18n string injection. */
  title?: string;
  /** Secondary description text displayed below the title. Use for i18n string injection. */
  description?: ReactNode;
  /**
   * Action slot rendered at the trailing end of the banner (e.g. a CTA button or link).
   * Use `Banner.Action` for accent-aware CTAs that self-style to the banner
   * variant; other nodes are rendered as-is. Multiple actions can be passed in a
   * Fragment. Only used in structured mode (with `title` or `description`).
   */
  action?: ReactNode;
  /** @deprecated Use `title` and `description` instead. Will be removed in a future major version. */
  text?: string;
  /** @deprecated Use `title` and `description` instead for better i18n support. */
  children?: ReactNode;
  /**
   * Visual style of the banner.
   * - `"default"` — Informational blue banner for general messages
   * - `"alert"` — Warning yellow banner for cautionary messages
   * - `"error"` — Error red banner for critical issues
   * - `"secondary"` — Neutral banner for secondary messages
   * @default "default"
   */
  variant?: KumoBannerVariant;
  /**
   * Size of the banner. A `"sm"` banner uses tighter spacing and smaller text,
   * and sets its `Banner.Action` children to the `"xs"` size — suited to
   * dialogs and other tight spaces.
   * @default "base"
   */
  size?: KumoBannerSize;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

/**
 * Full-width message bar for informational, warning, or error notices.
 * Supports structured title/description for i18n, or simple children for basic usage.
 *
 * @example
 * ```tsx
 * // Structured (recommended for i18n)
 * <Banner
 *   variant="alert"
 *   icon={<WarningCircle />}
 *   title="Review required"
 *   description="Please review your billing information."
 * />
 *
 * // Simple (backwards compatible)
 * <Banner variant="alert" icon={<WarningCircle />}>
 *   Review your billing information.
 * </Banner>
 * ```
 */
const BannerRoot = forwardRef<HTMLDivElement, BannerProps>(function BannerRoot(
  {
    icon,
    title,
    description,
    action,
    children,
    text,
    variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
    size = KUMO_BANNER_DEFAULT_VARIANTS.size,
    className,
    ...props
  },
  ref,
) {
  const variantConfig = resolveVariant(
    KUMO_BANNER_VARIANTS.variant,
    variant,
    KUMO_BANNER_DEFAULT_VARIANTS.variant,
  );
  const sizeParts = BANNER_SIZE_PARTS[size];
  // Compact banners keep the title and description on one line (inline spans)
  // rather than stacking them, to stay short in dialogs and other tight spaces.
  const isCompact = size === "sm";

  // Structured mode: title and/or description provided
  if (title || description) {
    return (
      <BannerActionContext.Provider value={{ variant, size: sizeParts.action }}>
        <div
          ref={ref}
          className={cn(bannerVariants({ variant, size }), className)}
          {...props}
        >
          {icon && (
            <span
              className={cn(
                "shrink-0 flex items-center",
                sizeParts.icon,
                variantConfig.iconClasses,
              )}
            >
              {icon}
            </span>
          )}
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center justify-between",
              sizeParts.row,
              !title && "pt-px",
            )}
          >
            {isCompact ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                {title && (
                  <span className="font-medium leading-snug">{title}</span>
                )}
                {description && (
                  <span className={cn(sizeParts.description, "leading-snug")}>
                    {description}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {title && <p className="font-medium leading-snug">{title}</p>}
                {description && (
                  <div className={cn(sizeParts.description, "leading-snug")}>
                    {isValidElement(description) ? (
                      description
                    ) : (
                      <p>{description}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {action != null && (
              <div className="flex shrink-0 items-center gap-2">{action}</div>
            )}
          </div>
        </div>
      </BannerActionContext.Provider>
    );
  }

  // Legacy mode: children or text prop
  const value = children ?? text;
  const content = isValidElement(value) ? value : <p>{value}</p>;

  return (
    <BannerActionContext.Provider value={{ variant, size: sizeParts.action }}>
      <div
        ref={ref}
        className={cn(bannerVariants({ variant, size }), className)}
        {...props}
      >
        {icon && (
          <span className={cn("shrink-0", variantConfig.iconClasses)}>
            {icon}
          </span>
        )}
        {content}
      </div>
    </BannerActionContext.Provider>
  );
});

BannerRoot.displayName = "Banner";

/**
 * Full-width message bar with an optional trailing CTA slot.
 *
 * `Banner.Action` is an accent-aware CTA button
 * (`variant="primary" | "secondary" | "ghost"`).
 */
export const Banner = Object.assign(BannerRoot, {
  Action: BannerAction,
});
