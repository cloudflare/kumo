import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
} from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "../../utils/cn";
import type { KumoBannerVariant } from "./banner";

/**
 * Visual variant for a `Banner.Action`, aligned with `Button`'s `variant` naming.
 * - `"primary"` — filled accent gradient for the main action.
 * - `"secondary"` — transparent with an accent-hued outline (same hue as the banner).
 * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
 */
export type BannerActionVariant = "primary" | "secondary" | "ghost";

/**
 * Size of a `Banner.Action`, matching the equivalent `Button` size specs.
 * - `"xs"` — extra small for dense/compact banners.
 * - `"sm"` — small (default), the standard banner CTA size.
 */
export type BannerActionSize = "xs" | "sm";

/** Value shared from the `Banner` root to its `Banner.Action` children. */
export interface BannerActionContextValue {
  /** Banner variant, used to pick the matching accent color. */
  variant: KumoBannerVariant;
  /** Default action size derived from the banner's own size. */
  size: BannerActionSize;
}

/**
 * Propagates the banner's variant and default action size to `Banner.Action`
 * children so each CTA can self-style without prop drilling:
 * - `variant` — selects the matching accent color.
 * - `size` — a compact `size="sm"` banner defaults its actions to `"xs"`, a
 *   `"base"` banner to `"sm"`; a `size` prop on an individual `Banner.Action`
 *   overrides it.
 *
 * The `Banner` root always overrides these defaults via a Provider; the literals
 * mirror a default, base-size banner (kept as literals to avoid a runtime import
 * cycle with `banner.tsx`).
 */
export const BannerActionContext = createContext<BannerActionContextValue>({
  variant: "default",
  size: "sm",
});

/**
 * Per-size layout classes, mirroring the `xs`/`sm` entries in
 * `KUMO_BUTTON_VARIANTS.size`. `shared` applies in both text and icon-only modes;
 * `text` adds the height + horizontal padding for labelled CTAs; `iconOnly` uses a
 * square (width === height) instead of padding. For icon-only `xs` we use `size-5`
 * (equal to its `h-5`) rather than Button's `size-3.5`, which is too small to be a
 * usable banner target.
 */
const BANNER_ACTION_SIZES: Record<
  BannerActionSize,
  { shared: string; text: string; iconOnly: string }
> = {
  xs: {
    shared: "gap-1 rounded-sm text-xs items-center",
    text: "h-5.5 px-1.5",
    iconOnly: "size-5",
  },
  sm: {
    shared: "gap-1 rounded-md text-xs",
    text: "h-7 px-2",
    iconOnly: "size-6.5",
  },
};

/**
 * Per-banner-variant colors for `Banner.Action`.
 */

const BANNER_ACTION_ACCENTS: Record<
  KumoBannerVariant,
  { accent: string; primaryText: string; secondary: string; ghost: string }
> = {
  default: {
    accent: "var(--color-kumo-info)",
    primaryText: "text-white",
    secondary: "ring ring-kumo-info/50 fill-kumo-info hover:bg-kumo-info/10",
    ghost: "fill-kumo-info hover:bg-kumo-info/10",
  },
  alert: {
    accent: "var(--color-kumo-warning)",
    primaryText: "text-white",
    secondary:
      "ring ring-kumo-warning/50 fill-kumo-warning hover:bg-kumo-warning/10",
    ghost: "fill-kumo-warning hover:bg-kumo-warning/10",
  },
  error: {
    accent: "var(--color-kumo-danger)",
    primaryText: "text-white",
    secondary: "ring ring-kumo-danger/50 fill-kumo-danger hover:bg-kumo-danger/10",
    ghost: "fill-kumo-danger hover:bg-kumo-danger/10",
  },
  secondary: {
    accent: "var(--color-neutral-700, oklch(37.1% 0 0))",
    primaryText: "text-white",
    secondary:
      "ring ring-kumo-focus/20 fill-kumo-subtle hover:bg-kumo-contrast/10",
    ghost: "fill-kumo-subtle hover:bg-kumo-contrast/10",
  },
};

