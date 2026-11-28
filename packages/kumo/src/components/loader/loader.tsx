import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

/** Loader size variant definitions mapping sizes to their pixel values. */
export const KUMO_LOADER_VARIANTS = {
  size: {
    sm: {
      value: 16,
      description: "Small loader for inline use",
    },
    base: {
      value: 24,
      description: "Default loader size",
    },
    lg: {
      value: 32,
      description: "Large loader for prominent loading states",
    },
  },
} as const;

export const KUMO_LOADER_DEFAULT_VARIANTS = {
  size: "base",
} as const;

// Derived types from KUMO_LOADER_VARIANTS
export type KumoLoaderSize = keyof typeof KUMO_LOADER_VARIANTS.size;

export interface KumoLoaderVariantsProps {
  /**
   * Size of the loader. Use a preset name or a custom pixel number.
   * - `"sm"` — 16px, small loader for inline use
   * - `"base"` — 24px, default loader size
   * - `"lg"` — 32px, large loader for prominent loading states
   * @default "base"
   */
  size?: KumoLoaderSize | number;
}

export function loaderVariants({
  size = KUMO_LOADER_DEFAULT_VARIANTS.size,
}: KumoLoaderVariantsProps = {}): number {
  if (typeof size === "number") return size;
  return resolveVariant(
    KUMO_LOADER_VARIANTS.size,
    size,
    KUMO_LOADER_DEFAULT_VARIANTS.size,
  ).value;
}

/**
 * Loader component props.
 *
 * @example
 * ```tsx
 * <Loader />
 * <Loader size="sm" />
 * <Loader size={24} />
 * ```
 */
export interface LoaderProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /**
   * Size of the spinner. Use a preset name or a custom pixel number.
   * - `"sm"` — 16px, for inline use
   * - `"base"` — 24px, default size
   * - `"lg"` — 32px, for prominent loading states
   * @default "base"
   */
  size?: KumoLoaderSize | number;
  /**
   * Accessible label for the loader, announced by screen readers.
   * Pass a translated string for internationalization.
   * @default "Loading"
   */
  "aria-label"?: string;
}

/**
 * Animated circular spinner for indicating loading states. The arc turns once
 * every 2s, and stands still when the user prefers reduced motion.
 *
 * @example
 * ```tsx
 * <Loader />
 * ```
 */
export const Loader = ({
  className,
  size = KUMO_LOADER_DEFAULT_VARIANTS.size,
  "aria-label": ariaLabel = "Loading",
}: LoaderProps) => {
  const sizeValue = loaderVariants({ size });
  // The turn is a CSS transform animation, not SVG SMIL: WebKit pauses SMIL
  // when macOS "Auto-play animated images" is off and repaints it on every
  // frame where it runs, but hands a transform animation to the compositor.
  // Keep the timing `linear` (never `steps()`) so WebKit can do that.
  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      className={cn("motion-safe:animate-[spin_2s_linear_infinite]", className)}
      role="status"
      aria-label={ariaLabel}
    >
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="42 150"
      />
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        opacity={0.1}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
