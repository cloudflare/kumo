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
  return KUMO_LOADER_VARIANTS.size[size].value;
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
}

/**
 * Animated circular spinner for indicating loading states.
 *
 * @example
 * ```tsx
 * <Loader />
 * ```
 */
export const Loader = ({
  className,
  size = KUMO_LOADER_DEFAULT_VARIANTS.size,
}: LoaderProps) => {
  const sizeValue = loaderVariants({ size });
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      className={className}
      style={{ height: sizeValue, width: sizeValue }}
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="0 150;42 150;42 150"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="0;-16;-59"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
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
