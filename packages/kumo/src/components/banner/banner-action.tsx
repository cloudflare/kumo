import {
  type CSSProperties,
  createContext,
  forwardRef,
  useContext,
} from "react";
import {
  Button,
  type ButtonProps,
  type KumoButtonSize,
  type KumoButtonVariant,
} from "../button/button";
import { cn } from "../../utils/cn";
import type { KumoBannerVariant } from "./banner";

/**
 * Visual variant for a `Banner.Action`, aligned with `Button`'s `variant` naming.
 * - `"secondary"` — accent-tinted fill with an accent hairline (default).
 * - `"primary"` — filled accent gradient; reserve for banners whose CTA is the
 *   single most important action on the page, as it competes with page-level CTAs.
 * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
 */
export type BannerActionVariant = Extract<
  KumoButtonVariant,
  "primary" | "secondary" | "ghost"
>;

/**
 * Size of a `Banner.Action`, matching the equivalent `Button` size specs.
 * - `"xs"` — extra small for dense/compact banners.
 * - `"sm"` — small (default), the standard banner CTA size.
 */
export type BannerActionSize = Extract<KumoButtonSize, "xs" | "sm">;

/** Value shared from the `Banner` root to its `Banner.Action` children. */
export interface BannerActionContextValue {
  /** Banner variant, used to pick the matching accent color. */
  variant: KumoBannerVariant;
  /** Action size derived from the banner's own size. */
  size: BannerActionSize;
}

/**
 * Propagates the banner's variant and action size to `Banner.Action`
 * children so each CTA can self-style without prop drilling:
 * - `variant` — selects the matching accent color.
 * - `size` — a compact `size="sm"` banner renders actions at `"xs"`, and a
 *   `"base"` banner renders them at `"sm"`.
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
 * Per-banner-variant colors passed to the underlying `Button`.
 *
 * `secondary` is the default CTA treatment: an accent-tinted fill over the banner's
 * already-tinted surface plus an accent hairline, so the action reads as a button
 * without shouting over the message. Hover deepens both the fill and the hairline.
 *
 * The label uses the explicit `text-kumo-*` token rather than `text-inherit`. For the
 * accent banners this matches what they already set on the container, but the neutral
 * `secondary` banner dims its body text to `text-kumo-default/70`, and inheriting that
 * made the chip read muddy against the tinted fill.
 *
 * Hover colors are prefixed with `not-disabled:` so they match the modifier set on
 * `Button`'s own `not-disabled:hover:*` outline defaults — that lets tailwind-merge
 * dedupe them and keeps hover inert on a disabled or loading action.
 */
const BANNER_ACTION_ACCENTS: Record<
  KumoBannerVariant,
  { accent: string; secondary: string; ghost: string }
> = {
  default: {
    accent: "var(--color-kumo-info)",
    secondary:
      "bg-kumo-info/12 text-kumo-info ring-kumo-info/40 fill-kumo-info not-disabled:hover:text-kumo-info not-disabled:hover:ring-kumo-info/60 not-disabled:hover:bg-kumo-info/20",
    ghost:
      "text-kumo-info fill-kumo-info not-disabled:hover:bg-kumo-info/12 not-disabled:hover:text-kumo-info",
  },
  alert: {
    accent: "var(--color-kumo-warning)",
    secondary:
      "bg-kumo-warning/12 text-kumo-warning ring-kumo-warning/40 fill-kumo-warning not-disabled:hover:text-kumo-warning not-disabled:hover:ring-kumo-warning/60 not-disabled:hover:bg-kumo-warning/20",
    ghost:
      "text-kumo-warning fill-kumo-warning not-disabled:hover:bg-kumo-warning/12 not-disabled:hover:text-kumo-warning",
  },
  error: {
    accent: "var(--color-kumo-danger)",
    secondary:
      "bg-kumo-danger/12 text-kumo-danger ring-kumo-danger/40 fill-kumo-danger not-disabled:hover:text-kumo-danger not-disabled:hover:ring-kumo-danger/60 not-disabled:hover:bg-kumo-danger/20",
    ghost:
      "text-kumo-danger fill-kumo-danger not-disabled:hover:bg-kumo-danger/12 not-disabled:hover:text-kumo-danger",
  },
  secondary: {
    accent: "var(--color-neutral-700, oklch(37.1% 0 0))",
    secondary:
      "bg-kumo-contrast/8 text-kumo-default ring-kumo-focus/30 fill-kumo-subtle not-disabled:hover:text-kumo-strong not-disabled:hover:ring-kumo-focus/45 not-disabled:hover:bg-kumo-contrast/12",
    ghost:
      "text-kumo-default fill-kumo-subtle not-disabled:hover:bg-kumo-contrast/10 not-disabled:hover:text-kumo-strong",
  },
};

function bannerActionAccentVars(accent: string) {
  return {
    "--kumo-button-emphasis-ring": `color-mix(in oklch, ${accent}, black 10%)`,
    "--kumo-button-emphasis-bg": `color-mix(in oklch, ${accent}, white 30%)`,
    "--kumo-button-emphasis-gradient-start": `color-mix(in oklch, ${accent}, white 15%)`,
    "--kumo-button-emphasis-gradient-end": accent,
  } satisfies CSSProperties & Record<`--${string}`, string>;
}

/** Props for {@link BannerAction}. */
type WithBannerActionVariants<Props> = Props extends ButtonProps
  ? Omit<Props, "size" | "variant"> & {
      /**
       * Visual variant of the CTA, aligned with `Button`'s `variant` naming.
       * - `"secondary"` — accent-tinted fill with an accent hairline (default).
       * - `"primary"` — filled accent gradient. Reserve for banners whose CTA is the
       *   single most important action on the page; it competes with page-level CTAs.
       * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
       * @default "secondary"
       */
      variant?: BannerActionVariant;
    }
  : never;

export type BannerActionProps = WithBannerActionVariants<ButtonProps>;

/**
 * A banner CTA built on Kumo's `Button`. It inherits Button's sizing, interaction,
 * loading, and accessibility behavior while supplying banner-specific accent styles.
 *
 * Defaults to the quiet `"secondary"` treatment so the CTA stays subordinate to the
 * banner's message; opt into `variant="primary"` when the action is the page's most
 * important one.
 *
 * @example
 * ```tsx
 * <Banner.Action onClick={retry}>Retry</Banner.Action>
 * <Banner.Action variant="primary" onClick={upgrade}>Upgrade</Banner.Action>
 * <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
 * ```
 */
export const BannerAction = forwardRef<HTMLButtonElement, BannerActionProps>(
  function BannerAction(
    { variant = "secondary", className, style, ...props },
    ref,
  ) {
    const banner = useContext(BannerActionContext);
    const styles = BANNER_ACTION_ACCENTS[banner.variant];
    const buttonVariant = variant === "secondary" ? "outline" : variant;

    return (
      <Button
        ref={ref}
        variant={buttonVariant}
        size={banner.size}
        className={cn(variant !== "primary" && styles[variant], className)}
        style={
          variant === "primary"
            ? { ...bannerActionAccentVars(styles.accent), ...style }
            : style
        }
        {...props}
      />
    );
  },
);

BannerAction.displayName = "Banner.Action";