const BANNER_ACTION_PRIMARY_GRADIENT =
  "bg-linear-to-b from-(--kumo-banner-cta-start) to-(--kumo-banner-cta-end) shadow-[inset_0_1px_0_0_var(--kumo-banner-cta-bg)] ring-1 ring-inset ring-(--kumo-banner-cta-ring) hover:from-(--kumo-banner-cta-bg)";

function bannerCtaAccentVars(accent: string): CSSProperties {
  return {
    "--kumo-banner-cta-ring": `color-mix(in oklch, ${accent}, grey 10%)`,
    "--kumo-banner-cta-bg": `color-mix(in oklch, ${accent}, white 30%)`,
    "--kumo-banner-cta-start": `color-mix(in oklch, ${accent}, white 10%)`,
    "--kumo-banner-cta-end": accent,
  } as CSSProperties;
}

/**
 * Layout container for one or more `Banner.Action` CTAs. Pass it to the Banner
 * `action` slot. Renders a trailing flex row; each child `Banner.Action` reads the
 * banner variant from context and self-styles to the matching accent.
 *
 * @example
 * ```tsx
 * <Banner
 *   variant="error"
 *   title="Save failed"
 *   description="We couldn't save your changes."
 *   action={
 *     <Banner.Actions>
 *       <Banner.Action onClick={retry}>Retry</Banner.Action>
 *       <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
 *     </Banner.Actions>
 *   }
 * />
 * ```
 */
export const BannerActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function BannerActions({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
});

BannerActions.displayName = "Banner.Actions";

/** Props for {@link BannerAction}. */
export interface BannerActionProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /**
   * Visual variant of the CTA, aligned with `Button`'s `variant` naming.
   * - `"primary"` — filled accent gradient for the main action (default).
   * - `"secondary"` — transparent with an accent-hued outline matching the banner.
   * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
   * @default "primary"
   */
  variant?: BannerActionVariant;
  /**
   * Size of the CTA, matching `Button`'s `xs`/`sm` sizes.
   * - `"xs"` — extra small for dense banners.
   * - `"sm"` — small.
   *
   * Defaults to the banner's size (a `size="sm"` banner uses `"xs"`, a `"base"`
   * banner uses `"sm"`); set this to override the inherited size for one action.
   */
  size?: BannerActionSize;
  /** Optional leading icon (e.g. from `@phosphor-icons/react`). */
  icon?: ReactNode;
  /** Render prop for polymorphism (e.g. render as a link). Forwarded to Base UI Button. */
  render?: ComponentProps<typeof BaseButton>["render"];
}

/**
 * A banner CTA button built on the Base UI Button primitive. It reads the banner
 * variant from `BannerActionContext` and pulls its accent/text color from
 * {@link BANNER_ACTION_ACCENTS} — the single place to iterate on CTA colors. Because
 * it owns its own color classes (rather than the shared `Button` component's forced
 * `!text-white`), the label stays legible on any banner accent in light and dark.
 *
 * @example
 * ```tsx
 * <Banner.Action onClick={retry}>Retry</Banner.Action>
 * <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
 * ```
 */
export const BannerAction = forwardRef<HTMLButtonElement, BannerActionProps>(
  function BannerAction(
    { variant = "primary", size, icon, children, className, style, ...props },
    ref,
  ) {
    const banner = useContext(BannerActionContext);
    const styles = BANNER_ACTION_ACCENTS[banner.variant];
    const sizing = BANNER_ACTION_SIZES[size ?? banner.size];

    return (
      <BaseButton
        ref={ref}
        className={cn(
          "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current disabled:pointer-events-none disabled:opacity-50",
          sizing.shared,
          // Icon-only (no children) => square; otherwise height + horizontal padding.
          icon != null && children == null ? sizing.iconOnly : sizing.text,
          variant === "primary"
            ? cn(BANNER_ACTION_PRIMARY_GRADIENT, styles.primaryText)
            : variant === "secondary"
              ? styles.secondary
              : styles.ghost,
          className,
        )}
        // Consumer `style` wins over the injected accent vars.
        style={
          variant === "primary"
            ? { ...bannerCtaAccentVars(styles.accent), ...style }
            : style
        }
        {...props}
      >
        {icon && (
          <span className="flex shrink-0 items-center" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </BaseButton>
    );
  },
);

BannerAction.displayName = "Banner.Action";
